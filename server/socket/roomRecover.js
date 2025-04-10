module.exports = async (socket, roomNamespace, db) => {

    // Function to fetch rooms from Firestore
    const fetchRooms = async () => {
      const snapshot = await db.collection("rooms").get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    };

    // Send all available rooms to the newly connected user
    socket.on("getRoomList", async () => {
      const rooms = await fetchRooms();
      socket.emit("roomList", rooms);
    });
    

    // Listen for Firestore changes and update users in real time
    db.collection("rooms").onSnapshot((snapshot) => {
      const updatedRooms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      roomNamespace.emit("roomList", updatedRooms); // Send updated room list
    });

    socket.on("disconnect", () => {
      return
    });
}