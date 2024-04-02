const express = require('express');
const authenticateRoute = require('../middleware/authMiddleware');
const { createGroupChat, addParticipantsToGroupChat } = require('../controller/groupChatController');

const router = express.Router();

router.post('/createGroupChat', authenticateRoute, createGroupChat);
router.post('/addParticipants', authenticateRoute, addParticipantsToGroupChat);

module.exports = router;
