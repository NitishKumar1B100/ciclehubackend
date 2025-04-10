const express = require("express");
const { db } = require("../config/firebaseConfig");
const router = express.Router();


router.get('/check-friend-status', async (req, res) => {
    const { uid, otherUid } = req.query;
  
    if (!uid || !otherUid) {
      return res.status(400).json({ error: 'Missing user IDs' });
    }
  
    try {
      const userDoc = await db.collection('users').doc(uid).get();
      const otherUserDoc = await db.collection('users').doc(otherUid).get();
  
      if (!userDoc.exists || !otherUserDoc.exists) {
        return res.status(404).json({ error: 'User(s) not found' });
      }
  
      const userData = userDoc.data();
      const otherUserData = otherUserDoc.data();
  
      const userFollowsOther = userData.following?.includes(otherUid);
      const otherFollowsUser = otherUserData.following?.includes(uid);
  
      const isFriend = userFollowsOther && otherFollowsUser;
  
      return res.json({ isFriend });
  
    } catch (error) {
      console.error('Error checking friend status:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
module.exports = router;
