const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    visitor_name: { type: String, required: true },
    mobile: { type: String, required: true },
    flat_number: { type: String, required: true },
    purpose: { type: String },
    photo_url: { type: String },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'checked-in', 'checked-out'],
        default: 'pending'
    },
    check_in_time: { type: Date },
    check_out_time: { type: Date },
    gatekeeper_id: { type: String, required: true },
    resident_id: { type: String, required: true },
    society_id: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Visitor', VisitorSchema);
