const { Server } = require("socket.io");
const { db } = require("../../config/firebaseConfig");
const RoomChat = require("../roomChat")
const roomRecover = require('../roomRecover')

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Change this to your frontend URL for security
      methods: ["GET", "POST"]
    }
  });
  
    // Namespace for room management
    const roomNamespace = io.of("/rooms");
  
    roomNamespace.on("connection", async (socket) => {
      roomRecover(socket, roomNamespace, db);
    });
  

  // Namespace for chat functionality
  const chatNamespace = io.of("/chat");
  
  chatNamespace.on("connection", (socket) => {
    RoomChat(socket, chatNamespace, db)
  });
};
