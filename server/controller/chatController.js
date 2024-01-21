const db_con = require('../connections');

/**
 * Fetching messages from the database for a particular chat id
 * @param {Object} req - The request object received from the client
 * @param {Object} res - The response object that sends back data to the client
 */
exports.getMessages = function(req, res){
    const chatId = req.params.chatId;
    db_con.query("SELECT * FROM message WHERE chat_id = ?", [chatId], function(error, messages){
        if (error) {
            return res.status(500).send(error.message);
        }
        res.json(messages);
        console.log("Messages fetched from the database for chat ID:", chatId);
    });
};

