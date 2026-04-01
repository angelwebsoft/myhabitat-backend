const mongoose = require('mongoose');

const MaintenanceBillSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    flat_number: { type: String, required: true, trim: true },
    resident_id: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    month: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    due_date: { type: Date, required: true },
    status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    society_id: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

// Compound index to ensure uniqueness for month + flat_number + year
MaintenanceBillSchema.index({ flat_number: 1, month: 1, year: 1, society_id: 1 }, { unique: true });

module.exports = mongoose.model('MaintenanceBill', MaintenanceBillSchema);
