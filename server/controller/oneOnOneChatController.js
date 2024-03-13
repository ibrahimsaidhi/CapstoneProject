const db_con = require('../connections');

/**
 * Creates the one-on-one chat by inserting 
 * the appropriate values in the "chat" table and
 * the participants that are in the one-on-one chat in the "participants" table in the database.
 * 
 * It ensures a chat does not already exist between those two users as well.
 * @param {Object} req - The request object received from the client
 * @param {Object} res - The response object that sends back data to the client 
 * @returns appropriate response status to indicate whether the one-on-one chat was created successfully
 */
async function createOneOnOneChat(req, res) {
    const { chatName, userIds } = req.body;

    try {
        // Begin transaction
        await db_con.promise().beginTransaction();

        // Check if a one-on-one chat already exists between these two users
        const [existingChatCheckResult] = await db_con.promise().query(
            `SELECT c.chat_id FROM chat c
            JOIN chat_participants cp ON c.chat_id = cp.chat_id
            WHERE c.chat_type = "one-on-one"
            AND cp.user_id IN (?, ?)
            GROUP BY c.chat_id
            HAVING COUNT(DISTINCT cp.user_id) = 2`,
            userIds
        );

        if (existingChatCheckResult.length > 0) {
            // A one-on-one chat already exists, so we return its ID instead of creating a new one.
            const existingChatId = existingChatCheckResult[0].chat_id;
            // Rollback transaction because we're not proceeding with chat creation
            await db_con.promise().rollback();
            return res.status(200).json({ message: 'Chat already exists', chatId: existingChatId });
        }

        // If no existing chat, create a new one
        const [insertChatResult] = await db_con.promise().query(
            'INSERT INTO chat (name, chat_type, status) VALUES (?, "one-on-one", "active")',
            [chatName]
        );
        const chatId = insertChatResult.insertId;

        // Inserting participants into the chat_participants table
        for (const userId of userIds) {
            await db_con.promise().query(
                'INSERT INTO chat_participants (chat_id, user_id) VALUES (?, ?)',
                [chatId, userId]
            );
        }

        // Commit transaction
        await db_con.promise().commit();

        res.status(201).json({ message: 'One-on-one chat created successfully', chatId });
    } catch (error) {
        // Rollback transaction in case of error
        console.log("Rolling back due to error:", error.message);
        await db_con.promise().rollback();
        res.status(500).json({ message: 'Failed to create one-on-one chat', error: error.message });
    }
}

module.exports = { createOneOnOneChat };
