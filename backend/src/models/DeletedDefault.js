import mongoose from 'mongoose';

const deletedDefaultSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    deletedAt: { type: Date, default: Date.now },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

export default mongoose.model('DeletedDefault', deletedDefaultSchema);