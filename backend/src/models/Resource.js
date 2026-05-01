import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    filePath: {
        type: String,
        required: true
    },
    downloads: {
        type: Number,
        default: 0
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    isDefault: {
        type: Boolean,
        default: false
    }
});

export default mongoose.model('Resource', resourceSchema);
