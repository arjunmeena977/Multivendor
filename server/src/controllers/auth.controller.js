const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Vendor = require('../models/vendor.model');
const { z } = require('zod');

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['VENDOR', 'CUSTOMER']),
    shopName: z.string().optional()
});

const register = async (req, res) => {
    try {
        const { name, email, password, role, shopName } = registerSchema.parse(req.body);

        if (role === 'VENDOR' && !shopName) {
            return res.status(400).json({ error: 'Shop Name is required for Vendors' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            passwordHash,
            role
        });

        if (role === 'VENDOR') {
            await Vendor.create({
                userId: user.id,
                shopName,
                status: 'PENDING'
            });
        }

        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message || 'Registration failed' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and explicitly populate vendor field
        // Since we are using virtuals, we just need to make sure we access it correctly or use populate
        // But populate works on refs.
        // Let's use two queries for safety or populate if supported.
        // Mongoose virtuals population:
        const user = await User.findOne({ email }).populate('vendor');

        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { userId: user.id, role: user.role, vendorId: user.vendor?.id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token, user: { id: user.id, name: user.name, role: user.role, vendorStatus: user.vendor?.status } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
};

module.exports = { register, login };
