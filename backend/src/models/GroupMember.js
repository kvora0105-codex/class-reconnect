import mongoose from 'mongoose';

const groupMemberSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudyGroup',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        enum: ['admin', 'member'],
        default: 'member'
    }
}, {
    timestamps: true
});

groupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });

groupMemberSchema.methods.toJSON = function() {
    const memberObject = this.toObject();
    return memberObject;
};

const GroupMember = mongoose.model('GroupMember', groupMemberSchema);

export default GroupMember;
