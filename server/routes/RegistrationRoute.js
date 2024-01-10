const express= require('express');
const router = express.Router();
const controller = require('../controller/RegistrationController');

//POST requests to /registration/create goes to RegistrationController.post method
router.post("/create", controller.post);

module.exports = router;

