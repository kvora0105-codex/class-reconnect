import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        required: true,
        enum: ['student', 'teacher'],
        default: 'student'
    },
    // Student-specific fields
    branch: {
        type: String,
        enum: ['COMPS', 'IT', 'AIDS', 'EXTC'],
        required: function() { return this.role === 'student'; }
    },
    semester: {
        type: String,
        enum: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'],
        required: function() { return this.role === 'student'; }
    },
    // Teacher-specific fields
    department: {
        type: String,
        enum: ['Computer Science', 'Information Technology', 'Electronics & Telecommunication', 'Artificial Intelligence', 'Mathematics', 'Other'],
        required: function() { return this.role === 'teacher'; }
    },
    subject: {
        type: String,
        enum: ['Data Structures', 'Database Management', 'Digital Logic & Computer Organization', 'Discrete Structures & Graph Theory', 'Mathematics', 'Programming Languages', 'Other'],
        required: function() { return this.role === 'teacher'; }
    },
    employeeId: {
        type: String,
        required: function() { return this.role === 'teacher'; },
        unique: true,
        sparse: true // Allows null values but ensures uniqueness when present
    },
    yearsExperience: {
        type: String,
        enum: ['0-1 years', '2-3 years', '4-5 years', '6-10 years', '11-15 years', '16-20 years', '20+ years'],
        required: function() { return this.role === 'teacher'; }
    },
    hobby: {
        type: String,
        trim: true,
        required: function() { return this.role === 'teacher'; }
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;
