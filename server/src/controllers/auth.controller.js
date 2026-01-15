const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma.client');
const { z } = require('zod');

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['VENDOR', 'CUSTOMER']),
    // shopName is required only if role is VENDOR
    shopName: z.string().optional()
});

const register = async (req, res) => {
    try {
        const { name, email, password, role, shopName } = registerSchema.parse(req.body);

        if (role === 'VENDOR' && !shopName) {
            return res.status(400).json({ error: 'Shop Name is required for Vendors' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await prisma.$transaction(async (prisma) => {
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    passwordHash,
                    role
                }
            });

            if (role === 'VENDOR') {
                await prisma.vendor.create({
                    data: {
                        userId: user.id,
                        shopName,
                        status: 'PENDING'
                    }
                });
            }

            return user;
        });

        res.status(201).json({ message: 'User registered successfully', userId: result.id });
    } catch (error) {
        res.status(400).json({ error: error.message || 'Registration failed' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email }, include: { vendor: true } });

        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

        // For vendors, check if approved to login? Requirement says "Vendor login -> dashboard access".
        // Usually they can login but might see pending status. 

        // Payload
        const token = jwt.sign(
            { userId: user.id, role: user.role, vendorId: user.vendor?.id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token, user: { id: user.id, name: user.name, role: user.role, vendorStatus: user.vendor?.status } });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

module.exports = { register, login };
