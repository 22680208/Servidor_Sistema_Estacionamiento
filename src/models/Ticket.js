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
    lugarId: { 
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
    fee: {
        totalCost: { type: Number, default: 0 },
        paid: { type: Boolean, default: false }
    },
    code: { 
        type: String
    }
}, { timestamps: true });

export default mongoose.model('Ticket', ticketSchema);