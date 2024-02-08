const express = require("express");
const {login, registration, logout } = require("../controller/authController");


  // Add routes for register and logout
    
const router = express.Router();

router.post("/login", login);
router.post("/registration", registration);
router.post("/logout", logout);

module.exports = router;