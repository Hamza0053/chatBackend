const User = require("../models/users")
const Chat = require("../models/chat")
const Message = require("../models/messages")
const mongoose = require("mongoose");

const summerizeTime = (DateString) => {
    if (!DateString || isNaN(Date.parse(DateString))) {
        return { day: "Invalid Date", date: "Invalid Date", year: NaN, time: "Invalid Date" };
    }

    const date = new Date(DateString);

    return {
        day: date.toLocaleDateString("en-US", { weekday: "long" }), // "Monday"
        date: date.toLocaleDateString("en-US", { year: "numeric", month: "numeric", day: "numeric" }), // "February 14, 2025"
        year: date.getFullYear(), // "2025"
        time: date.toLocaleTimeString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true }) // "3:09 AM"
    };
};

// Example usage:


const getAllContacts = async (req, res) => {
    try {
        // Ensure req.user is defined and contains user_id
        if (!req.user || !req.user._id) {
            return res.status(400).json({
                success: false,
                message: "User ID is missing from request"
            });
        }

        // Extract the excluded user from the authenticated user
        const excludedUser = req.user._id;

        // Query to find all users excluding the current user
        const allUsers = await User.find(
            { _id: { $ne: excludedUser } }, // Exclude the current user
            { _id: 1, name: 1, status: 1, profile_picture: 1, isAI: 1 } // Include isAI field
        );

        // Separate AI users and regular users
        const aiUsers = allUsers.filter(user => user.isAI)[0];
        const regularUsers = allUsers.filter(user => !user.isAI);

        console.log("Contacts found:", { regularUsers, aiUsers });

        // Respond with structured contact lists
        res.status(200).json({
            success: true,
            contacts: {
                regularUsers,
                aiUsers
            }
        });

    } catch (error) {
        // Handle any errors during the query
        res.status(500).json({
            success: false,
            message: `Server error: ${error.message}`
        });
    }
};



const getChatMessages = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { chatId } = req.params;

        const messages = await Message.find({ chat: chatId })
            .populate("sender", "name profile_picture") // ✅ Get sender details
            .populate("replyTo", "message_content sender") // ✅ Get reply details
            .populate("readBy", "name profile_picture") // ✅ Get readBy users
            .sort({ createdAt: 1 }) // ✅ Oldest messages first
            .lean(); // Convert to JSON format

        // ✅ Map messages to include createdAt properly
        const formattedMessages = messages.map(message => ({
            _id: message._id,
            chat: message.chat,
            sender: message.sender,
            message_type: message.message_type,
            message_content: message.message_content,
            status: message.status,
            createdAt: summerizeTime(message.createdAt), // ✅ Include createdAt
            readBy: message.readBy, // ✅ Include users who read the message
            replyTo: message.replyTo,
            reactions: message.reactions,
            isEdited: message.isEdited,
            editedAt: message.editedAt,
            isDeleted: message.isDeleted,
            deletedAt: message.deletedAt,
            file: message.file,
        }));

        res.status(200).json({ success: true, messages: formattedMessages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ success: false, message: "Server error", error });
    }
};



const getUserChats = async (req, res) => {
    try {
        const userId = req.user._id;  // Assuming JWT Authentication

        const chats = await Chat.find({ members: userId })
            .populate("members", "name profile_picture last_seen")  // Populate members' name and profile picture
            .populate("lastMessage", "message_content message_type status")  // Populate the last message fields
            .populate("unreadMessages", "userId count")  // Populate the last message fields
            .lean();

        const filteredChats = chats.map(chat => {
            if (!chat?.isGroupChat) {
                chat.unreadMessages = chat.unreadMessages
                    .filter(unread => unread.userId.toString() === userId.toString());
                chat.members = chat.members
                    .filter(member => member._id.toString() !== userId.toString()) // Remove current user
                    .map(member => ({
                        ...member,
                        last_seen: summerizeTime(member.last_seen) // Summarize last_seen for each member
                    }));
            }
            chat.updatedAt = summerizeTime(chat.updatedAt)
            return chat;
        });



        res.status(200).json({ success: true, chats: filteredChats });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error", error });
    }
};



const createChat = async (req, res) => {
    try {

        const { members, isGroupChat, groupName } = req.body;

        if (isGroupChat && !groupName) {
            return res.status(400).json({ success: false, message: "Group name is required for group chat." });
        }

        // Check if the chat already exists (For one-on-one chat)
        if (!isGroupChat) {
            const existingChat = await Chat.findOne({ members: { $all: members, $size: members.length } });
            if (existingChat) {
                console.log('user already exists');

                return res.status(200).json({ success: true, chat: existingChat });
            }
        }

        const newChat = new Chat({
            members,
            isGroupChat,
            groupName: isGroupChat ? groupName : undefined
        });

        await newChat.save();
        res.status(201).json({ success: true, chat: newChat });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error });
    }
}

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: "No File Uploaded"
            })
        }
        const fileName = req.file.filename;
        res.status(200).json({
            success: true,
            message: "File Uploaded Successfully.",
            fileName: fileName
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Server Error: ${error}`
        })
    }

}


module.exports = {
    getAllContacts,
    createChat,
    getUserChats,
    getChatMessages,
    uploadFile
}