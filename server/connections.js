const mysql = require("mysql2");
require("dotenv").config();
  
let db_con = mysql.createConnection({
    host: "us-cluster-east-01.k8s.cleardb.net",
    user: "bf05f17df90a01",
    password: "2899c9c4",
    database: "heroku_9bb8ea8d71b0c85"
  });
  
  db_con.connect((err) => {
    if (err) {
      console.log("Database Connection Failed !!!", err);
    } else {
      console.log("connected to Database");
    }
  });
  
  module.exports = db_con;