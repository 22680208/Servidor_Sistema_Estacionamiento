import mongoose from 'mongoose';

const lugarSchema = new mongoose.Schema({
    numero: { type: Number, required: true, unique: true },
    estado: { 
        type: String, 
        enum: ['disponible', 'ocupado', 'mantenimiento'], 
        default: 'disponible' 
    },
    sensorId: { type: String, required: true },
    tipo: { type: String, enum: ['estandar', 'discapacitados'], default: 'estándar' }
}, { timestamps: true });

export default mongoose.model('Lugar', lugarSchema);