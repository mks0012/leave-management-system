const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is missing in .env");
    process.exit(1);
}

// 1. Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch(err => console.error("Database Connection Error:", err));

// 2. Schemas
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['employee', 'employer'], required: true }
});

const LeaveSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employeeName: String,
    type: { type: String, required: true },
    start: { type: String, required: true }, // Format: YYYY-MM-DD
    end: { type: String, required: true },
    reason: String,
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Leave = mongoose.model('Leave', LeaveSchema);

// 3. Authentication Middleware
const auth = (role) => (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ msg: "Authentication required" });

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        if (role && decoded.role !== role) {
            return res.status(403).json({ msg: "Forbidden: Insufficient permissions" });
        }

        req.user = decoded;
        next();
    } catch (e) {
        res.status(401).json({ msg: "Session expired. Please login again." });
    }
};

// 4. Auth Routes
app.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ msg: "Email already registered" });

        const hashed = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hashed, role });
        res.status(201).json({ msg: "User registered successfully" });
    } catch (e) {
        res.status(500).json({ msg: "Registration failed", error: e.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                { id: user._id, role: user.role, name: user.name },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            res.json({ token, role: user.role, name: user.name });
        } else {
            res.status(400).json({ msg: "Invalid credentials" });
        }
    } catch (e) {
        res.status(500).json({ msg: "Login failed" });
    }
});

// 5. Leave Routes (Employee)
app.post('/leaves', auth('employee'), async (req, res) => {
    try {
        const { start, end } = req.body;

        // STANDOUT LOGIC: Prevent overlapping leaves for the same employee
        const overlap = await Leave.findOne({
            employeeId: req.user.id,
            status: { $ne: 'Rejected' }, // Ignore rejected ones
            $or: [
                { start: { $lte: end }, end: { $gte: start } }
            ]
        });

        if (overlap) {
            return res.status(400).json({ msg: "You already have a pending/approved leave during this period." });
        }

        await Leave.create({ 
            ...req.body, 
            employeeId: req.user.id, 
            employeeName: req.user.name 
        });
        res.json({ msg: "Leave requested successfully" });
    } catch (e) {
        res.status(500).json({ msg: "Error submitting leave" });
    }
});

app.get('/my-leaves', auth('employee'), async (req, res) => {
    const leaves = await Leave.find({ employeeId: req.user.id }).sort({ createdAt: -1 });
    res.json(leaves);
});

// 6. Admin Routes (Employer)
app.get('/admin/leaves', auth('employer'), async (req, res) => {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.json(leaves);
});

app.patch('/admin/leaves/:id', auth('employer'), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ msg: "Invalid status" });
        }
        await Leave.findByIdAndUpdate(req.params.id, { status });
        res.json({ msg: `Request ${status.toLowerCase()} successfully` });
    } catch (e) {
        res.status(500).json({ msg: "Update failed" });
    }
});

// 7. Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));