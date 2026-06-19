import mongoose from 'mongoose';

const groupMessageSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudyGroup',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    message: {
        type: String,
        trim: true
    },
    imageUrl: {
        type: String,
        trim: true
    },
    fileUrl: {
        type: String,
        trim: true
    },
    fileName: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

groupMessageSchema.methods.toJSON = function() {
    const messageObject = this.toObject();
    return messageObject;
};

const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema);

export default GroupMessage;
