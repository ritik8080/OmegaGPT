import express from 'express';
import Thread from '../models/Thread.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all threads
router.get('/', protect, async (req, res) => {
    try {
        const threads = await Thread.find({ userId: req.user._id }).sort({ updatedAt: -1 }).select('threadId title updatedAt');
        res.status(200).json(threads);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching threads' });
    }
});

// Get a specific thread by ID
router.get('/:threadId', protect, async (req, res) => {
    try {
        const thread = await Thread.findOne({ threadId: req.params.threadId, userId: req.user._id });
        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }
        res.status(200).json(thread);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching thread' });
    }
});

// Create a new thread (or it gets created automatically in chatRoutes, but keeping this for explicit creation)
router.post('/', protect, async (req, res) => {
    try {
        const { threadId, title, systemPrompt } = req.body;
        const newThread = new Thread({
            threadId,
            userId: req.user._id,
            title: title || 'New Chat',
            systemPrompt: systemPrompt || 'You are a helpful and intelligent assistant.',
            messages: []
        });
        await newThread.save();
        res.status(201).json(newThread);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error creating thread' });
    }
});

// Update thread title or system prompt
router.put('/:threadId', protect, async (req, res) => {
    try {
        const { title, systemPrompt } = req.body;
        const thread = await Thread.findOneAndUpdate(
            { threadId: req.params.threadId, userId: req.user._id },
            { $set: { ...(title && { title }), ...(systemPrompt && { systemPrompt }) } },
            { new: true }
        );
        res.status(200).json(thread);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error updating thread' });
    }
});

// Delete a thread
router.delete('/:threadId', protect, async (req, res) => {
    try {
        await Thread.findOneAndDelete({ threadId: req.params.threadId, userId: req.user._id });
        res.status(200).json({ message: 'Thread deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error deleting thread' });
    }
});

// Clear messages in a thread
router.delete('/:threadId/messages', protect, async (req, res) => {
    try {
        const thread = await Thread.findOneAndUpdate(
            { threadId: req.params.threadId, userId: req.user._id },
            { $set: { messages: [] } },
            { new: true }
        );
        res.status(200).json(thread);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error clearing messages' });
    }
});

export default router;
