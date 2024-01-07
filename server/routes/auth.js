const express = require("express");
const { login } = require("../controller/authController");


  // Add routes for register and logout
    
const router = express.Router()

router.post("/login", login)

module.exports = router