import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890ABCDEF', 8);

const ticketSchema = new mongoose.Schema({
    folio: { 
        type: String, 
        required: true, 
        unique: true,
        default: () => `TK-${nanoid()}`
    },
   code: {
        type: Number,
        unique: true
    },
    placeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Place', 
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
        type: mongoose.Schema.Types.Decimal128,
        default: 50.00
    },
    finalFee: {
        type: mongoose.Schema.Types.Decimal128,
        default: 0.00
    },
    discountType: {
        type: String,
        enum: ['estandar', 'desvalidado', 'premium'],
        default: 'estandar'
    },
    validationIn: {
        type: Boolean,
        default: false
    },
    validationOut: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model('Ticket', ticketSchema);