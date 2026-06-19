import mongoose from 'mongoose';

const studyGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    // Relaxed to plain String so both student study goals and teacher discussion topics are accepted
    studyGoal: {
        type: String,
        required: true
    },
    // Relaxed to plain String so teacher-created groups can use 'Anytime' or custom values
    availability: {
        type: String,
        required: true
    },
    maxMembers: {
        type: Number,
        default: 10,
        min: 2,
        max: 100
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Stamps whether this group was created by a 'student' or 'teacher'
    creatorRole: {
        type: String,
        enum: ['student', 'teacher'],
        required: true,
        default: 'student'
    },
    branch: {
        type: String,
        enum: ['COMPS', 'IT', 'AIDS', 'EXTC'],
        required: true
    },
    semester: {
        type: String,
        enum: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

studyGroupSchema.methods.toJSON = function() {
    const groupObject = this.toObject();
    return groupObject;
};

const StudyGroup = mongoose.model('StudyGroup', studyGroupSchema);

export default StudyGroup;
