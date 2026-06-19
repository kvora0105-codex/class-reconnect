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
import StudyGroup from './models/StudyGroup.js';
import GroupMember from './models/GroupMember.js';
import GroupMessage from './models/GroupMessage.js';
import multer from 'multer';
import path from 'path';
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

// Multer config for chat uploads
const chatStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const chatUpload = multer({ 
    storage: chatStorage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

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

// Smart Group Discovery API Endpoints

// Create a new study/discussion group
app.post('/api/groups', authenticateToken, async (req, res) => {
    try {
        const { name, description, tags, studyGoal, availability, maxMembers, branch, semester } = req.body;
        const userId = req.user.userId;
        const creatorRole = req.user.role; // 'student' or 'teacher'

        if (!name || !studyGoal || !availability || !branch || !semester) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const group = new StudyGroup({
            name,
            description,
            tags: tags || [],
            studyGoal,
            availability,
            maxMembers: maxMembers || 10,
            createdBy: userId,
            creatorRole,
            branch,
            semester
        });

        await group.save();

        await GroupMember.create({
            groupId: group._id,
            userId,
            role: 'admin'
        });

        res.status(201).json({ message: 'Group created successfully', group });
    } catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({ error: 'Server error creating group' });
    }
});

// Discover groups — students see student groups, teachers see teacher (discussion) groups
app.get('/api/groups/discover', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const requesterRole = req.user.role; // 'student' or 'teacher'
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Filter ONLY by creatorRole — all student groups visible to all students
        let query = { isActive: true, creatorRole: requesterRole };

        const groups = await StudyGroup.find(query).sort({ createdAt: -1 }).lean();

        const groupsWithMemberCount = await Promise.all(groups.map(async (group) => {
            const memberCount = await GroupMember.countDocuments({ groupId: group._id });
            const isMember = await GroupMember.exists({ groupId: group._id, userId });
            return { ...group, memberCount, isMember: !!isMember };
        }));

        const scoredGroups = groupsWithMemberCount.map(group => {
            let score = 0;
            if (user.studyGoal && group.studyGoal === user.studyGoal) score += 30;
            if (user.availability && group.availability === user.availability) score += 30;
            if (user.tags && user.tags.length > 0 && group.tags && group.tags.length > 0) {
                const tagMatches = user.tags.filter(tag => group.tags.includes(tag)).length;
                score += tagMatches * 10;
            }
            return { ...group, score };
        }).sort((a, b) => b.score - a.score);

        res.json({ groups: scoredGroups });
    } catch (error) {
        console.error('Discover groups error:', error);
        res.status(500).json({ error: 'Server error discovering groups' });
    }
});

// Get a group's details
app.get('/api/groups/:id', authenticateToken, async (req, res) => {
    try {
        const group = await StudyGroup.findById(req.params.id).lean();
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const members = await GroupMember.find({ groupId: group._id }).populate('userId', 'firstName lastName email').lean();
        const memberCount = members.length;
        const isMember = members.some(m => String(m.userId._id) === String(req.user.userId));

        res.json({ group, members, memberCount, isMember });
    } catch (error) {
        console.error('Get group details error:', error);
        res.status(500).json({ error: 'Server error fetching group details' });
    }
});

// Join a group
app.post('/api/groups/:id/join', authenticateToken, async (req, res) => {
    try {
        const group = await StudyGroup.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const memberCount = await GroupMember.countDocuments({ groupId: group._id });
        if (memberCount >= group.maxMembers) {
            return res.status(400).json({ error: 'Group is full' });
        }

        const existingMember = await GroupMember.exists({ groupId: group._id, userId: req.user.userId });
        if (existingMember) {
            return res.status(400).json({ error: 'Already a member of this group' });
        }

        await GroupMember.create({
            groupId: group._id,
            userId: req.user.userId,
            role: 'member'
        });

        res.json({ message: 'Successfully joined group' });
    } catch (error) {
        console.error('Join group error:', error);
        res.status(500).json({ error: 'Server error joining group' });
    }
});

// Leave a group
app.post('/api/groups/:id/leave', authenticateToken, async (req, res) => {
    try {
        const membership = await GroupMember.findOneAndDelete({
            groupId: req.params.id,
            userId: req.user.userId
        });

        if (!membership) {
            return res.status(404).json({ error: 'Not a member of this group' });
        }

        res.json({ message: 'Successfully left group' });
    } catch (error) {
        console.error('Leave group error:', error);
        res.status(500).json({ error: 'Server error leaving group' });
    }
});

// Get groups user is a member of — filtered by creator role to match requester's role
app.get('/api/my-groups', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const requesterRole = req.user.role;
        const memberships = await GroupMember.find({ userId }).populate('groupId').lean();
        // Filter out groups whose creatorRole doesn't match the requester's role
        // Show all groups the user is a member of (role-isolation is handled at discover level)
        const groups = memberships
            .filter(m => m.groupId)
            .map(async (m) => {
                const memberCount = await GroupMember.countDocuments({ groupId: m.groupId._id });
                return { ...m.groupId, role: m.role, memberCount };
            });
        const resolvedGroups = await Promise.all(groups);
        res.json({ groups: resolvedGroups });
    } catch (error) {
        console.error('Get my groups error:', error);
        res.status(500).json({ error: 'Server error fetching my groups' });
    }
});

// Update user's group discovery preferences
app.put('/api/user/group-preferences', authenticateToken, async (req, res) => {
    try {
        const { tags, studyGoal, availability } = req.body;
        const updateData = {};
        if (tags !== undefined) updateData.tags = tags;
        if (studyGoal) updateData.studyGoal = studyGoal;
        if (availability) updateData.availability = availability;

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Preferences updated successfully', user: user.toJSON() });
    } catch (error) {
        console.error('Update group preferences error:', error);
        res.status(500).json({ error: 'Server error updating preferences' });
    }
});

// Group Chat API Endpoints
app.get('/api/groups/:id/messages', authenticateToken, async (req, res) => {
    try {
        const groupId = req.params.id;
        const isMember = await GroupMember.exists({ groupId, userId: req.user.userId });
        if (!isMember) {
            return res.status(403).json({ error: 'Not a member of this group' });
        }
        const messages = await GroupMessage.find({ groupId }).sort({ createdAt: 1 }).lean();
        res.json({ messages });
    } catch (error) {
        console.error('Get group messages error:', error);
        res.status(500).json({ error: 'Server error fetching messages' });
    }
});

app.post('/api/groups/:id/messages', authenticateToken, chatUpload.single('file'), async (req, res) => {
    try {
        const groupId = req.params.id;
        const userId = req.user.userId;
        
        const isMember = await GroupMember.exists({ groupId, userId });
        if (!isMember) {
            return res.status(403).json({ error: 'Not a member of this group' });
        }

        const user = await User.findById(userId);
        const userName = `${user.firstName} ${user.lastName}`;

        const messageData = {
            groupId,
            userId,
            userName
        };

        if (req.body.message) {
            messageData.message = req.body.message;
        }

        if (req.file) {
            const fileUrl = `/uploads/${req.file.filename}`;
            if (req.file.mimetype.startsWith('image/')) {
                messageData.imageUrl = fileUrl;
            } else {
                messageData.fileUrl = fileUrl;
                messageData.fileName = req.file.originalname;
            }
        }

        if (!messageData.message && !messageData.imageUrl && !messageData.fileUrl) {
            return res.status(400).json({ error: 'Message or file required' });
        }

        const message = await GroupMessage.create(messageData);
        res.status(201).json({ message });
    } catch (error) {
        console.error('Send group message error:', error);
        res.status(500).json({ error: 'Server error sending message' });
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



