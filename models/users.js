const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, default: 'User Name'},
    userId: { type: String, unique: true, required: true, index: true },
    phone: { type: String, index: true },
    email: { type: String, unique: true, required: true, index: true },
    profile_picture: { type: String , default: 'profile.png' },
    bio: { type: String },
    status: { type: String, default: "Hey, I am using this app!" },
    last_seen: { type: Date, default: Date.now },
    online: { type: Boolean, default: false },

    blocked_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    privacy_settings: {
        last_seen: { type: String, enum: ["everyone", "friends", "nobody"], default: "everyone" },
        profile_photo: { type: String, enum: ["everyone", "friends", "nobody"], default: "everyone" },
        status: { type: String, enum: ["everyone", "friends", "nobody"], default: "everyone" }
    },
    isAI: { type: Boolean, default: false }
}, { timestamps: true });

// Indexing for faster searches
UserSchema.index({ email: 1, phone: 1 });

module.exports = mongoose.model('User', UserSchema);
