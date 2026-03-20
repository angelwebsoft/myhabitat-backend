const mongoose = require('mongoose');

const SocietySchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    total_flats: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Society', SocietySchema);
