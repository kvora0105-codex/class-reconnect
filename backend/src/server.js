import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { nanoid } from 'nanoid';
import Conversation from './models/Conversation.js';
import connectDB from './config/database.js';
import User from './models/User.js';
import jwt from 'jsonwebtoken';
import resourceRoutes from './routes/resources.js';
import qaRoutes from './routes/qaRoutes.js';
import quizzesRoutes from './routes/quizzes.js';
import Resource from './models/Resource.js';
import DeletedDefault from './models/DeletedDefault.js';
import sampleResources from './data/sampleResources.js';
import LoginActivity from './models/LoginActivity.js';
import ProfileChangeLog from './models/ProfileChangeLog.js';
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Serve static files from frontend
const frontendPath = join(process.cwd(), '..', 'frontend', 'public');
app.use(express.static(frontendPath));

// Serve uploaded files
const uploadsPath = join(process.cwd(), 'uploads');
if (!existsSync(uploadsPath)) {
    mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Serve landing page as default route (needs to be before API routes)
app.get('/', (req, res) => {
    res.redirect('/landing.html');
});

// Fallback route for root domain without path
app.get('http://localhost:3000', (req, res) => {
    res.redirect('/landing.html');
});

// API Routes
app.use('/api/resources', resourceRoutes);
app.use('/api/qa', qaRoutes);
app.use('/api/quizzes', quizzesRoutes);

// Simple JSON file DB for conversations
const DATA_DIR = join(process.cwd(), 'data');
const DB_FILE = join(DATA_DIR, 'db.json');

function ensureDb() {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    if (!existsSync(DB_FILE)) {
        writeFileSync(DB_FILE, JSON.stringify({ conversations: [], deletedConversations: [] }, null, 2), 'utf8');
    }
}

function readDb() {
    ensureDb();
    try {
        const data = JSON.parse(readFileSync(DB_FILE, 'utf8'));
        if (!Array.isArray(data.conversations)) data.conversations = [];
        if (!Array.isArray(data.deletedConversations)) data.deletedConversations = [];
        return data;
    } catch (e) {
        return { conversations: [], deletedConversations: [] };
    }
}

function writeDb(db) {
    ensureDb();
    writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
});

// Predefined questions loader
app.get('/api/predefined/questions', (_req, res) => {
    try {
        const filePath = join(process.cwd(), '..', 'chat-gpt', 'predefined_questions', 'questions.txt');
        let text = '';
        try {
            text = readFileSync(filePath, 'utf8');
        } catch (e) {
            return res.status(404).json({ error: 'questions.txt not found' });
        }
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const questions = [];
        for (const line of lines) {
            const m = line.match(/^\d+\.\s*(.+)$/);
            if (m) questions.push(m[1]);
        }
        res.json({ success: true, count: questions.length, questions });
    } catch (error) {
        console.error('Error loading predefined questions:', error);
        res.status(500).json({ error: 'Server error loading predefined questions' });
    }
});

// Authentication Routes
// Student Registration
app.post('/api/auth/register/student', async (req, res) => {
    try {
        const { firstName, lastName, email, password, branch, semester } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !password || !branch || !semester) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Create new student
        const user = new User({
            firstName,
            lastName,
            email,
            password,
            role: 'student',
            branch,
            semester
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Student registered successfully',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Student registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Teacher Registration
app.post('/api/auth/register/teacher', async (req, res) => {
    try {
        const { firstName, lastName, email, password, department, subject, employeeId, yearsExperience, hobby } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !password || !department || !subject || !employeeId || !yearsExperience || !hobby) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { employeeId }] });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email or employee ID already exists' });
        }

        // Create new teacher
        const user = new User({
            firstName,
            lastName,
            email,
            password,
            role: 'teacher',
            department,
            subject,
            employeeId,
            yearsExperience,
            hobby
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Teacher registered successfully',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Teacher registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const requestedRole = role ? String(role).trim().toLowerCase() : undefined;

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (requestedRole && requestedRole !== user.role) {
            return res.status(403).json({ error: 'Incorrect role selected' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        try {
            await LoginActivity.create({
                userId: user._id,
                role: user.role,
                event: 'login',
                ip: req.ip,
                userAgent: req.headers['user-agent']
            });
        } catch (_) {}

        res.json({ message: 'Login successful', token, user: user.toJSON() });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
        await LoginActivity.create({
            userId: req.user.userId,
            role: req.user.role,
            event: 'logout',
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });
        res.json({ message: 'Logout recorded' });
    } catch (error) {
        console.error('Logout log error:', error);
        res.status(500).json({ error: 'Server error during logout log' });
    }
});

// Get current user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: user.toJSON() });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updateData = { ...req.body };
        
        // Remove password from update data if present
        delete updateData.password;

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            updateData,
            { new: true, runValidators: true }
        );

        try {
            const before = user.toJSON();
            const after = updatedUser.toJSON();
            const changes = Object.keys(updateData)
                .map(k => ({ field: k, oldValue: before[k], newValue: after[k] }))
                .filter(ch => String(ch.oldValue) !== String(ch.newValue));
            if (changes.length > 0) {
                await ProfileChangeLog.create({
                    userId: req.user.userId,
                    role: req.user.role,
                    changes,
                    ip: req.ip,
                    userAgent: req.headers['user-agent']
                });
            }
        } catch (_) {}

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser.toJSON()
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Server error updating profile' });
    }
});

