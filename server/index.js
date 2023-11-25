const express = require("express");
// const cors = require("cors");
const mysql = require("mysql2");
  
let db_con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: '',
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

const app = express();
require("dotenv").config();

// app.use(cors);
// app.use(express.json());

app.get("/", (req, res) => {
    res.json("Hello")
});

app.listen(process.env.PORT, () => {
    console.log(`Server started on Port ${process.env.PORT}`);
});