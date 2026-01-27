require("dotenv").config();

const admin = require("firebase-admin");
const express = require("express");
const { db } = require("../config/firebaseConfig");
const router = express.Router();
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");


const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;


// API to create a new room
router.post("/create", async (req, res) => {
  try {
    const roomRef = db.collection("rooms").doc(); // Generate ID but don’t create yet
    const channelName = roomRef.id;
    
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      0,
      RtcRole.PUBLISHER,
      Math.floor(Date.now() / 1000) + 3600
    );
    
    const newRoom = {
      ...req.body,
      channelName,
      token,
      createdAt: new Date().toISOString(),
      expiresAt: admin.firestore.Timestamp.fromMillis(
        Date.now() + 10 * 1000 
      )
    };
    
    await roomRef.set(newRoom);
    res.status(200).json({ id: roomRef.id, ...newRoom });
    
  } catch (error) {
    res.status(500).json({ error: "Failed to create room." });
  }
});


// API to check if a room exists
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const roomRef = db.collection("rooms").doc(id); // Get room reference
    const roomSnap = await roomRef.get(); // Fetch room document
    
    const roomData = roomSnap.data(); // Get room data

    res.json({ exists: roomSnap.exists, roomData: roomData }); // Send response { exists: true/false }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// room Delete API with owner verification
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.body;

    if (!uid) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const roomRef = db.collection("rooms").doc(id);
    const roomSnap = await roomRef.get();

    if (!roomSnap.exists) {
      return res.status(404).json({ error: "Room not found" });
    }

    const roomData = roomSnap.data();

    if (roomData.room.owner !== uid) {
      return res.status(403).json({ error: "Not room owner" });
    }

    await roomRef.delete();
    res.status(200).json({ success: true });

  } catch (err) {
    res.status(500).json({ error: "Failed to delete room" });
  }
});


module.exports = router;
