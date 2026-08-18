import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'omegagpt_secret', {
        expiresIn: '30d',
    });
};

// Register user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const user = await User.create({ username, email, password });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ error: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Get user profile (Protected)
router.get('/profile', protect, async (req, res) => {
    res.json(req.user);
});

// OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/' }), (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`http://localhost:5173/?token=${token}`);
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: 'http://localhost:5173/' }), (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`http://localhost:5173/?token=${token}`);
});

router.get('/linkedin', passport.authenticate('linkedin', { state: true }));
router.get('/linkedin/callback', passport.authenticate('linkedin', { session: false, failureRedirect: 'http://localhost:5173/' }), (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`http://localhost:5173/?token=${token}`);
});

export default router;
