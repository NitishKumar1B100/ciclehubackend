require("dotenv").config();

const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const AGORA_APP_ID = process.env.AGORA_APP_ID ;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE ;

const EXPIRE_TIME = 3600; // 1 hour in seconds

module.exports = (socket, chatNamespace, db) =>{

  socket.on("join_room", async ({ uid, userDetails, roomId }) => {
    const roomRef = db.collection("rooms").doc(roomId);
    const roomSnapshot = await roomRef.get();
    if (!roomSnapshot.exists) return;
  
    const roomData = roomSnapshot.data();
    const currentTime = Math.floor(Date.now() / 1000);
  
    let { token, privilegeExpireTime, channelName } = roomData;
  
    // 🔐 Update token only if expired
    if (!privilegeExpireTime || currentTime >= privilegeExpireTime) {
      privilegeExpireTime = currentTime + EXPIRE_TIME;
      token = RtcTokenBuilder.buildTokenWithUid(
        AGORA_APP_ID,
        AGORA_APP_CERTIFICATE,
        channelName,
        0,
        RtcRole.PUBLISHER,
        privilegeExpireTime
      );
  
      // Update token and expire time in one call
      await roomRef.update({ token, privilegeExpireTime });
    }
  
    // 🔄 Disconnect old sockets in parallel
    const activeSocketsSnapshot = await db
      .collection("activeSockets")
      .where("uid", "==", uid)
      .get();
  
    const oldSocketsCleanup = activeSocketsSnapshot.docs.map(async (doc) => {
      const oldSocketId = doc.id;
      const { roomId: oldRoomId, userDetails: oldDetails } = doc.data();
  
      const oldRoomRef = db.collection("rooms").doc(oldRoomId);
      const oldRoomSnap = await oldRoomRef.get();
      if (!oldRoomSnap.exists) return;
  
      const oldJoinedUsers = oldRoomSnap.data().room?.joinedUsers || [];
      const updatedUsers = oldJoinedUsers.filter(u => u.socketId !== oldSocketId);
  
      await oldRoomRef.update({ "room.joinedUsers": updatedUsers });
  
      chatNamespace.to(oldRoomId).emit("user_left", {
        message: oldDetails.name,
        users: updatedUsers,
      });
  
      const oldSocket = chatNamespace.sockets.get(oldSocketId);
      if (oldSocket) oldSocket.leave(oldRoomId);
  
      await db.collection("activeSockets").doc(oldSocketId).delete();
    });
  
    // Run all socket cleanup in parallel
    await Promise.all(oldSocketsCleanup);
  
    // 🛡️ Update joinedUsers via transaction
    await db.runTransaction(async (transaction) => {
      const roomDoc = await transaction.get(roomRef);
      if (!roomDoc.exists) return;
  
      const currentUsers = roomDoc.data().room?.joinedUsers || [];
      const filtered = currentUsers.filter(u => u.uid !== uid);
  
      filtered.push({
        uid,
        userDetails,
        socketId: socket.id,
        time: new Date().toISOString(),
      });
  
      transaction.update(roomRef, {
        "room.joinedUsers": filtered,
      });
    });
  
    // 🔌 Save active socket
    await db.collection("activeSockets").doc(socket.id).set({
      roomId,
      uid,
      userDetails,
      joinedAt: new Date(),
    });
  
    socket.join(roomId);
  
    // ✅ Emit joined event
    const finalRoomSnap = await roomRef.get();
    const updatedUsers = finalRoomSnap.data().room?.joinedUsers || [];
  
    chatNamespace.to(roomId).emit("user_joined", {
      users: updatedUsers,
      joinedUser: userDetails,
      token,
    });
  });
  
  socket.on("kick_user", async ({ uid, name,roomId }) => {
    // Remove from DB and get the old socket  
    const roomRef = db.collection("rooms").doc(roomId);
    const roomSnap = await roomRef.get();
    if (!roomSnap.exists) return;

      const users = roomSnap.data().room?.joinedUsers || [];
      const updated = users.filter(u => u.uid !== uid);
      // Inform everyone else
      chatNamespace.to(roomId).emit("user_left", {
        message: name,
        users: updated,
      });
    
  });
  
  
  

  socket.on("send_message", ({ sender, roomId, message }) => {

    // 🔹 Ensure the message is sent to all users in the room
    chatNamespace.to(roomId).emit("receive_message", {
      sender: sender,
      message: message,
    });
  });

  
  socket.on("disconnect", async () => {
    const socketDoc = await db.collection("activeSockets").doc(socket.id).get();
  
    if (!socketDoc.exists) return;
  
    const { roomId, uid, userDetails } = socketDoc.data();
    const roomRef = db.collection("rooms").doc(roomId);
    const roomSnapshot = await roomRef.get();
  
    if (!roomSnapshot.exists) return;
  
    const joinedUsers = roomSnapshot.data().room?.joinedUsers || [];
  
    const updatedUsers = joinedUsers.filter(u => u.socketId !== socket.id);
  
    await roomRef.update({
      "room.joinedUsers": updatedUsers
    });
  
    await db.collection("activeSockets").doc(socket.id).delete(); // cleanup
  
    chatNamespace.to(roomId).emit("user_left", {
      message: userDetails.name,
      users: updatedUsers
    });
  });
  
  
}