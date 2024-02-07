const db_con = require('../connections');

/**
 * Fetching all chat sessions for a specific user from the database
 * @param {Object} req - The request object received from the client
 * @param {Object} res - The response object that sends back data to the client
 */
exports.getAllChats = function(req, res) {
    const userId = req.params.userId;

    // SQL query to fetch all chats involving the user
    const query = `
        SELECT c.chat_id, c.chat_type, m.message, m.timestamp, m.sender_id, m.recipient_id
        FROM chat c
        JOIN message m ON c.message_id = m.message_id
        WHERE m.sender_id = ? OR m.recipient_id = ?
        GROUP BY c.chat_id
        ORDER BY m.timestamp DESC;
    `;

    db_con.execute(query, [userId, userId], (error, results) => {
        if (error) {
            return res.status(500).send({ message: error.message });
        }
        res.json({ chats: results });
        console.log("Chats fetched for user ID: ", userId);
    });
};

/**
 * Gets the status for a particular chat id
 * 
 * @param {*} req       Information about the HTTP request
 * @param {*} res       Response to the HTTP request
 */  
exports.getStatus =  async (req, res)  =>
  {
      try
      {
        const chatId = req.params.chatId;
          
        chatStatusData = await db_con.promise().query(
            `SELECT status FROM webapp.chat WHERE chat_id = ?`,[chatId]
          );  

        res.status(200).json({
            chatStatus: chatStatusData[0][0].status,
        });
    
      }
      catch(err)
      {
        console.log(err);
        res.status(500).json({
            message: "Chat status could not be found due to an internal error. Please try again",
        });
      }
      
  };
