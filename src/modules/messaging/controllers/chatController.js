const Chat = require("../models/chatModel");
const {User} = require("../../auth/models/userModel");

//create a one on one chat or group chat
const createChat = async (req, res, next) => {
    try{
        const { userId, recipientId, isGroup, participants, groupName } = req.body;

        if(isGroup) {
            //validate group creation fields
            if(!participants || !participants.length < 2 || !groupName) {
                return res.status(400).json({
                    success: false,
                    message: "A group chat must have a valid name and at least 2 participants"
                })
            }

            const newGroupChat = new Chat({
                chatName: groupName,
                isGroup,
                participants,
                admin: userId
            })

            await newGroupChat.save();
            return res.status(200).json({
                success: true,
                message: "Group successfully created!",
                chat: newGroupChat
            })
        }

        //Private chat
        if(!recipientId){
            return res.status(400).json({
                success: false,
                message: "Recipient ID does not exist!",
            })
        }

        //check if a chat already exists
        const existingChat = await Chat.findOne({
            isGroup: false,
            participants: { $all: [userId, recipientId] }
        });

        if(existingChat){
            return res.status(200).json({
                success: true,
                message: "Chat already exists!",
                chat: existingChat
            })
        }

        //fetch recipients name as to set as chat name
        const recipientUser = await User.findById(recipientId);
        if(!recipientUser){
            return res.status(400).json({
                success: false,
                message: "Recipient user not found!",
            })
        }

        //create a new private chat
        const newPrivateChat = new Chat({
            chatName: recipientUser.name,
            isGroup: false,
            participants: [userId, recipientId],
        });

        await newPrivateChat.save();
        return res.status(200).json({
            success: true,
            message: "Private chat successfully created!",
            chat: newPrivateChat
        })
    }catch(error){
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

//get all chats for a user
const getUserChats = async (req, res, next) => {
    try {
        const {userId} = req.user._id;

        const chats = await Chat.find({
            participants: userId,
            isDeleted: false
        })
            .populate("participants", "name email")//populate user details
            .populate("lastMessage") // populate the latest message in the chats
            .sort({updatedAt: -1})// sort by latest update

        res.status(200).json({
            success: true,
            message: "User chats found!",
            chats: chats
        })
    }catch(error){
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

//update Group chat

const updateGroupChat = async (req, res, next) => {
    try {
        const {chatId} = req.params;
        const {groupName, participants, userId} = req.body;
        const chat = await Chat.findById(chatId);

        if (!chat || !chat.isGroup) {
            return res.status(404).json({
                success: false,
                message: "Group chat does not exist!",
            })
        }

        //only group admin can update the chat details
        if (chat.admin.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only the group admin can change the group details",
            })
        }

        if (groupName) chat.chatName = groupName;
        if (participants) {
            chat.participants = chat.participants.push(...participants);
        }

        await chat.save();
        return res.status(200).json({
            success: true,
            message: "Group successfully updated!",
            chat: chat
        })
    }catch(error){
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

//remove participant from a group chat
const removeParticipantsFromAGroupChat = async (req, res, next) => {
    try {
        const {chatId} = req.params;
        const {participantsToBeRemoved} = req.body;
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found!",
            })
        }
        if (!chat.isGroup) {
            return res.status(403).json({
                success: false,
                message: "Cannot remove participants from a private chat",
            })
        }
        let setToRemove = new Set(participantsToBeRemoved);
        chat.participants = chat.participants.filter(item => setToRemove.has(item));
        await chat.save();
        return res.status(200).json({
            success: true,
            message: "Participants removed successfully!",
        })
    }catch(error){
        res.status(400).json({
            success: false,
            message: error.message
        })
    }


}

//delete chat -> soft delete
const deleteChat = async(req, res, next) => {
    try {
        const {chatId} = req.params;

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat does not exist!",
            })
        }

        chat.isDeleted = true;
        chat.deletedAt = new Date();
        await chat.save();
        return res.status(200).json({
            success: true,
            message: "Chat deleted successfully!",
        })
    }catch(error){
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

//restore the deleted chat
const restoreChat = async(req, res, next) => {
    try{
        const {chatId} = req.params;
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.isDeleted) {
            return res.status(404).json({
                success: false,
                message: "Chat does not exist!",
            })
        }

        chat.isDeleted = false;
        chat.deletedAt = null;
        await chat.save();
        return res.status(200).json({
            success: true,
            message: "Chat restored successfully!",
            chat
        })

    }catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


module.exports = {
    createChat,
    getUserChats,
    updateGroupChat,
    removeParticipantsFromAGroupChat,
    deleteChat,
    restoreChat
}