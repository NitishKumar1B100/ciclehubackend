require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");

// Import files
const roomRoutes = require("./server/RoomRoutes/roomRoutes");
const userRoutes = require("./server/UserRoutes/userRoutes");
const SocketSetUp = require('./server/socket/SocketServer/SocketServer')

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use("/api/rooms", roomRoutes);
app.use('/api/users', userRoutes)

// Socket.io
SocketSetUp(server)


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
