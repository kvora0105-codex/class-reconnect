import express from 'express';
import jwt from 'jsonwebtoken';
import QuizCreated from '../models/QuizCreated.js';
import QuizResult from '../models/QuizResult.js';

const router = express.Router();

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

router.post('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can create quizzes' });
        }

        const { name, duration, branch, semester, subject, numQuestions, setPaper, questions } = req.body;

        if (!name || !duration || !branch || !semester || !subject || !numQuestions) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const quiz = new QuizCreated({
            name,
            duration,
            branch,
            semester,
            subject,
            numQuestions,
            setPaper,
            questions: Array.isArray(questions) ? questions : [],
            createdBy: req.user.userId
        });

        await quiz.save();
        res.status(201).json({ message: 'Quiz created', quiz });
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ error: 'Server error creating quiz' });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const quizzes = await QuizCreated.find().sort({ createdAt: -1 });
        res.json({ quizzes });
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).json({ error: 'Server error fetching quizzes' });
    }
});

// Record student quiz result
router.post('/:quizId/results', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can submit quiz results' });
        }

        const { quizId } = req.params;
        const { score, totalQuestions, percentage, marks, totalMarks, answers, userName, branch, semester } = req.body;

        if (typeof score !== 'number' || typeof totalQuestions !== 'number') {
            return res.status(400).json({ error: 'Invalid result payload' });
        }

        let quizRef = null;
        try {
            // Attempt to find corresponding quiz by Mongo _id if quizId resembles ObjectId
            if (quizId && quizId.length === 24) {
                const q = await QuizCreated.findById(quizId);
                if (q) quizRef = q._id;
            }
        } catch (_) {}

        const result = await QuizResult.create({
            quizId,
            quizRef,
            userId: req.user.userId,
            userName: userName,
            branch: branch,
            semester: semester,
            score,
            totalQuestions,
            percentage: typeof percentage === 'number' ? percentage : Math.round((score / Math.max(totalQuestions, 1)) * 100),
            marks,
            totalMarks,
            answers: Array.isArray(answers) ? answers : [],
            completedAt: new Date()
        });

        res.status(201).json({ success: true, result });
    } catch (error) {
        console.error('Error recording quiz result:', error);
        res.status(500).json({ error: 'Server error recording quiz result' });
    }
});

// Get current user's quiz results
router.get('/results/me', authenticateToken, async (req, res) => {
    try {
        const results = await QuizResult.find({ userId: req.user.userId }).sort({ completedAt: -1 });
        res.json({ success: true, results });
    } catch (error) {
        console.error('Error fetching user quiz results:', error);
        res.status(500).json({ error: 'Server error fetching results' });
    }
});

// Get results for a quiz (teacher only)
router.get('/:quizId/results', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can view quiz results for a quiz' });
        }
        const { quizId } = req.params;
        const results = await QuizResult.find({ quizId }).sort({ completedAt: -1 });
        res.json({ success: true, results });
    } catch (error) {
        console.error('Error fetching quiz results:', error);
        res.status(500).json({ error: 'Server error fetching results' });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can delete quizzes' });
        }

        const quiz = await QuizCreated.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        await QuizCreated.findByIdAndDelete(req.params.id);
        res.json({ message: 'Quiz deleted' });
    } catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({ error: 'Server error deleting quiz' });
    }
});

router.delete('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can clear quizzes' });
        }

        await QuizCreated.deleteMany({});
        res.json({ message: 'All quizzes deleted' });
    } catch (error) {
        console.error('Error clearing quizzes:', error);
        res.status(500).json({ error: 'Server error clearing quizzes' });
    }
});

export default router;