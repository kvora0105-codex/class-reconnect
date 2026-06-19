import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: { type: [String], default: [] },
    correct: { type: Number, default: 0 }
}, { _id: false });

const quizSchema = new mongoose.Schema({
    name: { type: String, required: true },
    duration: { type: Number, required: true },
    branch: { type: String, required: true },
    semester: { type: String, required: true },
    subject: { type: String, required: true },
    numQuestions: { type: Number, required: true },
    setPaper: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questions: { type: [questionSchema], default: [] },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('QuizCreated', quizSchema, 'Quiz-Created');