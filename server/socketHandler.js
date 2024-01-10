// socketHandler.js
const { Server } = require("socket.io");

const socketHandler = (server, db_con) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // Client URL
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
        recipient_id: 2,
        message_type: "regular"
      };
      // Emitting received message to all connected users
      io.emit("receive_message", fullMessage);

      // Insert the message into the database
    //   const query = `
    //     INSERT INTO message (message, timestamp, sender_id, recipient_id, message_type)
    //     VALUES (?, ?, ?, ?, ?);
    //   `;

    //   db_con.execute(query, [fullMessage.message, fullMessage.timestamp, fullMessage.senderId, fullMessage.recipient_id, fullMessage.message_type], (error, results) => {
    //     if (error) {
    //       return console.error(error.message);
    //     }
    //     console.log("Message inserted with ID:", results.insertId);
    //   });
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
};

module.exports = socketHandler;
