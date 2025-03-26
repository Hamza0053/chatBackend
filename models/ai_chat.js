
const mongoose = require('mongoose');

const AIChatSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    query: { type: String, required: true },
    response: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('AIChat', AIChatSchema);
