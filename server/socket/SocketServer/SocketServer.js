const { Server } = require("socket.io");
const { db } = require("../../config/firebaseConfig");
const RoomChat = require("../roomChat")

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Change this to your frontend URL for security
      methods: ["GET", "POST"]
    }
  });
  
  

  // Namespace for chat functionality
  const chatNamespace = io.of("/chat");
  
  chatNamespace.on("connection", (socket) => {
    RoomChat(socket, chatNamespace, db)
  });
};
