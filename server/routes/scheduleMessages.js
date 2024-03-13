const express = require('express');
const authenticateRoute = require('../middleware/authMiddleware');
const { insertScheduledMessages } = require('../controller/scheduleMessagesController');
const { getScheduledMessages } = require('../controller/scheduleMessagesController');
const router = express.Router();

router.post('/insertScheduledMessages', authenticateRoute, insertScheduledMessages);
router.get('/:chatId', authenticateRoute, getScheduledMessages);

module.exports = router;
