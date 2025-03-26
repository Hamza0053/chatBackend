// In models/messages.js (add the readBy field)
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message_type: { type: String, enum: ["text", "image", "video", "audio", "file"], required: true },
    message_content: { type: String, required: true },
    status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track users who have read the message
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    reactions: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, emoji: String }],
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    created_at: { type: Date, default: Date.now },
    file:{type:String}
}, { timestamps: true });

MessageSchema.pre('save', function (next) {
    if (this.isModified('message_content')) {
        this.isEdited = true;
        this.editedAt = new Date();
    }
    next();
});

module.exports = mongoose.model('Message', MessageSchema);
