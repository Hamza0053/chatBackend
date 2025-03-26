const mongoose = require('mongoose');


const MediaSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    file_url: { type: String, required: true },
    file_type: { type: String, enum: ["image", "video", "audio", "file"], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Media', MediaSchema);
