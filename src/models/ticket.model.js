import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    placa: { type: String, uppercase: true },
    fechaEntrada: { type: Date, default: Date.now },
    fechaSalida: { type: Date },
    lugar: { type: mongoose.Schema.Types.ObjectId, ref: 'Lugar', required: true },
    estado: { type: String, enum: ['Activo', 'Pendiente_Pago', 'Finalizado'], default: 'Activo' },
    total_pagado: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('tickets', ticketSchema);