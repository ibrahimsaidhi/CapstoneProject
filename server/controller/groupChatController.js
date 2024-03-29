const db_con = require('../connections');

/**
 * Checks if a group chat with the given name chosen by the user already exists.
 * If it does not exist, then it shall create the group chat by inserting 
 * the appropriate values in the "chat" table and
 * the participants that are in the group chat in the "participants" table in the database.
 * @param {Object} req - The request object received from the client
 * @param {Object} res - The response object that sends back data to the client 
 * @returns    appropriate response status to indicate whether the group chat was created successfully
 */
async function createGroupChat(req, res) {
    const { chatName, userIds } = req.body;
    
    try {
        // Checking if a group chat with the given name already exists
        const [existingChat] = await db_con.promise().query(
            'SELECT chat_id FROM chat WHERE name = ? AND chat_type = "group"',
            [chatName]
        );

        // returning an error response if the chat name already exists
        if (existingChat.length > 0) {
            return res.status(409).json({ message: 'Group chat name already exists. Please choose a different name.' });
        }

        // Begin transaction
        await db_con.promise().beginTransaction();

        // If the chat name is unique, create the group chat
        const [insertChatResult] = await db_con.promise().query(
            'INSERT INTO chat (name, chat_type, status) VALUES (?, "group", "active")',
            [chatName]
        );
        
        const chatId = insertChatResult.insertId;

        // inserting participants into the chat_participants table
        for (const userId of userIds) {
            await db_con.promise().query(
                'INSERT INTO chat_participants (chat_id, user_id) VALUES (?, ?)',
                [chatId, userId]
            );
        }

        // Commit transaction
        await db_con.promise().commit();

        res.status(201).json({ message: 'Group chat created successfully', chatId });
    } catch (error) {
        // Rollback transaction in case of error
        await db_con.promise().rollback();
        res.status(500).json({ message: 'Failed to create group chat', error: error.message });
    }
}

/**
 * Adds participants to the group chat by inserting them into the chat_participants table.
 * @param {Object} req - The request object received from the client
 * @param {Object} res - The response object that sends back data to the client 
 */
async function addParticipantsToGroupChat(req, res) {
    const { chatId, userIds } = req.body;
    
    try {
        await db_con.promise().beginTransaction();

        // Inserting new participants into the chat_participants table
        for (const userId of userIds) {
            await db_con.promise().query(
                'INSERT INTO chat_participants (chat_id, user_id) VALUES (?, ?)',
                [chatId, userId]
            );
        }

        await db_con.promise().commit();

        res.status(201).json({ message: 'Participants added successfully' });
    } catch (error) {
        // Rollback transaction in case of error
        await db_con.promise().rollback();
        res.status(500).json({ message: 'Failed to add participants to group chat', error: error.message });
    }
}


module.exports = { createGroupChat, addParticipantsToGroupChat };
