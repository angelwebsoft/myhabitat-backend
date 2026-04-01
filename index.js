const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const connectDB = require('./config/db');

// Import Models
const User = require('./models/User');
const Visitor = require('./models/Visitor');
const Society = require('./models/Society');
const PreApprovedGuest = require('./models/PreApprovedGuest');
const { isPushEnabled, sendPush } = require('./services/push');
const MaintenanceBill = require('./models/MaintenanceBill');
const Payment = require('./models/Payment');


const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
    }
});

io.on('connection', (socket) => {
    const joinSociety = (societyId) => {
        if (typeof societyId !== 'string') return;
        const trimmed = societyId.trim();
        if (!trimmed) return;

        const nextRoom = `society:${trimmed}`;
        const previousRoom = socket.data?.societyRoom;

        if (previousRoom && previousRoom !== nextRoom) {
            socket.leave(previousRoom);
        }

        socket.join(nextRoom);
        socket.data.societyRoom = nextRoom;
    };

    joinSociety(socket.handshake.query?.societyId);

    socket.on('society:join', (societyId) => {
        joinSociety(societyId);
    });
});

const emitSocietyEvent = (societyId, event, payload) => {
    // Broadcast to all sockets to avoid missing events if a client fails to join its room.
    // Clients already filter data by `societyId` on the frontend.
    io.emit(event, payload);
};

const generateUniqueId = (role = 'usr') =>
    `${role.slice(0, 3).toLowerCase()}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const normalizeUserPayload = (payload = {}) => {
    const role = payload.role || 'resident';
    const uniqueId = payload.uniqueId || payload.id || generateUniqueId(role);
    const userName = payload.userName || payload.name;
    const mobileNumber = payload.mobileNumber || payload.mobile;
    const flatNumber = payload.flatNumber || payload.flat_number;
    const societyId = payload.societyId || payload.society_id || 'default-society';
    const fcmToken = payload.fcmToken || payload.fcm_token;
    const photo_url = payload.photoURL || payload.photo_url;
    const vehicle_number = payload.vehicleNumber || payload.vehicle_number;

    return {
        uniqueId,
        userName,
        mobileNumber,
        role,
        photo_url,
        flatNumber,
        societyId,
        fcmToken,
        vehicle_number
    };
};

const serializeUser = (user) => ({
    id: user.uniqueId,
    uniqueId: user.uniqueId,
    userName: user.userName,
    name: user.userName,
    mobileNumber: user.mobileNumber,
    mobile: user.mobileNumber,
    role: user.role,
    photoURL: user.photo_url,
    flatNumber: user.flatNumber,
    societyId: user.societyId,
    fcmToken: user.fcmToken,
    vehicleNumber: user.vehicle_number,
    createdAt: user.createdAt
});

const normalizeVisitorPayload = (payload = {}) => ({
    id: payload.id || `vis_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    visitor_name: payload.visitorName || payload.visitor_name,
    mobile: payload.mobile,
    flat_number: payload.flatNumber || payload.flat_number,
    purpose: payload.purpose,
    vehicle_number: payload.vehicleNumber || payload.vehicle_number,
    photo_url: payload.photoURL || payload.photo_url,
    status: payload.status || 'pending',
    check_in_time: payload.checkInTime || payload.check_in_time || null,
    check_out_time: payload.checkOutTime || payload.check_out_time || null,
    gatekeeper_id: payload.gatekeeperId || payload.gatekeeper_id,
    resident_id: payload.residentId || payload.resident_id,
    society_id: payload.societyId || payload.society_id
});

const serializeVisitor = (visitor) => ({
    id: visitor.id,
    visitorName: visitor.visitor_name,
    mobile: visitor.mobile,
    flatNumber: visitor.flat_number,
    purpose: visitor.purpose,
    vehicleNumber: visitor.vehicle_number,
    photoURL: visitor.photo_url,
    status: visitor.status,
    checkInTime: visitor.check_in_time,
    checkOutTime: visitor.check_out_time,
    gatekeeperId: visitor.gatekeeper_id,
    residentId: visitor.resident_id,
    societyId: visitor.society_id,
    createdAt: visitor.created_at
});

