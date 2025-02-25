const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
    {
        chatName: {
            type: String,
            trim: true,
            required: true, // Either the recipient's name (private chat) or a group name
        },
        isGroup: {
            type: Boolean,
            default: false,
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: function () {
                return this.isGroup;
            }, // Admin required only for group chats
        },
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },
        groupAvatar: {
            type: String, // URL for group image (optional)
            default: "", // Can be set later
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
