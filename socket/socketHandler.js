const Message = require("../models/messages"); // Import Message model
const User = require("../models/users"); // Import User model
const Chat = require("../models/chat"); // Import Chat model
const Subscription = require("../models/Subscription"); // Import Chat model
const pushNotificationController = require('../controllers/pushNotificationController')
const activeUsers = new Map(); // Store active users and their socket IDs
const { generateAIResponse } = require("../controllers/ai_chat")
const sendPushNotification = pushNotificationController.sendPushNotification
const path = require("path")
const fs = require("fs")
// const sendPushNotification = (subscription, payload) => {
//     webpush.sendNotification(subscription, JSON.stringify(payload))
//         .then(response => {
//             console.log('Push notification sent successfully:', response);
//         })
//         .catch(err => {
//             console.error('Error sending push notification:', err);
//         });
// };





const chatHandler = (io) => {
    io.on("connection", (socket) => {

        // 🟢 User joins the chat
        socket.on("join-chat", async ({ userId, chatId }) => {
            socket.join(chatId);
            activeUsers.set(userId, socket.id);
            await User.findByIdAndUpdate(userId, { online: true });

            const chat = await Chat.findById(chatId);

            const unreadCount = chat?.unreadMessages?.find(u => u.userId.toString() === userId.toString())?.count || 0;

            io.to(socket.id).emit("unread-message-count", { chatId, count: unreadCount });
        });


        // 📨 User sends a message
        socket.on("send-message", async ({ chatId, sender, message_content, message_type, file }) => {
            try {
                console.log('New Message is ', file);
                // let filePath = null
                // if (file) {
                //     // const fileName = `${Date.now()}-${file.name}`
                //     // const uploadPath = path.join(__dirname, '../uploads/messages', fileName)
                //     // console.log('FILE PATH IS == >', uploadPath);
                //     // if (uploadPath) {
                //     //     fs.writeFileSync(uploadPath, Buffer.from(file.data, 'base64'))
                //     //     filePath = fileName
                //     // }
                // }

                // Save message in DB
                const message = new Message({
                    chat: chatId,
                    sender,
                    message_content,
                    message_type,
                    file: file,
                    read: false // Initially, the message is unread
                });
                await message.save();
                // Populate sender before emitting
                const populatedMessage = await Message.findById(message._id)
                    .populate("sender", "name profile_picture")
                    .populate("replyTo", "message_content sender");
                // Update last message in the chat
                await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });
                // 🔥 Deliver message in real-time to users in the chat room
                const chat = await Chat.findById(chatId).populate("members", "_id");
                // Loop through chat members and deliver message
                chat.members.forEach(async (member, index) => {
                    console.log('FOR EACH', index);
                    if (member._id.toString() !== sender.toString()) {
                        const recipientSocket = activeUsers.get(member._id.toString());
                        // Increase unread count
                        await Chat.findOneAndUpdate(
                            { _id: chatId, "unreadMessages.userId": member._id }, // Search for the document and matching array element
                            { $inc: { "unreadMessages.$.count": 1 } }, // Increment count if found
                            { new: true }
                        ).then(async (result) => {
                            if (!result) {
                                // If no match found, add a new unreadMessages entry
                                await Chat.findOneAndUpdate(
                                    { _id: chatId },
                                    { $push: { unreadMessages: { userId: member._id, count: 1 } } },
                                    { new: true, upsert: true }
                                );
                            }
                        });


                        if (recipientSocket) {
                            console.log('message is send toward onlineUser ', member);
                            io.to(recipientSocket).emit("receive-message", populatedMessage);
                        }
                        else {
                            const userSubscription = await Subscription.findOne({ userId: member._id.toString() });
                            if (userSubscription) {
                                const payload = {
                                    title: 'New Message in Your Chat',
                                    body: message_content,
                                    icon: '/images/chat-icon.png',
                                    badge: '/images/badge-icon.png',
                                    data: {
                                        chatId: chatId,
                                        message: populatedMessage
                                    }
                                };
                                sendPushNotification(userSubscription, payload);
                            }
                        }
                    }






                });

                // ==================
                // AI CHAT HANDLING
                const aiUser = await User.findOne({ isAI: true }).select("_id");
                if (chat.members.some(member => member._id.toString() === aiUser._id.toString())) {
                    console.log("🤖 AI detected in chat, generating response...");

                    // 5️⃣ Generate AI Response with Caching
                    const aiResponseText = await generateAIResponse(message_content);

                    // 6️⃣ Save AI Response in DB
                    const aiMessage = new Message({
                        chat: chatId,
                        sender: aiUser._id,
                        message_content: aiResponseText,
                        message_type: "text",
                        status: "sent"
                    });

                    await aiMessage.save();

                    // Populate AI response before emitting
                    const populatedAIMessage = await Message.findById(aiMessage._id)
                        .populate("sender", "name profile_picture");

                    // 7️⃣ Emit AI Message to Chat Participants
                    io.to(chatId).emit("receive-message", populatedAIMessage);
                }





            } catch (error) {
                console.error("Error sending message:", error);
            }
        });


        socket.on('message-read', async ({ chatId, userId }) => {
            try {
                // Mark messages as read
                await Message.updateMany(
                    { chat: chatId, readBy: { $nin: [userId] } },
                    { $push: { readBy: userId } }
                );

                await Chat.findOneAndUpdate(
                    { _id: chatId, "unreadMessages.userId": userId },
                    { $set: { "unreadMessages.$[elem].count": 0 } },
                    { arrayFilters: [{ "elem.userId": userId }] } // Ensure match exists
                );

                console.log('messages is read ', { chatId, userId });

                // Emit updated unread count
                const recipientSocket = activeUsers.get(userId?.toString());
                if (recipientSocket) {
                    io.to(recipientSocket).emit('unread-message-count', { chatId, count: 0 });
                }

            } catch (error) {
                console.error("Error marking message as read:", error);
            }
        });

        // 🟡 User disconnects
        socket.on("disconnect", async () => {
            console.log("User disconnected:", socket.id);
            let disconnectedUser = null;

            // Find user by socket ID
            for (const [userId, socketId] of activeUsers.entries()) {
                if (socketId === socket.id) {
                    disconnectedUser = userId;
                    console.log('desconnected user deleted');

                    activeUsers.delete(userId);
                    break;
                }
            }

            if (disconnectedUser) {
                await User.findByIdAndUpdate(disconnectedUser, { online: false, last_seen: new Date() });
                console.log(`User ${disconnectedUser} is now offline.`);
            }
        });
    });
};

module.exports = chatHandler;
