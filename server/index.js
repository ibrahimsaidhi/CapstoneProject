const express = require("express");
// const cors = require("cors");
const mysql = require("mysql2");
const WebSocket = require("ws");
const path = require("path")
const app = express();
const server = require('http').createServer(app);
require("dotenv").config();

let db_con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: 'Itsibby443!',
    database: ''
});
  
db_con.connect((err) => {
    if (err) {
      console.log("Database Connection Failed !!!", err);
    } else {
      console.log("connected to Database");
    }
});
  
module.exports = db_con;


//app.use("/",express.static(path.resolve(__dirname, "../public/src")))



const wsServer = new WebSocket.Server({
  server: server
})

wsServer.on("connection", function connection(ws){
  console.log("New client connected!");
  ws.on("message", function(message){
    ws.send("message: ", message);
  })
})


// app.use(cors);
// app.use(express.json());

const filePath = path.resolve(__dirname, 'index.html');

app.get("/", (req, res) => {
  res.sendFile(filePath);
});

app.listen(process.env.PORT, () => {
  console.log(`Server started on Port ${process.env.PORT}`);
});



