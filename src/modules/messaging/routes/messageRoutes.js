const express = require('express');
const router = express.Router();
const messageController = require("../controllers/messageController");

//send a message
router.post("/sendMessage", messageController.sendMessage);

//get all the messages for a chat
router.get("/:chatId", messageController.getMessages);

//edit a message

router.patch("/editMessage", messageController.editMessage);

//delete a message
router.delete("/deleteMessage", messageController.deleteMessage);

module.exports = router;