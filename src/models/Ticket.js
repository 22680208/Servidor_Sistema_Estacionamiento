import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890ABCDEF', 6);

const ticketSchema = new mongoose.Schema({
    folio: { 
        type: String, 
        required: true, 
        unique: true,
        default: () => `TK-${nanoid()}`
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        default: () => nanoid()
    },
    placeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Place', 
        required: true 
    },
    carId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Car' 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    reservationId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Reservation'
    },
    timeStart: { 
        type: Date,
        required: true,
        default: Date.now 
    },
    timeEnd: { 
        type: Date 
    },
    state: { 
        type: String, 
        enum: ['activo', 'pendiente_pago', 'pagado', 'finalizado'], 
        default: 'activo' 
    },
    baseFee: {
        type: Number,
        default: 50.00
    },
    finalFee: {
        type: Number,
        default: 0.00
    },
    discountType: {
        type: String,
        enum: ['estandar', 'desvalidado', 'premium'],
        default: 'estandar'
    },
    validadoEnEntrada: {
        type: Boolean,
        default: false
    },
    validadoEnSalida: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date
    }
}, { timestamps: true });

ticketSchema.index({ code: 1 }, { unique: true });
ticketSchema.index({ state: 1 });
ticketSchema.index({ timeStart: 1, timeEnd: 1 });

export default mongoose.model('Ticket', ticketSchema);