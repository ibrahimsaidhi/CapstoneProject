const express = require("express");
// const cors = require("cors");

const app = express();
const server = require('http').createServer(app);
const io = require("socket.io")(server, {cors: {origin: "*"}});
require("dotenv").config();

app.use(function (req, res, next){
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

const mysql = require("mysql2");
let db_con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: 'Itsibby443!',
    database: "webapp"
});
  
db_con.connect((err) => {
    if (err) {
      console.log("Database Connection Failed !!!", err);
    } else {
      console.log("connected to Database");
    }
});
  
module.exports = db_con;

server.listen(process.env.PORT, () => {
  console.log(`Server started on Port ${process.env.PORT}`);
});

io.on("connection", function(socket){
  console.log("Connected! Hello ", socket.id);

  socket.on("message", function(data) {
    //console.log(data);

    io.emit('message', data);

    db_con.query("INSERT INTO message (message, timestamp, sender_id, recipient_id, message_type) values ('" + data + "', '2024-01-19 03:14:07', 1, 2, 'regular');", function (error, result) {
      if (error) throw error;
      console.log("1 record inserted");
    });
  })
});

app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

const path = require('path');

app.get('/index', (req, res) => {
    res.render("index");
});

app.get("/messages", function(req, res){
  db_con.query("SELECT * from message", function(error, messages){
    if (error) throw error;
    res.end(JSON.stringify(messages));
    console.log("record received");
  });
});