const normalizePreApprovedPayload = (payload = {}) => ({
    id: payload.id || `pre_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    qr_token: payload.qrToken || payload.qr_token || `q_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`,
    resident_id: payload.residentId || payload.resident_id,
    visitor_name: payload.visitorName || payload.visitor_name,
    mobile: payload.mobile,
    vehicle_number: payload.vehicleNumber || payload.vehicle_number,
    valid_date: payload.validDate || payload.valid_date,
    society_id: payload.societyId || payload.society_id,
    status: payload.status || 'pending'
});

const serializePreApproved = (guest) => ({
    id: guest.id,
    qrToken: guest.qr_token,
    residentId: guest.resident_id,
    visitorName: guest.visitor_name,
    mobile: guest.mobile,
    vehicleNumber: guest.vehicle_number,
    validDate: guest.valid_date,
    societyId: guest.society_id,
    status: guest.status,
    createdAt: guest.created_at
});

const normalizeBillPayload = (payload = {}) => ({
    id: payload.id || `bill_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    flat_number: payload.flat_number || payload.flatNumber,
    resident_id: payload.resident_id || payload.residentId,
    amount: payload.amount,
    month: payload.month,
    year: payload.year,
    due_date: payload.due_date || payload.dueDate,
    status: payload.status || 'unpaid',
    society_id: payload.society_id || payload.societyId
});

const serializeBill = (bill) => ({
    id: bill.id,
    flatNumber: bill.flat_number,
    flat_number: bill.flat_number,
    residentId: bill.resident_id,
    resident_id: bill.resident_id,
    amount: bill.amount,
    month: bill.month,
    year: bill.year,
    dueDate: bill.due_date,
    due_date: bill.due_date,
    status: bill.status,
    societyId: bill.society_id,
    society_id: bill.society_id,
    createdAt: bill.created_at,
    created_at: bill.created_at
});

