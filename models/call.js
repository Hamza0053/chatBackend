
const mongoose = require('mongoose');

const CallSchema = new mongoose.Schema({
    caller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }, // If it's a group call
    call_type: { type: String, enum: ["audio", "video"], required: true },
    call_status: { type: String, enum: ["missed", "ended", "ongoing"], default: "ongoing" },
    duration: { type: String }, // In HH:MM:SS format
    started_at: { type: Date, default: Date.now },
    ended_at: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Call', CallSchema);
