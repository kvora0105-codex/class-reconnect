import mongoose from 'mongoose';

const loginActivitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    event: { type: String, enum: ['login', 'logout'], required: true },
    ip: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('LoginActivity', loginActivitySchema);