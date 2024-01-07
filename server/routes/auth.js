const express = require("express");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db_con = require("../connections");

const SECRET_KEY = "secretkey";


const login = (req, res) => {

    const query = "SELECT * FROM users WHERE username = ?";
  
    db_con.query(query, [req.body.username], (err, data) => {
      if (err) {
        return res.status(500).json({ error: "Internal server error" });
      }
      
      // Not found
      if (data.length === 0) {
        return res.status(400).json({ error: "Invalid password or username. Please try again" });
      }
  
      const isPasswordValid = bcrypt.compareSync(
        req.body.password,
        data[0].password
      );
  
        // Bad request
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid password or username. Please try again" });
      }
  
      // Generate a JSON Web Token (JWT) with the user's ID
      const token = jwt.sign({ id: data[0].id }, SECRET_KEY);
  
      // Extract sensitive information (like password) before sending the response
      const { password, ...userInfo } = data[0];
  
      // Set the JWT as an HTTP-only cookie for added security
      res.cookie("accessToken", token, {
        httpOnly: true,
      });
  
      // Send a successful response with user information (excluding password)
      res.status(200).json(userInfo);
    });
  };
    

const router = express.Router()

router.post("/login", login)

module.exports = router