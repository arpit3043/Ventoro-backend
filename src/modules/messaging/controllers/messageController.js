const Chat = require("./models/chatModel");
const Message = require("./models/messageModel");
const {User} = require("../../auth/models/userModel");

//send a message
const sendMessage = async (req, res, next) => {
    try {
        const { chatId, content, messageType, mediaUrl, fileType, replyTo, mentions } = req.body;
        const senderId = req.user._id; // Extracted from authenticated user

        // Validate input
        if (!chatId) return res.status(400).json({
            success: false,
            message: "Chat ID is required."
        });
        if (!content && messageType === "text") return res.status(400).json({
            success: false,
            message: "Text content is required."
        });
        if (messageType !== "text" && !mediaUrl) return res.status(400).json({
            success: false,
            message: "Media URL is required for non-text messages."
        });

        // Check if chat exists
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({
            success: false,
            message: "Chat not found."
        });

        // Create new message
        const newMessage = new Message({
            chatId,
            senderId,
            content,
            messageType,
            mediaUrl,
            fileType,
            mentions,
            replyTo,
        });

        // Save message
        await newMessage.save();

        // Update chat last message
        chat.lastMessage = newMessage._id;
        chat.updatedAt = Date.now();
        await chat.save();

        // Populate sender details
        await newMessage.populate("senderId", "name profileImg");

        res.status(201).json({
            success: true,
            message: "Message sent successfully.",
            newMessage
        });
    } catch (error) {
        res.status(500).json({
            message: "Error sending message.", error: error.message
        });
    }
}

//get messages in a chat

const getMessages = async (req, res, next) => {
    try{
        const {chatId} = req.params;

        if (!chatId) return res.status(400).json({
            success: false,
            message: "Chat ID is required."
        })

        const messages = await Message.find({chatId, isDeleted: false})
            .sort({ createdAt: -1 })
            .populate("senderId", "name profileImg");

        res.status(200).json({
            success: true,
            message: "Messages fetched successfully.",
            messages
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//mark messages as delivered/read

//edit a message -> only sender can edit a message

const editMessage = async (req, res, next) => {
    try {
        const {messageId} = req.params;
        const {content} = req.body;
        const userId = req.user._id;

        if (!content) {
            res.status(400).json({
                success: false,
                message: "Content is required."
            })
        }

        const message = await Message.findById(messageId);
        if (!message) {
            res.status(400).json({
                success: false,
                message: "Message not found."
            })
        }

        if (message.senderId.toString() !== userId.toString()) {
            res.status(400).json({
                success: false,
                message: "Unauthorized to edit the message."
            })
        }

        message.content = content;
        message.edited = true;
        await message.save();

        res.status(200).json({
            success: true,
            message: "Message edit successfully.",
            message
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//soft delete a message
const deleteMessage = async (req, res, next) => {
    try {
        const {messageId} = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            res.status(400).json({
                success: false,
                message: "Message not found."
            })
        }

        if (message.senderId.toString() !== userId.toString()) {
            res.status(400).json({
                success: false,
                message: "Unauthorized to delete the message."
            })
        }

        message.isDeleted = true;
        await message.save();
        res.status(200).json({
            success: true,
            message: "Message deleted successfully."
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//react to a message

//remove a reaction to a message


module.exports = {
    sendMessage,
    getMessages,
    editMessage,
    deleteMessage
}