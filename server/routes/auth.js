const express = require("express");
const {login, registration } = require("../controller/authController");


  // Add routes for register and logout
    
const router = express.Router();

router.post("/login", login);
router.post("/registration", registration);

module.exports = router;