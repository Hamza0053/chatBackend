
const mongoose = require('mongoose');

const StatusSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status_type: { type: String, enum: ["text", "image", "video"], required: true },
    status_content: { type: String, required: true },
    visibility: { type: String, enum: ["everyone", "friends", "nobody"], default: "everyone" },
    expires_at: { type: Date, default: () => new Date(+new Date() + 24*60*60*1000) } // 24 hours expiry
}, { timestamps: true });

module.exports = mongoose.model('Status', StatusSchema);