const normalizePaymentPayload = (payload = {}) => ({
    id: payload.id || `pay_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    bill_id: payload.bill_id || payload.billId,
    amount: payload.amount,
    payment_mode: payload.payment_mode || payload.paymentMode,
    transaction_id: payload.transaction_id || payload.transactionId
});

const serializePayment = (payment) => ({
    id: payment.id,
    bill_id: payment.bill_id,
    billId: payment.bill_id,
    amount: payment.amount,
    payment_mode: payment.payment_mode,
    paymentMode: payment.payment_mode,
    transaction_id: payment.transaction_id,
    transactionId: payment.transaction_id,
    paid_at: payment.paid_at,
    paidAt: payment.paid_at
});


// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: true, limit: '8mb' }));

// --- API Test Route ---
app.get('/api/test', (req, res) => {
    res.json({ status: 'running', message: 'Server is up and running!' });
});
app.get("/check-db", async (req, res) => {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        res.json(collections);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// --- User Routes ---
app.get('/api/users', async (req, res) => {
    try {
        const query = {};

        if (req.query.role) {
            query.role = req.query.role;
        }
        if (req.query.societyId) {
            query.societyId = req.query.societyId;
        }
        if (req.query.mobileNumber || req.query.mobile) {
            query.mobileNumber = req.query.mobileNumber || req.query.mobile;
        }
        if (req.query.uniqueId || req.query.id) {
            query.uniqueId = req.query.uniqueId || req.query.id;
        }

        const users = await User.find(query).sort({ createdAt: -1 });
        res.json(users.map(serializeUser));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const newUser = new User(normalizeUserPayload(req.body));
        const savedUser = await newUser.save();
        res.status(201).json(serializeUser(savedUser));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.patch('/api/users/:id', async (req, res) => {
    try {
        const existing = await User.findOne({ uniqueId: req.params.id });
        if (!existing) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updates = {};
        const has = (key) => Object.prototype.hasOwnProperty.call(req.body, key);

        if (has('userName') || has('name')) {
            updates.userName = req.body.userName || req.body.name;
        }
        if (has('mobileNumber') || has('mobile')) {
            updates.mobileNumber = req.body.mobileNumber || req.body.mobile;
        }
        if (has('role')) {
            updates.role = req.body.role;
        }
        if (has('photoURL') || has('photo_url')) {
            updates.photo_url = req.body.photoURL || req.body.photo_url;
        }
        if (has('flatNumber') || has('flat_number')) {
            updates.flatNumber = req.body.flatNumber || req.body.flat_number;
        }
        if (has('societyId') || has('society_id')) {
            updates.societyId = req.body.societyId || req.body.society_id;
        }
        if (has('fcmToken') || has('fcm_token')) {
            updates.fcmToken = req.body.fcmToken || req.body.fcm_token;
        }
        if (has('vehicleNumber') || has('vehicle_number')) {
            updates.vehicle_number = req.body.vehicleNumber || req.body.vehicle_number;
        }

        const nextRole = (updates.role ?? existing.role) || 'resident';
        const nextFlat = Object.prototype.hasOwnProperty.call(updates, 'flatNumber') ? updates.flatNumber : existing.flatNumber;

        if (nextRole !== 'resident') {
            updates.flatNumber = undefined;
        } else if (!nextFlat || String(nextFlat).trim().length === 0) {
            return res.status(400).json({ error: 'flatNumber is required when role is resident' });
        }

        const updated = await User.findOneAndUpdate(
            { uniqueId: req.params.id },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(serializeUser(updated));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const deleted = await User.findOneAndDelete({ uniqueId: req.params.id });
        if (!deleted) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ ok: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// --- Visitor Routes ---
app.get('/api/visitors', async (req, res) => {
    try {
        const query = {};

        if (req.query.societyId) {
            query.society_id = req.query.societyId;
        }
        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.residentId) {
            query.resident_id = req.query.residentId;
        }
        if (req.query.gatekeeperId) {
            query.gatekeeper_id = req.query.gatekeeperId;
        }
        if (req.query.id) {
            query.id = req.query.id;
        }

        const visitors = await Visitor.find(query).sort({ created_at: -1 });
        res.json(visitors.map(serializeVisitor));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/visitors', async (req, res) => {
    try {
        const newVisitor = new Visitor(normalizeVisitorPayload(req.body));
        const savedVisitor = await newVisitor.save();
        const serialized = serializeVisitor(savedVisitor);
        emitSocietyEvent(serialized.societyId, 'visitor:created', serialized);

        // Push notify the resident (works only if they have an FCM token saved).
        if (isPushEnabled() && serialized.residentId) {
            const resident = await User.findOne({ uniqueId: serialized.residentId });
            if (resident?.fcmToken) {
                try {
                    await sendPush({
                        tokens: [resident.fcmToken],
                        title: 'Visitor Request',
                        body: `${serialized.visitorName} is at the gate.`,
                        data: { type: 'visitor_request', visitorId: serialized.id, societyId: serialized.societyId }
                    });
                } catch (e) {
                    console.error('[push] Failed to notify resident:', e?.message || e);
                }
            }
        }

        res.status(201).json(serialized);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.patch('/api/visitors/:id', async (req, res) => {
    try {
        const before = await Visitor.findOne({ id: req.params.id });
        const updates = {};

        if (req.body.status) {
            updates.status = req.body.status;
        }
        if (Object.prototype.hasOwnProperty.call(req.body, 'checkInTime')) {
            updates.check_in_time = req.body.checkInTime;
        }
        if (Object.prototype.hasOwnProperty.call(req.body, 'checkOutTime')) {
            updates.check_out_time = req.body.checkOutTime;
        }
        if (Object.prototype.hasOwnProperty.call(req.body, 'photoURL')) {
            updates.photo_url = req.body.photoURL;
        }
        if (Object.prototype.hasOwnProperty.call(req.body, 'vehicleNumber') || Object.prototype.hasOwnProperty.call(req.body, 'vehicle_number')) {
            updates.vehicle_number = req.body.vehicleNumber || req.body.vehicle_number;
        }

        const updatedVisitor = await Visitor.findOneAndUpdate(
            { id: req.params.id },
            { $set: updates },
            { new: true }
        );

        if (!updatedVisitor) {
            return res.status(404).json({ error: 'Visitor not found' });
        }

        const serialized = serializeVisitor(updatedVisitor);
        emitSocietyEvent(serialized.societyId, 'visitor:updated', serialized);

        // Push notify the gatekeeper when resident approves/rejects.
        const nextStatus = serialized.status;
        const prevStatus = before?.status;
        if (
            isPushEnabled() &&
            updates.status &&
            nextStatus !== prevStatus &&
            (nextStatus === 'approved' || nextStatus === 'rejected') &&
            serialized.gatekeeperId
        ) {
            const gatekeeper = await User.findOne({ uniqueId: serialized.gatekeeperId });
            if (gatekeeper?.fcmToken) {
                const actionLabel = nextStatus === 'approved' ? 'approved' : 'rejected';
                try {
                    await sendPush({
                        tokens: [gatekeeper.fcmToken],
                        title: 'Visitor Update',
                        body: `Flat ${serialized.flatNumber} ${actionLabel} ${serialized.visitorName}.`,
                        data: { type: 'visitor_update', visitorId: serialized.id, societyId: serialized.societyId, status: nextStatus }
                    });
                } catch (e) {
                    console.error('[push] Failed to notify gatekeeper:', e?.message || e);
                }
            }
        }

        res.json(serialized);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// --- Pre-Approved Guest Routes ---
app.get('/api/preapproved', async (req, res) => {
    try {
        const query = {};

        if (req.query.societyId) query.society_id = req.query.societyId;
        if (req.query.residentId) query.resident_id = req.query.residentId;
        if (req.query.mobile) query.mobile = req.query.mobile;
        if (req.query.status) query.status = req.query.status;
        if (req.query.qrToken) query.qr_token = req.query.qrToken;

        // If asking for pending approvals, ignore expired dates.
        if (query.status === 'pending') {
            const today = new Date();
            const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            query.valid_date = { $gte: startOfToday };
        }

        const guests = await PreApprovedGuest.find(query).sort({ created_at: -1 });
        res.json(guests.map(serializePreApproved));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/preapproved', async (req, res) => {
    try {
        const payload = normalizePreApprovedPayload(req.body);
        if (!payload.resident_id || !payload.visitor_name || !payload.mobile || !payload.valid_date || !payload.society_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const created = await new PreApprovedGuest(payload).save();
        const serialized = serializePreApproved(created);
        emitSocietyEvent(serialized.societyId, 'preapproved:created', serialized);
        res.status(201).json(serialized);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/preapproved/consume', async (req, res) => {
    try {
        const token = req.body.qrToken || req.body.qr_token;
        const gatekeeperId = req.body.gatekeeperId || req.body.gatekeeper_id;
        if (!token || !gatekeeperId) {
            return res.status(400).json({ error: 'qrToken and gatekeeperId are required' });
        }

        const guest = await PreApprovedGuest.findOne({ qr_token: token, status: 'pending' });
        if (!guest) {
            return res.status(404).json({ error: 'Pre-approval not found or already used' });
        }

        const validDate = new Date(guest.valid_date);
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfValid = new Date(validDate.getFullYear(), validDate.getMonth(), validDate.getDate());
        if (startOfValid.getTime() < startOfToday.getTime()) {
            return res.status(400).json({ error: 'Pre-approval date has expired' });
        }

        guest.status = 'used';
        await guest.save();
        emitSocietyEvent(guest.society_id, 'preapproved:used', serializePreApproved(guest));

        const resident = await User.findOne({ uniqueId: guest.resident_id });
        const derivedFlat = resident?.flatNumber;
        if (!derivedFlat) {
            return res.status(400).json({ error: 'Resident flatNumber not found for this pre-approval' });
        }

        const newVisitor = new Visitor({
            id: `vis_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
            visitor_name: guest.visitor_name,
            mobile: guest.mobile,
            flat_number: derivedFlat,
            purpose: 'Pre-Approved Guest',
            vehicle_number: guest.vehicle_number,
            photo_url: req.body.photoURL || req.body.photo_url,
            status: 'checked-in',
            check_in_time: new Date(),
            check_out_time: null,
            gatekeeper_id: gatekeeperId,
            resident_id: guest.resident_id,
            society_id: guest.society_id
        });
        const savedVisitor = await newVisitor.save();

        const serializedGuest = serializePreApproved(guest);
        const serializedVisitor = serializeVisitor(savedVisitor);
        emitSocietyEvent(serializedVisitor.societyId, 'visitor:created', serializedVisitor);
        res.json({ guest: serializedGuest, visitor: serializedVisitor });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// --- Society Routes ---
