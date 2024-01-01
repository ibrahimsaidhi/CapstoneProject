const express = require("express");
// const cors = require("cors");


const app = express();
const server = require('http').createServer(app);
const io = require("socket.io")(server, {cors: {origin: "*"}});
require("dotenv").config();

const mysql = require("mysql2");
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

server.listen(process.env.PORT, () => {
  console.log(`Server started on Port ${process.env.PORT}`);
});



io.on("connection", function(socket){
  console.log("Connected! Hello ", socket.id);

  socket.on("message", function(data) {
    //console.log(data);

    io.emit('message', data);
    //db_con.query("INSERT INTO message (")
  })
});

app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

const path = require('path');

app.get('/index', (req, res) => {
    res.render("index");
});
