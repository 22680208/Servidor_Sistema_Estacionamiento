import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
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
        required: true 
    },
    role: { 
        type: String, 
        enum: ['admin', 'client'], 
        default: 'client' 
    },
    refreshToken: { 
        type: String,
        default: null 
    },
    fcmToken: { 
        type: String 
    },
    profilePic: { 
        type: String, 
        default: "" 
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);