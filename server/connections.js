const mysql = require("mysql2");
require("dotenv").config();
  
let db_con = mysql.createConnection({
    host: "us-cluster-east-01.k8s.cleardb.net",
    user: "b95c6c763e2d37",
    password: "86c23689",
    database: "heroku_fa1f51fe61c579e"
  });
  
  db_con.connect((err) => {
    if (err) {
      console.log("Database Connection Failed !!!", err);
    } else {
      console.log("connected to Database");
    }
  });
  
  module.exports = db_con;