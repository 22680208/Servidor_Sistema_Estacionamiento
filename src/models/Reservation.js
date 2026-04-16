import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    placeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Place', 
        required: true 
    },
    carId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Car', 
        required: true 
    },
    code: {
        type: Number,
        unique: true
    },
    timeStart: { 
        type: Date, 
        required: true 
    },
    timeEnd: { 
        type: Date,
        required: true  
    },
    state: { 
        type: String, 
        enum: ['pendiente', 'activa', 'completada', 'cancelada'], 
        default: 'pendiente' 
    }
}, { timestamps: true });

export default mongoose.model('Reservation', reservationSchema);