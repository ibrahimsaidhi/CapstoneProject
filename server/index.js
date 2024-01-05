const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const { Server } = require("socket.io");
const http = require("http");

let db_con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: 'Priya5555%',
    database: 'webapp'
});
  
db_con.connect((err) => {
    if (err) {
        console.log("Database Connection Failed !!!", err);
    } else {
        console.log("connected to Database");
    }
});
  
module.exports = db_con;

const app = express();
require("dotenv").config();
app.use(cors({
  origin: "http://localhost:3000", 
  methods: ["GET", "POST"] 
}));
// app.use(express.json());

app.get("/", (req, res) => {
    res.json("Hello");
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
      origin: "http://localhost:3000", // Client URL
      methods: ["GET", "POST"]
  }
});

// Handling socket.io connections
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
      io.emit("receive_message", fullMessage)

    //   // Insert the message into the database
    //   const query = `
    //   INSERT INTO message (message, timestamp, sender_id, recipient_id, message_type)
    //   VALUES (?, ?, ?, ?, ?);
    // `;

    // console.log("Attempting to insert:", fullMessage);
    
    //  db_con.execute(query, [fullMessage.message, fullMessage.timestamp, fullMessage.senderId, fullMessage.recipient_id, fullMessage.message_type], (error, results) => {
    //     if (error) {
    //       return console.error(error.message);
    //     }
    //     console.log("Message inserted with ID:", results.insertId);
    // });
    })
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// Fetching messages from the database
app.get("/messages", function(req, res){
  db_con.query("SELECT * from message", function(error, messages){
    if (error) {
      return res.status(500).send(error.message);
    }
    res.json(messages);
    console.log("Messages fetched from the database");
  });
});

server.listen(process.env.PORT, () => {
    console.log(`Server started on Port ${process.env.PORT}`);
});
