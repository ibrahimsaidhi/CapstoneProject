/**
 * @author Yash Kapoor
 * This file handles delivering and receiving messages using sockets
 */

const { Server } = require("socket.io");

const socketHandler = (server, db_con) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", 
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('a user connected');

    // Listening for "deliver_message" events from the React App (front-end)
    socket.on("deliver_message", (messageData) => {
      const fullMessage = {
        message: messageData.message,
        senderId: messageData.senderId,
        timestamp: messageData.timestamp,
        recipientId: messageData.recipientId,
        message_type: "regular"
      };

    // Insert the message into the database
    const messageQuery = `
      INSERT INTO message (message, timestamp, sender_id, recipient_id, message_type)
      VALUES (?, ?, ?, ?, ?);
    `;

    console.log("Attempting to insert message:", fullMessage);

    db_con.execute(messageQuery, [fullMessage.message, fullMessage.timestamp, fullMessage.senderId, fullMessage.recipientId, fullMessage.message_type], (messageError, messageResults) => {
      if (messageError) {
        return console.error(messageError.message);
      }
      const messageId = messageResults.insertId;
      console.log("Message inserted with ID:", messageId);

      // Find a chat session that includes a message between two users
      const findChatSessionQuery = `
        SELECT c.chat_id
        FROM chat c
        JOIN message m ON c.message_id = m.message_id
        WHERE (m.sender_id = ? AND m.recipient_id = ?) OR (m.sender_id = ? AND m.recipient_id = ?)
        LIMIT 1
      `;

      console.log("Checking for existing chat session between users: ", fullMessage.senderId, "and", fullMessage.recipient_id);

      let chatId;
      db_con.execute(findChatSessionQuery, [fullMessage.senderId, fullMessage.recipientId, fullMessage.recipientId, fullMessage.senderId], (chatError, chatResults) => {
      if (chatError) {
        return console.error(chatError.message);
      }
        
      if (chatResults.length > 0) {
          // The chat session exists
          chatId = chatResults[0].chat_id;
          console.log("Existing chat session found with ID: ", chatId);
          updateMessageWithChatId(chatId, messageId);
      } else {
          // Create a new chat session
          console.log("No existing chat session found. Creating a new one.");
          const newChatQuery = `INSERT INTO chat (message_id, chat_type) VALUES (?, 'one-on-one')`;
          db_con.execute(newChatQuery, [messageId], (newChatError, newChatResults) => {
            if (newChatError) {
              return console.error(newChatError.message);
            }
            chatId = newChatResults.insertId;
            console.log("New chat session created with ID: ", chatId);
            updateMessageWithChatId(chatId, messageId);
          });
        }
      });
        
      function updateMessageWithChatId(chatId, messageId) {
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
    });
      // Emitting received message to all connected users
      io.emit("receive_message", fullMessage);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
};

module.exports = socketHandler;
