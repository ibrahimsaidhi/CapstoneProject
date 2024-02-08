const express = require('express');
const authenticateRoute = require('../middleware/authMiddleware');
const { createGroupChat } = require('../controller/groupChatController');

const router = express.Router();

router.post('/createGroupChat', authenticateRoute, createGroupChat);

module.exports = router;
