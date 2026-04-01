const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    uniqueId: { type: String, required: true, unique: true },
    userName: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true, unique: true, trim: true },
    role: { type: String, enum: ['admin', 'resident', 'gatekeeper'], default: 'resident' },
    photo_url: { type: String },
    flatNumber: {
        type: String,
        trim: true,
        validate: {
            validator(value) {
                if (this.role === 'resident') {
                    return typeof value === 'string' && value.trim().length > 0;
                }
                return true;
            },
            message: 'flatNumber is required when role is resident'
        }
    },
    societyId: { type: String, required: true, trim: true },
    residentType: {
        type: String,
        enum: ['owner', 'tenant'],
        default: 'owner',
        required: function () { return this.role === 'resident'; }
    },
    owner_id: { type: String, trim: true },
    vehicle_number: { type: String, trim: true },
    fcmToken: { type: String },
    createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('validate', function (next) {
    if (this.role !== 'resident') {
        this.flatNumber = undefined;
        this.vehicle_number = undefined;
    }
    next();
});

module.exports = mongoose.model('User', UserSchema);
