import mongoose from 'mongoose';

const resourceDeletedLogSchema = new mongoose.Schema({
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    semester: { type: String, required: true },
    type: { type: String, required: true },
    branch: { type: String, required: true },
    description: { type: String },
    filePath: { type: String },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deletedAt: { type: Date, required: true },
    loggedAt: { type: Date, default: Date.now }
});

export default mongoose.model('ResourceDeletedLog', resourceDeletedLogSchema);