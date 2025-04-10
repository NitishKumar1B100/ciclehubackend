require("dotenv").config();

const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const AGORA_APP_ID = process.env.AGORA_APP_ID ;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE ;

const EXPIRE_TIME = 3600; // 1 hour in seconds

module.exports = (socket, chatNamespace, db) =>{

  socket.on("join_room", async ({ uid, userDetails, roomId }) => {
    const roomRef = db.collection("rooms").doc(roomId);
    const roomSnapshot = await roomRef.get();

    if (!roomSnapshot.exists) {
      return;
    }

    const roomData = roomSnapshot.data();
    const roomDetails = roomData.room || {};
    let joinedUsers = roomDetails.joinedUsers || [];

    // 🔐 Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    let { token, privilegeExpireTime, channelName } = roomData;

    if (!privilegeExpireTime || currentTime >= privilegeExpireTime) {
      // console.log("Token expired. Generating new one...");

      const newExpireTime = currentTime + EXPIRE_TIME;
      const newToken = RtcTokenBuilder.buildTokenWithUid(
        AGORA_APP_ID,
        AGORA_APP_CERTIFICATE,
        channelName,
        0, // uid
        RtcRole.PUBLISHER,
        newExpireTime
      );

      token = newToken;
      privilegeExpireTime = newExpireTime;

      await roomRef.update({
        token: newToken,
        privilegeExpireTime
      });
    }

    // Disconnect any existing sockets for same user
    const activeSocketsSnapshot = await db.collection("activeSockets")
      .where("uid", "==", uid)
      .get();

    for (const doc of activeSocketsSnapshot.docs) {
      const oldSocketId = doc.id;
      const { roomId: oldRoomId, userDetails: oldDetails } = doc.data();

      const oldRoomRef = db.collection("rooms").doc(oldRoomId);
      const oldRoomSnap = await oldRoomRef.get();
      if (oldRoomSnap.exists) {
        const oldJoinedUsers = oldRoomSnap.data().room?.joinedUsers || [];
        const updatedUsers = oldJoinedUsers.filter(u => u.socketId !== oldSocketId);

        await oldRoomRef.update({
          "room.joinedUsers": updatedUsers
        });

        chatNamespace.to(oldRoomId).emit("user_left", {
          message: `${oldDetails.name} has left the chat.`,
          users: updatedUsers
        });

        const oldSocket = chatNamespace.sockets.get(oldSocketId);
        if (oldSocket) {
          oldSocket.leave(oldRoomId);
        }
      }

      await db.collection("activeSockets").doc(oldSocketId).delete();
    }

    // Add the new user to the room
    joinedUsers = joinedUsers.filter(u => u.uid !== uid);
    joinedUsers.push({
      uid,
      userDetails,
      socketId: socket.id,
      time: new Date().toISOString()
    });

    await roomRef.update({
      "room.joinedUsers": joinedUsers
    });

    await db.collection("activeSockets").doc(socket.id).set({
      roomId: roomId,
      uid,
      userDetails,
      joinedAt: new Date()
    });

    socket.join(roomId);


    chatNamespace.to(roomId).emit("user_joined", {
      users: joinedUsers,
      joinedUser: userDetails,
      token,
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
      message: `${userDetails} has left the chat.`,
      users: updatedUsers
    });
  });
  
  
}