import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    plate: { 
        type: String, 
        required: true, 
        unique: true 
    },
    model: { 
        type: String, 
        required: true,
        enum: ['Sedan', 'SUV', 'Pickup', 'Van', 'Coupe', 'Convertible', 'Hatchback', 'Wagon', 'Other']
    },  
    brand: { 
        type: String, 
        required: true 
    },
    color: { 
        type: String
    },
    isMain: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

export default mongoose.model('Car', carSchema);