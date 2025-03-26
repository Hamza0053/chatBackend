// models/Subscription.js
const mongoose = require('mongoose');

// Database schema for storing push subscriptions
const subscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Link the subscription to a user
    endpoint: { type: String, required: true },
    keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
    },
    createdAt: { type: Date, default: Date.now },  // Optional: Store the creation date of the subscription
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
