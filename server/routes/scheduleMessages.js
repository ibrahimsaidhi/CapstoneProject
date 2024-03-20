const express = require('express');
const authenticateRoute = require('../middleware/authMiddleware');
const { 
    insertScheduledMessages, 
    getScheduledMessages, 
    deleteScheduledMessage
} = require('../controller/scheduleMessagesController');
const router = express.Router();

router.post('/insertScheduledMessages', authenticateRoute, insertScheduledMessages);
router.get('/:chatId', authenticateRoute, getScheduledMessages);
router.delete('/:messageId', authenticateRoute, deleteScheduledMessage);

module.exports = router;