app.get('/api/societies', async (req, res) => {
    try {
        const societies = await Society.find();
        res.json(societies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/societies', async (req, res) => {
    try {
        const newSociety = new Society(req.body);
        const savedSociety = await newSociety.save();
        res.status(201).json(savedSociety);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Maintenance Routes ---
app.post('/api/maintenance/create', async (req, res) => {
    try {
        const payload = normalizeBillPayload(req.body);
        if (!payload.flat_number || !payload.resident_id || !payload.amount || !payload.month || !payload.year || !payload.due_date || !payload.society_id) {
            console.error('[maintenance] Missing fields in payload:', payload);
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (payload.amount <= 0) {
            return res.status(400).json({ error: 'Amount must be positive' });
        }

        // Check for existing bill for the same month/year and flat number
        const existing = await MaintenanceBill.findOne({
            flat_number: payload.flat_number,
            month: payload.month,
            year: payload.year,
            society_id: payload.society_id
        });
        if (existing) {
            return res.status(400).json({ error: 'Bill already exists for this month and flat' });
        }

        // Check if resident exists
        const resident = await User.findOne({ uniqueId: payload.resident_id });
        if (!resident) {
            return res.status(400).json({ error: 'Invalid resident_id' });
        }

        const newBill = new MaintenanceBill(payload);
        await newBill.save();
        res.status(201).json({ message: 'Bill created' });
    } catch (error) {
        console.error('[maintenance] Create error:', error.message);
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/maintenance/all', async (req, res) => {
    try {
        const query = {};
        if (req.query.society_id || req.query.societyId) {
            query.society_id = req.query.society_id || req.query.societyId;
        }
        const bills = await MaintenanceBill.find(query).sort({ created_at: -1 });
        res.json(bills.map(serializeBill));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/maintenance/my', async (req, res) => {
    try {
        const resident_id = req.query.resident_id || req.query.residentId;
        if (!resident_id) {
            return res.status(400).json({ error: 'resident_id is required' });
        }
        const bills = await MaintenanceBill.find({ resident_id }).sort({ created_at: -1 });
        res.json(bills.map(serializeBill));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/maintenance/pay', async (req, res) => {
    try {
        const { bill_id, amount, payment_mode, transaction_id } = req.body;
        if (!bill_id || !amount || !payment_mode) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const bill = await MaintenanceBill.findOne({ id: bill_id });
        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        if (bill.status === 'paid') {
            return res.status(400).json({ error: 'Bill is already paid' });
        }

        // Create payment record
        const paymentPayload = normalizePaymentPayload(req.body);
        const newPayment = new Payment(paymentPayload);
        await newPayment.save();

        // Update bill status
        bill.status = 'paid';
        await bill.save();

        res.json({ message: 'Payment successful' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


app.use((error, req, res, next) => {
    if (error?.type === 'entity.too.large') {
        return res.status(413).json({
            error: 'Uploaded image is too large. Please capture a smaller photo and try again.'
        });
    }

    return next(error);
});

server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
