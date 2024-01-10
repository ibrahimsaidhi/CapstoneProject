const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const { Server } = require("socket.io");
const http = require("http");
const socketHandler = require("./socketHandler");
const chatRoutes = require("./chat")

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

app.use("/chat", chatRoutes);

socketHandler(server, db_con);

server.listen(process.env.PORT, () => {
    console.log(`Server started on Port ${process.env.PORT}`);
});
