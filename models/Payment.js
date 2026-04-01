const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    bill_id: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    payment_mode: { type: String, enum: ['cash', 'online'], required: true },
    transaction_id: { type: String, trim: true },
    paid_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema);
