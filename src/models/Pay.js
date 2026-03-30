const paySchema = new mongoose.Schema({
    reservaId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Reserva', 
        required: true 
    },
    cost: { 
        type: Number, 
        required: true 
    },
    method: { 
        type: String, 
        enum: ['tarjeta', 'transferencia'], 
        default: 'tarjeta' 
    },
    status: { 
        type: String, 
        enum: ['pendiente', 'exitoso', 'fallido'], 
        default: 'exitoso' 
    },
    transactionId: { type: String }
}, { timestamps: true });

export default mongoose.model('Pay', paySchema);