const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: function () {
                return this.messageType === "text";
            },
        },
        messageType: {
            type: String,
            enum: ["text", "image", "video", "file", "voice"],
            default: "text",
        },
        mediaUrl: {
            type: String, // Stores URL of uploaded files
            required: function () {
                return this.messageType !== "text";
            },
        },
        fileType: {
            type: String, // Example: "jpg", "mp4", "pdf"
        },
        mentions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        status: {
            type: String,
            enum: ["sent", "delivered", "read"],
            default: "sent",
        },
        reactions: {
            type: Map,
            of: [String], // Example: { userId1: ["👍", "😂"], userId2: ["❤️"] }
            default: {},
        },
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        edited: {
            type: Boolean,
            default: false,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = {Message};
