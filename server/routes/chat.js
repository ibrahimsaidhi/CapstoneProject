const express = require('express');
const chatController = require('../controller/chatController');
const router = express.Router();

router.get('/:chatId', chatController.getMessages);
router.get('/getParticipants/:chatId', chatController.getChatParticipants);

module.exports = router;
