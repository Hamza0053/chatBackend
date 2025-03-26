const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    isGroupChat: { type: Boolean, default: false },
    groupName: { type: String, required: function () { return this.isGroupChat; } },
    groupAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', index: true },
    lastCall: { type: mongoose.Schema.Types.ObjectId, ref: 'Call', index: true },
    unreadMessages: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        count: { type: Number, default: 0 }
    }],
    // Soft delete tracking
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexing to optimize queries
ChatSchema.index({ members: 1 });

module.exports = mongoose.model('Chat', ChatSchema);
