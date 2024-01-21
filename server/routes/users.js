const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { getUserDetails } = require('../controller/userController');

router.get('/details', authenticate, getUserDetails);

module.exports = router; 
