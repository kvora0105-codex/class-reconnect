const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get all conversations for a user
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'conversations',
            select: 'title lastMessage updatedAt',
            options: { sort: { 'updatedAt': -1 } }
        });

        res.json(user.conversations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create a new conversation
router.post('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const newConversation = {
            title: req.body.title || 'New Conversation',
            messages: [],
            lastMessage: null
        };

        user.conversations.push(newConversation);
        await user.save();

        res.json(newConversation);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get messages for a specific conversation
router.get('/:conversationId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const conversation = user.conversations.id(req.params.conversationId);

        if (!conversation) {
            return res.status(404).json({ msg: 'Conversation not found' });
        }

        res.json(conversation.messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add a message to a conversation
router.post('/:conversationId/messages', auth, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ msg: 'Message is required' });
        }

        const user = await User.findById(req.user.id);
        const conversation = user.conversations.id(req.params.conversationId);

        if (!conversation) {
            return res.status(404).json({ msg: 'Conversation not found' });
        }

        const newMessage = {
            content: message,
            timestamp: Date.now(),
            sender: req.user.id
        };

        conversation.messages.push(newMessage);
        conversation.lastMessage = message;
        conversation.updatedAt = Date.now();

        await user.save();
        res.json(newMessage);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete a conversation
router.delete('/:conversationId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const conversation = user.conversations.id(req.params.conversationId);

        if (!conversation) {
            return res.status(404).json({ msg: 'Conversation not found' });
        }

        conversation.remove();
        await user.save();

        res.json({ msg: 'Conversation deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Clear conversation history
router.put('/:conversationId/clear', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const conversation = user.conversations.id(req.params.conversationId);

        if (!conversation) {
            return res.status(404).json({ msg: 'Conversation not found' });
        }

        conversation.messages = [];
        conversation.lastMessage = null;
        await user.save();

        res.json({ msg: 'Conversation history cleared' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
