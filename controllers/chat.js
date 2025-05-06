const User = require("../models/users")
const Chat = require("../models/chat")
const Message = require("../models/messages")
const mongoose = require("mongoose");
const Call = require("../models/call");

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

async function answerCall(callId) {
    try {
        const call = await Call.findById(callId);
        
        if (!call) {
            throw new Error("Call record not found");
        }

        const updatedCall = await Call.findByIdAndUpdate(
            callId,
            {
                started_at: new Date(),
                call_status: "accepted"
            },
            { new: true }
        );

        console.log("call answered:" , updatedCall)

        return updatedCall;
    } catch (error) {
        console.error("Error updating call start time:", error);
        throw new Error("Failed to update call start time");
    }
}


async function updateCallRecord(callId, callStatus) {
    try {
        const endedAt = new Date();
        const call = await Call.findById(callId);

        if (!call) {
            throw new Error("Call record not found");
        }

        const duration = calculateDuration(call.started_at, endedAt);

        const updatedCall = await Call.findByIdAndUpdate(
            callId,
            {
                call_status: callStatus,
                ended_at: endedAt,
                duration: duration
            },
            { new: true }
        );

        return updatedCall;
    } catch (error) {
        console.error("Error updating call record:", error);
        throw new Error("Failed to update call record");
    }
}


function calculateDuration(start, end) {
    const diff = end - start;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

async function insertCallRecord(callerId, receiverId, callType, groupId = null) {
    try {
        console.log("caller" , callerId,"receiver: ", receiverId ,"type: ", callType)
        const newCall = new Call({
            caller: callerId,
            receiver: receiverId,
            group: groupId,
            call_type: callType,
            call_status: null
          
        });

        const savedCall = await newCall.save();
        console.log("call saved:" , savedCall)
        return savedCall;
    } catch (error) {
        console.error("Error inserting call record:", error);
        throw new Error("Failed to insert call record");
    }
}


async function getUserCalls(req, res) {
    const userId = req.user._id; 

    try {
        const calls = await Call.find({
            $or: [{ caller: userId }, { receiver: userId }]
        })
        .populate("caller", "name profile_picture") // Populate caller details
        .populate("receiver", "name profile_picture") // Populate receiver details
        .populate("group", "groupName members") // Populate group chat details if applicable
        .sort({ started_at: -1 }) // Sort by started_at in descending order (most recent first)
        .lean(); // Convert to JSON format

        const filteredCalls = calls.map(call => {
            // Format timestamps
            call.started_at = summerizeTime(call.started_at);
            call.ended_at = call.ended_at ? summerizeTime(call.ended_at) : null;
            
            // Add relative time for duration if available
            if (call.duration) {
                call.duration = call.duration; // Duration is already in HH:MM:SS format
            }

            // Add isCaller flag
            call.isCaller = call.caller._id.toString() === userId.toString();

            return call;
        });

        return res.status(200).json({ success: true, calls: filteredCalls });
    } catch (error) {
        console.error("Error retrieving user calls:", error);
        throw new Error("Failed to retrieve user calls");
    }
}

module.exports = {
    getAllContacts,
    createChat,
    getUserChats,
    getChatMessages,
    uploadFile,
    insertCallRecord,
    answerCall,
    updateCallRecord,
    getUserCalls,
    getUserCalls
}