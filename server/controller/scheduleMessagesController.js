const db_con = require('../connections');

/**
 * Inserts the scheduled message into the database
 * @param {Object} req - The request object received from the client
 * @param {Object} res - The response object that sends back data to the client
 */
async function insertScheduledMessages(req, res) {
    const { 
        chatId,
        message,
        senderId,
        recipientId,
        message_type,
        timestamp,
        file_path,
        file_name,
        scheduledTime,
        status
    } = req.body;


    const now = new Date(scheduledTime);
    const padTo2Digits = (num) => num.toString().padStart(2, '0');
    // formatting scheduledTime to be compatible with MySQL DateTime format
    const formattedScheduledTime = [
        now.getFullYear(),
        padTo2Digits(now.getMonth() + 1), 
        padTo2Digits(now.getDate()),
        ].join('-') + ' ' + [
        padTo2Digits(now.getHours()),
        padTo2Digits(now.getMinutes()),
        padTo2Digits(now.getSeconds()),
        ].join(':');

    try {
        const [result] = await db_con.promise().query(`
            INSERT INTO message 
            (chat_id, message, sender_id, recipient_id, message_type,
                 file_path, file_name, scheduled_time, timestamp, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [chatId, message, senderId, recipientId, message_type, file_path, file_name, formattedScheduledTime, timestamp, status]);

        res.json({ success: true, messageId: result.insertId });
    } catch (error) {
        console.error("Error inserting scheduled message: ", error);
        res.status(500).send("Internal Server Error");
    }
}

/**
 * Fetches messages that have been specifically scheduled by the user
 * (i.e., the status of the message is pending indicating that the message
 * has not been sent yet).
 * @param {Object} req - The request object received from the client
 * @param {Object} res - The response object that sends back data to the client
 */
async function getScheduledMessages(req, res) {
    const { chatId } = req.params;

    try {
        const [results] = await db_con.promise().query(`
            SELECT * FROM message WHERE chat_id = ? AND status = 'pending'
        `, [chatId]);

        res.json({ messages: results });
    } catch (error) {
        console.error("Error fetching messages: ", error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = { insertScheduledMessages, getScheduledMessages };
