import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';
import jwt from 'jsonwebtoken';
import Resource from '../models/Resource.js';
import DeletedDefault from '../models/DeletedDefault.js';
import ResourceAddedLog from '../models/ResourceAddedLog.js';
import ResourceDeletedLog from '../models/ResourceDeletedLog.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = /pdf|doc|docx|ppt|pptx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only document files (PDF, DOC, DOCX, PPT, PPTX, TXT) are allowed'));
        }
    }
});

// Upload resource
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { title, subject, semester, type, branch, description } = req.body;

        // Validation
        if (!title || !subject || !semester || !type || !branch) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Create resource
        const resource = new Resource({
            title,
            subject,
            semester,
            type,
            branch,
            description,
            filePath: req.file.path,
            uploadedBy: req.user.userId
        });

        await resource.save();
        try {
            await ResourceAddedLog.create({
                resourceId: resource._id,
                title: resource.title,
                subject: resource.subject,
                semester: resource.semester,
                type: resource.type,
                branch: resource.branch,
                description: resource.description,
                filePath: resource.filePath,
                uploadedBy: resource.uploadedBy,
                uploadedAt: resource.uploadedAt
            });
        } catch (_) {}

        res.status(201).json({
            message: 'Resource uploaded successfully',
            resource: resource
        });
    } catch (error) {
        console.error('Resource upload error:', error);
        console.error('Error stack:', error.stack);
        console.error('Request body:', req.body);
        console.error('Request file:', req.file);
        res.status(500).json({ 
            error: 'Server error during upload',
            details: error.message 
        });
    }
});

// Get all resources
router.get('/', async (req, res) => {
    try {
        const resources = await Resource.find()
            .populate('uploadedBy', 'firstName lastName')
            .sort({ uploadedAt: -1 });
        
        res.json({ resources });
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ error: 'Server error fetching resources' });
    }
});

// Get titles of default resources that were deleted (to prevent reappearing)
router.get('/deleted-defaults', async (_req, res) => {
    try {
        const rows = await DeletedDefault.find({}, { title: 1 }).lean();
        res.json({ titles: rows.map(r => r.title) });
    } catch (error) {
        console.error('Error fetching deleted defaults:', error);
        res.status(500).json({ error: 'Server error fetching deleted defaults' });
    }
});

// Delete resource (by any teacher)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        // Check if user is a teacher
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can delete resources' });
        }

        await Resource.findByIdAndDelete(req.params.id);
        try {
            await ResourceDeletedLog.create({
                resourceId: resource._id,
                title: resource.title,
                subject: resource.subject,
                semester: resource.semester,
                type: resource.type,
                branch: resource.branch,
                description: resource.description,
                filePath: resource.filePath,
                deletedBy: req.user.userId,
                deletedAt: new Date()
            });
        } catch (_) {}

        // If this was a default resource, record deletion to prevent re-seeding
        if (resource.isDefault) {
            try {
                await DeletedDefault.updateOne(
                    { title: resource.title },
                    { $set: { title: resource.title, deletedBy: req.user.userId, deletedAt: new Date() } },
                    { upsert: true }
                );
            } catch (e) {
                console.warn('Failed to record default deletion:', e.message);
            }
        }
        
        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        console.error('Error deleting resource:', error);
        res.status(500).json({ error: 'Server error deleting resource' });
    }
});

export default router;
