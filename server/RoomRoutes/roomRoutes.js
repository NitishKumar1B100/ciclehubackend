require("dotenv").config();

const express = require("express");
const { db } = require("../config/firebaseConfig");
const router = express.Router();
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");


const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;


// API to create a new room
router.post("/create", async (req, res) => {
  try {
    const roomRef = db.collection("rooms").doc();
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
      createdAt: admin.firestore.Timestamp.now(),
      expiresAt: admin.firestore.Timestamp.fromMillis(
        Date.now() + 10 * 1000 // 10 seconds
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

module.exports = router;
