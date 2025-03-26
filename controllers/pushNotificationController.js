// controllers/pushNotificationController.js
const Subscription = require('../models/Subscription');
const webpush = require('web-push');
require('dotenv').config(); // Import dotenv to load environment variables
// const VAPID_KEYS = require('../config/webPushConfig'); // Import the VAPID keys

// // Set VAPID keys for push notifications
// webpush.setVapidDetails(
//     'mailto:your-email@example.com',  // Replace with your email
//     VAPID_KEYS.publicKey,
//     VAPID_KEYS.privateKey
// );



// Get VAPID keys from the .env file
const VAPID_KEYS = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
};

// Set VAPID keys for push notifications
webpush.setVapidDetails(
    'mailto:your-email@example.com',  // Replace with your email
    VAPID_KEYS.publicKey,
    VAPID_KEYS.privateKey
);



exports.subscribeUser = async (req, res) => {
    try {
        const body = req.body
        const userId = req.user?._id
        console.log('This is the push body', { ...body,userId });

        const subscription = new Subscription({ ...body, userId });
        await subscription.save();
        res.status(200).json({ message: 'Subscription saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save subscription', error });
    }
};



// Function to send a push notification
exports.sendPushNotification = (subscription, payload) => {
    webpush.sendNotification(subscription, JSON.stringify(payload))
        .then(response => {
            console.log('Push notification sent successfully:', response);
        })
        .catch(err => {
            console.error('Error sending push notification:', err);
        });
};

// Controller to handle the sending of messages and push notifications
exports.sendMessageWithNotification = async (req, res) => {
    const { chatId, message } = req.body;

    // Assuming the Chat model has a method to find a chat and populate its members
    const chat = await Chat.findById(chatId).populate('members', 'email');
    const users = chat.members;

    // Loop over all members of the chat and send notifications to those who are subscribed
    users.forEach(async (user) => {
        const userSubscription = await Subscription.findOne({ userId: user._id });
        if (userSubscription) {
            const payload = {
                title: 'New Message in Your Chat',
                body: message.content,
                icon: '/images/chat-icon.png',
                badge: '/images/badge-icon.png',
            };

            sendPushNotification(userSubscription, payload);
        }
    });

    res.status(200).json({ message: 'Message sent and notifications dispatched' });
};
