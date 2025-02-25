const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const userController = require("../controllers/chatController");

//create one on one chat or group chat
router.post("/create", chatController.createChat);

//get all chats for a user
router.get("/getAllChats", chatController.getUserChats);

//update group chat
router.patch("/updateGroupChat", chatController.updateGroupChat);

//delete chat
router.delete("/deleteChat", chatController.deleteChat);

//restore chat
router.patch("restoreChat", userController.restoreChat);

//remove participants from a group chat
router.patch("/",  chatController.removeParticipantsFromAGroupChat)

module.exports = router;