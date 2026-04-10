import mongoose from 'mongoose';

const placeSchema = new mongoose.Schema({
    number: { 
        type: String, 
        required: true,
    },
    sensorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Sensor', 
        required: true 
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
    }
}, { timestamps: true });

export default mongoose.model('Place', placeSchema);