const express = require('express');
const authenticateRoute = require('../middleware/authMiddleware');
const { createOneOnOneChat } = require('../controller/oneOnOneChatController');

const router = express.Router();

router.post('/createOneOnOneChat', authenticateRoute, createOneOnOneChat);

module.exports = router;
