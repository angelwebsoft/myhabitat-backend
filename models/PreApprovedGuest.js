const mongoose = require('mongoose');

const PreApprovedGuestSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    qr_token: { type: String, required: true, unique: true },
    resident_id: { type: String, required: true },
    visitor_name: { type: String, required: true },
    mobile: { type: String, required: true },
    vehicle_number: { type: String },
    valid_date: { type: Date, required: true },
    society_id: { type: String, required: true },
    status: { type: String, enum: ['pending', 'used'], default: 'pending' },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PreApprovedGuest', PreApprovedGuestSchema);
