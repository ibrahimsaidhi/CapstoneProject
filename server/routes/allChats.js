const express = require('express');
const router = express.Router();
const allChatsController = require('../controller/allChatsController');

router.get('/:userId', allChatsController.getAllChats);

module.exports = router;
