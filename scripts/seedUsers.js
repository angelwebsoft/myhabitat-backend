try {
    require('dotenv').config();
} catch (error) {
    // Fall back to the default Mongo URI when dotenv isn't installed locally.
}
const connectDB = require('../config/db');
const User = require('../models/User');

const demoUsers = [
    { uniqueId: 'adm_default_001', userName: 'Society Admin', role: 'admin', mobileNumber: '9000000099', societyId: 'default-society' },
    { uniqueId: 'gtk_default_001', userName: 'Main Gate Guard', role: 'gatekeeper', mobileNumber: '9000000098', societyId: 'default-society' },
    { uniqueId: 'res_a101_001', userName: 'Rahul Sharma', role: 'resident', mobileNumber: '9000000001', flatNumber: 'A-101', societyId: 'default-society' },
    { uniqueId: 'res_a102_001', userName: 'Priya Patel', role: 'resident', mobileNumber: '9000000002', flatNumber: 'A-102', societyId: 'default-society' },
    { uniqueId: 'res_a103_001', userName: 'Amit Verma', role: 'resident', mobileNumber: '9000000003', flatNumber: 'A-103', societyId: 'default-society' },
    { uniqueId: 'res_a104_001', userName: 'Sneha Iyer', role: 'resident', mobileNumber: '9000000004', flatNumber: 'A-104', societyId: 'default-society' },
    { uniqueId: 'res_b201_001', userName: 'Karan Mehta', role: 'resident', mobileNumber: '9000000005', flatNumber: 'B-201', societyId: 'default-society' },
    { uniqueId: 'res_b202_001', userName: 'Neha Singh', role: 'resident', mobileNumber: '9000000006', flatNumber: 'B-202', societyId: 'default-society' },
    { uniqueId: 'res_b203_001', userName: 'Rohit Gupta', role: 'resident', mobileNumber: '9000000007', flatNumber: 'B-203', societyId: 'default-society' },
    { uniqueId: 'res_b204_001', userName: 'Anjali Desai', role: 'resident', mobileNumber: '9000000008', flatNumber: 'B-204', societyId: 'default-society' },
    { uniqueId: 'res_c301_001', userName: 'Vikram Joshi', role: 'resident', mobileNumber: '9000000009', flatNumber: 'C-301', societyId: 'default-society' },
    { uniqueId: 'res_c302_001', userName: 'Pooja Nair', role: 'resident', mobileNumber: '9000000010', flatNumber: 'C-302', societyId: 'default-society' },
    { uniqueId: 'res_c303_001', userName: 'Manish Reddy', role: 'resident', mobileNumber: '9000000011', flatNumber: 'C-303', societyId: 'default-society' },
    { uniqueId: 'res_c304_001', userName: 'Divya Shah', role: 'resident', mobileNumber: '9000000012', flatNumber: 'C-304', societyId: 'default-society' }
];

async function seedUsers() {
    await connectDB();

    for (const user of demoUsers) {
        await User.updateOne(
            { uniqueId: user.uniqueId },
            { $set: user },
            { upsert: true }
        );
    }

    console.log(`Seeded ${demoUsers.length} users into MongoDB`);
    process.exit(0);
}

seedUsers().catch((error) => {
    console.error('Failed to seed users:', error);
    process.exit(1);
});
