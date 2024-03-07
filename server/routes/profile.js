const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const profileController = require("../controller/profileController");

router.get('/details', authenticate, profileController.getUserProfile);
router.put('/updateImage', authenticate, profileController.setProfilePicture);
router.put('/updatePassword', authenticate, profileController.setNewPassword)

module.exports = router;