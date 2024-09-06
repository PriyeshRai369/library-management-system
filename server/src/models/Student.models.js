import mongoose, { Schema } from "mongoose";

const studentSchema = new Schema({
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
    studentID: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    sutdentProfilePic:{
        type:String
    },
    borrowedBooks: [{
        bookID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        },
        borrowedDate: Date,
        dueDate: Date,
        returned: {
            type: Boolean,
            default: false
        }
    }],
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    }
});

export const Student = mongoose.model('Student', studentSchema);