// List conversations by userId
app.get('/api/conversations', authenticateToken, async (req, res) => {
    try {
        const userId = String(req.user.userId || '');
        if (!userId) return res.status(400).json({ error: 'userId is required' });
        const rows = await Conversation.find({ userId }).sort({ updatedAt: -1 }).lean();
        res.json(rows);
    } catch (e) {
        console.error('List conversations error:', e);
        res.status(500).json({ error: 'Server error listing conversations' });
    }
});

// Create conversation
app.post('/api/conversations', authenticateToken, async (req, res) => {
    try {
        const { title, messages } = req.body || {};
        const userId = String(req.user.userId || '');
        const user = await User.findById(userId).lean();
        const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
        const role = req.user.role;
        const count = await Conversation.countDocuments({ userId });
        const conv = await Conversation.create({ userId, userName, role, title: (title && title.trim()) || `Conversation ${count + 1}`, messages: Array.isArray(messages) ? messages : [] });
        res.status(201).json(conv.toJSON());
    } catch (e) {
        console.error('Create conversation error:', e);
        res.status(500).json({ error: 'Server error creating conversation' });
    }
});

// Update conversation (full replace)
app.put('/api/conversations/:id', authenticateToken, async (req, res) => {
    try {
        const convId = String(req.params.id);
        const { title, messages } = req.body || {};
        const userId = String(req.user.userId || '');
        const conv = await Conversation.findOneAndUpdate(
            { _id: convId, userId },
            { $set: { title: title, messages: Array.isArray(messages) ? messages : [] } },
            { new: true }
        );
        if (!conv) return res.status(404).json({ error: 'Not found' });
        res.json(conv.toJSON());
    } catch (e) {
        console.error('Update conversation error:', e);
        res.status(500).json({ error: 'Server error updating conversation' });
    }
});

// Delete conversation
app.delete('/api/conversations/:id', authenticateToken, async (req, res) => {
    try {
        const convId = String(req.params.id);
        const userId = String(req.user.userId || '');
        const conv = await Conversation.findOneAndDelete({ _id: convId, userId });
        if (!conv) return res.status(404).json({ error: 'Not found' });
        res.json({ ok: true });
    } catch (e) {
        console.error('Delete conversation error:', e);
        res.status(500).json({ error: 'Server error deleting conversation' });
    }
});

// Archive deleted/cleared conversations
import mongoose from 'mongoose';
const deletedConversationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    userName: { type: String },
    role: { type: String, enum: ['student', 'teacher'] },
    id: { type: String },
    title: { type: String },
    messages: { type: [Object], default: [] },
    reason: { type: String, enum: ['delete', 'clear', 'unknown'], default: 'unknown' },
    archivedAt: { type: Date, default: Date.now }
});
const DeletedConversation = mongoose.model('DeletedConversation', deletedConversationSchema);

app.get('/api/deleted-conversations', authenticateToken, async (req, res) => {
    try {
        const userId = String(req.user.userId || '');
        const rows = await DeletedConversation.find({ userId }).sort({ archivedAt: -1 }).lean();
        res.json(rows);
    } catch (e) {
        console.error('List deleted conversations error:', e);
        res.status(500).json({ error: 'Server error listing deleted conversations' });
    }
});

app.post('/api/deleted-conversations', authenticateToken, async (req, res) => {
    try {
        const { id, title, messages, event } = req.body || {};
        const userId = String(req.user.userId || '');
        const user = await User.findById(userId).lean();
        const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
        const role = req.user.role;
        const row = await DeletedConversation.create({ userId, userName, role, id, title, messages: Array.isArray(messages) ? messages : [], reason: event === 'clear' ? 'clear' : event === 'delete' ? 'delete' : 'unknown' });
        res.status(201).json(row.toJSON());
    } catch (e) {
        console.error('Create deleted conversation error:', e);
        res.status(500).json({ error: 'Server error creating deleted conversation' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
    console.log(`Serving frontend from: ${frontendPath}`);
});



// Seed default static resources into the database (idempotent)
async function ensureDefaultTeacher() {
    try {
        // Prefer any existing teacher
        let teacher = await User.findOne({ role: 'teacher' });
        if (teacher) return teacher;

        // Create a system teacher if none exists
        const systemTeacher = new User({
            firstName: 'System',
            lastName: 'Teacher',
            email: 'system.teacher@classreconnect.local',
            password: 'Temp123!',
            role: 'teacher',
            department: 'Computer Science',
            subject: 'Other',
            employeeId: `SYS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
            yearsExperience: '6-10 years',
            hobby: 'Seeding default resources'
        });
        await systemTeacher.save();
        return systemTeacher;
    } catch (err) {
        console.error('[Seed] ensureDefaultTeacher error:', err);
        throw err;
    }
}

async function seedDefaultResources() {
    try {
        const existing = await Resource.find({}, { title: 1 }).lean();
        const existingTitles = new Set(existing.map(r => r.title));
        const deleted = await DeletedDefault.find({}, { title: 1 }).lean();
        const deletedTitles = new Set(deleted.map(d => d.title));
        const teacher = await ensureDefaultTeacher();

        const toInsert = sampleResources
            .filter(r => !existingTitles.has(r.title) && !deletedTitles.has(r.title))
            .map(r => ({
                ...r,
                uploadedBy: teacher._id,
                uploadedAt: new Date(),
                downloads: 0,
                isDefault: true
            }));

        if (toInsert.length > 0) {
            await Resource.insertMany(toInsert);
            console.log(`[Seed] Inserted ${toInsert.length} default resources`);
        } else {
            console.log('[Seed] No default resources to insert');
        }
    } catch (err) {
        console.error('[Seed] Error inserting default resources:', err);
    }
}

// Run seeding after DB connection
(async () => {
    try {
        await seedDefaultResources();
    } catch (_) {}
})();



