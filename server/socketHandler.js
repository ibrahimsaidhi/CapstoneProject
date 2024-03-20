/**
 * @author Yash Kapoor
 * This file handles delivering and receiving messages using sockets
 */

const { Server } = require("socket.io");

/**
 * Delivers and receives messages using sockets for
 * one-on-one and group chats
 * @param {Object} server 
 * @param {Object} db_con 
 */
const socketHandler = (server, db_con) => {
  const io = new Server(server, {
    cors: {
      origin: "https://parlons-capstone.netlify.app",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined chat ${chatId}`);
    });

    // Listening for "deliver_message" events from the React App (front-end)
    socket.on("deliver_message", async (messageData) => {
      const fullMessage = {
        message_type: messageData.message_type,
        message: messageData.message,
        senderId: messageData.senderId,
        timestamp: messageData.timestamp,
        recipientId: messageData.recipientId !== undefined ? messageData.recipientId : null,
        chatType: messageData.chatType,
        chatId: messageData.chatId,
        chatName: messageData.chatName,
        sender_username: messageData.sender_username,
        file_path: messageData.file_path || null,
        file_name: messageData.file_name || null,
        scheduledTime: messageData.scheduledTime,
        status: messageData.scheduledTime ? 'pending' : 'sent'
      };

      try {
        const resultMessageId = await handleChats(fullMessage, db_con);

        if (!messageData.scheduled_time) {
          // Update the message status to 'sent' if it's not a scheduled message
          await db_con.promise().query(`
            UPDATE message
            SET status = 'sent'
            WHERE message_id = ?
          `, [resultMessageId]);
        }
    
        if (messageData.chatType === "one-on-one") {
          io.to(messageData.chatId).emit("receive_message", fullMessage);
        } else if (messageData.chatType === "group") {
          emitMessageToGroup(fullMessage, io, db_con);
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
    });

    socket.on("leave_chat", (chatId) => {
      socket.leave(chatId);
      console.log(`Socket ${socket.id} left chat ${chatId}`);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  setInterval(() => {
    checkAndSendScheduledMessages(io, db_con).catch(console.error);
  }, 1000 ); // Check if there are any scheduled messages every 1 second
};

/**
 * Checks if there are any scheduled messages in the database
 * and notifies the client to send the message at the time that 
 * it is scheduled. 
 * 
 * @param {Object} io 
 * @param {Object} db_con 
 */
async function checkAndSendScheduledMessages(io, db_con) {
  const now = new Date();
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

  // query that selects the scheduled messages
  const [scheduledMessages] = await db_con.promise().query(`
    SELECT 
      message.*,
      users.username AS sender_username
    FROM 
      message
    INNER JOIN 
      users ON message.sender_id = users.user_id
    WHERE 
      message.scheduled_time <= ? AND 
      message.status = 'pending' AND 
      message.scheduled_time IS NOT NULL
  `, [formattedScheduledTime]);

  scheduledMessages.forEach(async (message) => {
    const messageToEmit = {
      message_type: message.message_type,
      message: message.message,
      senderId: message.sender_id,
      timestamp: message.timestamp,
      recipientId: message.recipient_id,
      chatType: message.chatType, 
      chatId: message.chatId,
      chatName: message.chatName, 
      sender_username: message.sender_username, 
      file_path: message.file_path,
      file_name: message.file_name
    };

    // Emit the message to the chat room
    io.to(message.chat_id).emit('receive_message', messageToEmit);

    // Update the message status to 'sent'
    await db_con.promise().query(`
      UPDATE message
      SET status = 'sent'
      WHERE message_id = ?
    `, [message.message_id]);
    
    io.to(message.chat_id).emit("message_sent", message.message_id);

  });
}

/**
 * Retrieves the messageId after the message has been inserted into the database.
 * Then, it calls the updateMessageWithChatId function to assign a chat id to
 * each message.
 * @param {Object} fullMessage - details of the message
 * @param {Object} db_con 
 */
async function handleChats(fullMessage, db_con) {
  try {
      const messageId = await insertMessageIntoDatabase(fullMessage, db_con);
      const chatId = fullMessage.chatId;
      await updateMessageWithChatId(chatId, messageId, db_con);
      return messageId;
  } catch (error) {
      console.error("Error handling one-on-one chat:", error);
  }
}

/**
 * Inserts the message into the database for one-on-one and group chats.
 * One-on-one and group chats are handled differently. 
 * For one-on-one chat, there is a sender id and a recipient id. 
 * However, for group chat, there is only a sender id and no recipient id since
 * there are more than two participants. 
 * @param {Object} fullMessage - details of the message
 * @param {Object} db_con 
 * @returns   appropriate response to indicate whether the message was inserted successfully
 */
function insertMessageIntoDatabase(fullMessage, db_con) {
  return new Promise((resolve, reject) => {
    let messageQuery;
    let queryParams;

    if (fullMessage.chatType === "one-on-one") {
      messageQuery = `
        INSERT INTO message (message, timestamp, sender_id, recipient_id, message_type, chat_id, file_path, file_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `;
      queryParams = [fullMessage.message, fullMessage.timestamp, fullMessage.senderId, fullMessage.recipientId,
         fullMessage.message_type, fullMessage.chatId, fullMessage.file_path, fullMessage.file_name];
    } else if (fullMessage.chatType === "group") {
      messageQuery = `
        INSERT INTO message (message, timestamp, sender_id, message_type, chat_id, file_path, file_name)
        VALUES (?, ?, ?, ?, ?, ?, ?);
      `;
      queryParams = [fullMessage.message, fullMessage.timestamp, fullMessage.senderId,
         fullMessage.message_type, fullMessage.chatId, fullMessage.file_path, fullMessage.file_name];
    }

    db_con.execute(messageQuery, queryParams, (messageError, messageResults) => {
      if (messageError) {
        console.error(messageError.message);
        reject(messageError);
      } else {
        const messageId = messageResults.insertId;
        console.log("Message inserted with ID:", messageId);
        resolve(messageId);
      }
    });
  });
}

/**
 * Assigns a chat id to each message, so it is easy to know
 * which message belongs to which chat in the "message" table
 * in the database.
 * @param {number} chatId - the ID of the chat (unique identifier for each one-on-one/group chat)
 * @param {number} messageId - the ID of the message (unique identifier for each message)
 * @param {Object} db_con 
 */
function updateMessageWithChatId(chatId, messageId, db_con) {
  const updateMessageQuery = `
          UPDATE message
          SET chat_id = ?
          WHERE message_id = ?;
        `;

  db_con.execute(updateMessageQuery, [chatId, messageId], (updateError) => {
    if (updateError) {
      return console.error(updateError.message);
    }
    console.log("Updated message with chat ID: ", chatId);
  });
}

/**
 * Emitting the message to all sockets in the room identified by chatId
 * @param {Object} message - details of the message
 * @param {Object} io 
 */
function emitMessageToGroup(message, io) {
  console.log(`Emitting message to group chat ${message.chatId}`);
  io.to(message.chatId).emit('receive_message', message);
}

module.exports = socketHandler;
