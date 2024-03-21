const db_con = require('../connections');

/**
 * Fetching messages along with the sender's username from the database for a particular chat id.
 * 
 * Only fetches messages that are not scheduled by the user (i.e., they select "Send Now")
 * @param {Object} req - The request object received from the client
 * @param {Object} res - The response object that sends back data to the client
 */
exports.getMessages = function(req, res) {
    const chatId = req.params.chatId;
    
    const query = `
        SELECT m.*, u.username AS sender_username 
        FROM message m
        JOIN users u ON m.sender_id = u.user_id 
        WHERE m.chat_id = ? AND m.status = 'sent'
        ORDER BY m.timestamp ASC`;

    db_con.query(query, [chatId], function(error, messages){
        if (error) {
            console.error("Error fetching chat messages: ", error);
            return res.status(500).send({ message: "Internal server error" });
        }
        console.log(`Messages fetched from the database for chat ID: ${chatId}`);
        res.json(messages);
    });
};

/**
 * Fetches the participants of a chat along with their usernames from the database for a particular chat id.
 * @param {Object} req - The request object received from the client
 * @param {Object} res - The response object that sends back data to the client
 */
exports.getChatParticipants = async function(req, res) {
    const chatId = req.params.chatId;

    try {
        const [participants] = await db_con.promise().query(`
            SELECT u.user_id, u.name, u.username
            FROM chat_participants cp
            JOIN users u ON cp.user_id = u.user_id
            WHERE cp.chat_id = ?
        `, [chatId]);

        res.json({ participants: participants });
    } catch (error) {
        console.error("Error fetching chat participants: ", error);
        res.status(500).send("Internal Server Error");
    }
};


