const express = require("express");
const authenticateRoute = require("../middleware/authMiddleware.js");
const {allContacts, searchNewContact, addContact, removeContact} = require("../controller/contactsController");
const router = express.Router()

router.get("/all", authenticateRoute, allContacts);
router.get("/search/:term", authenticateRoute, searchNewContact);
router.post("/add", authenticateRoute, addContact);
router.post("/remove", authenticateRoute, removeContact);

module.exports = router