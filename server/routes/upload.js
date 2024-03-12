const express = require('express');
const authenticateRoute = require('../middleware/authMiddleware');
const { uploadFile } = require('../controller/uploadController');

const router = express.Router();

router.post('/uploadFiles', authenticateRoute, uploadFile);

module.exports = router;
