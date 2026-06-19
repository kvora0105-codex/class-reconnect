import mongoose from 'mongoose';

const changeSchema = new mongoose.Schema({
    field: { type: String, required: true },
    oldValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed }
}, { _id: false });

const profileChangeLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    changes: { type: [changeSchema], default: [] },
    ip: { type: String },
    userAgent: { type: String },
    changedAt: { type: Date, default: Date.now }
});

export default mongoose.model('ProfileChangeLog', profileChangeLogSchema);