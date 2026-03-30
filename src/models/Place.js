const placeSchema = new mongoose.Schema({
    number: { 
        type: Number, 
        required: true, 
        unique: true 
    },
    sensorId: { 
        type: String, 
        required: true, 
        unique: true 
    }, 
    state: { 
        type: String, 
        enum: ['disponible', 'ocupado', 'mantenimiento', 'reservado'], 
        default: 'disponible' 
    },
    type: { 
        type: String, 
        enum: ['estandar', 'discapacitados'], 
        default: 'estandar' 
    },
    lastDistance: { 
        type: Number, 
        default: 0 
    }
}, { timestamps: true });

export default mongoose.model('Place', placeSchema);