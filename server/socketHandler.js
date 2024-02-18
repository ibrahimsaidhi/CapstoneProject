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
      origin: "http://localhost:3000",
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
    socket.on("deliver_message", (messageData) => {
      const fullMessage = {
        message: messageData.message,
        senderId: messageData.senderId,
        timestamp: messageData.timestamp,
        recipientId: messageData.recipientId !== undefined ? messageData.recipientId : null,
        message_type: "regular",
        chatType: messageData.chatType,
        chatId: messageData.chatId,
        chatName: messageData.chatName,
        sender_username: messageData.sender_username
      };

      handleChats(fullMessage, db_con);
      if (messageData.chatType === "one-on-one") {
        // Emitting message only to sockets in the room corresponding to the chatId
        io.to(messageData.chatId).emit("receive_message", fullMessage);
      } else if (messageData.chatType === "group") {
        // Emitting message to participants in a specific group
        emitMessageToGroup(fullMessage, io, db_con);
      }
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
};

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
        INSERT INTO message (message, timestamp, sender_id, recipient_id, message_type, chat_id)
        VALUES (?, ?, ?, ?, ?, ?);
      `;
      queryParams = [fullMessage.message, fullMessage.timestamp, fullMessage.senderId, fullMessage.recipientId, fullMessage.message_type, fullMessage.chatId];
    } else if (fullMessage.chatType === "group") {
      messageQuery = `
        INSERT INTO message (message, timestamp, sender_id, message_type, chat_id)
        VALUES (?, ?, ?, ?, ?);
      `;
      queryParams = [fullMessage.message, fullMessage.timestamp, fullMessage.senderId, fullMessage.message_type, fullMessage.chatId];
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
