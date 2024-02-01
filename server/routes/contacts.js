const express = require("express");
const authenticateRoute = require("../middleware/authMiddleware.js");
const {getAll, searchNewContact, sendRequest, deleteRequest, updateRequest, blockRequest} = require("../controller/contactsController");
const router = express.Router();

//Handles getting all the user's friends, incoming friend requests, outgoing friend requests, blocked users, and all contacts that are not user's friends
router.get("/all", authenticateRoute, getAll);

//Handles searching for a users thats not a friend, not blocked and does not currently have or sent a friend request to user
router.get("/search/:term", authenticateRoute, searchNewContact);

//Handles sending friend request to other users
router.post("/friend", authenticateRoute, sendRequest);

//Handles cancelling own friend request, declining another users friend request, deleting current friends and unblocking a user
router.delete("/friend/:username", authenticateRoute, deleteRequest);

//Handles accepting friend request
router.patch("/friend/:username", authenticateRoute, updateRequest);

//Handle blocking a user
router.put("/friend/:username", authenticateRoute, blockRequest);

module.exports = router;