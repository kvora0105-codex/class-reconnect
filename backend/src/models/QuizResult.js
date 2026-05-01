import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  question: { type: String },
  userAnswer: { type: mongoose.Schema.Types.Mixed },
  correctAnswer: { type: mongoose.Schema.Types.Mixed },
  userOptionText: { type: String },
  correctOptionText: { type: String },
  isCorrect: { type: Boolean, required: true },
  solutionSteps: { type: [String] }
}, { _id: false });

const quizResultSchema = new mongoose.Schema({
  quizId: { type: String, required: true, index: true },
  quizRef: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizCreated' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  userName: { type: String },
  branch: { type: String },
  semester: { type: String },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number, required: true },
  marks: { type: Number },
  totalMarks: { type: Number },
  answers: { type: [answerSchema], default: [] },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('QuizResult', quizResultSchema);