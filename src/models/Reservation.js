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
    timeStart: { 
        type: Date, 
        required: true 
    },
    timeEnd: { 
        type: Date 
    },
    state: { 
        type: String, 
        enum: ['pendiente', 'activa', 'completada', 'cancelada'], 
        default: 'pendiente' 
    },
    totalCost: { 
        type: Number, 
        default: 0 
    }
}, { timestamps: true });

export default mongoose.model('Reservation', reservationSchema);