import express from 'express';
import Thread from '../models/Thread.js';
import OpenAI from 'openai';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const isOpenRouter = process.env.OPENAI_API_KEY?.startsWith('sk-or-');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
});

router.post('/', protect, async (req, res) => {
    const { message, threadId, model = isOpenRouter ? 'openai/gpt-3.5-turbo' : 'gpt-3.5-turbo' } = req.body;

    if (!message || !threadId) {
        return res.status(400).json({ error: 'Message and threadId are required' });
    }

    try {
        // Find or create thread
        let thread = await Thread.findOne({ threadId, userId: req.user._id });
        if (!thread) {
            thread = new Thread({ threadId, userId: req.user._id, title: message.substring(0, 30) });
            await thread.save();
        }

        // Add user message to thread
        thread.messages.push({ role: 'user', content: message });
        await thread.save();

        // Prepare messages for OpenAI
        const openAIMessages = [
            { role: 'system', content: thread.systemPrompt },
            ...thread.messages.map(msg => ({ role: msg.role, content: msg.content }))
        ];

        // Call OpenAI API with streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const stream = await openai.chat.completions.create({
            model: model,
            messages: openAIMessages,
            stream: true,
        });

        let fullReply = '';

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullReply += content;
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        res.write(`data: [DONE]\n\n`);
        res.end();

        // Save assistant reply to thread
        thread.messages.push({ role: 'assistant', content: fullReply });
        await thread.save();

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Error generating response' });
    }
});

export default router;
