import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true, pattern: '^.+@.+$'},
    password: { type: String, required: true },
    telefono: { type: String, required: false },
    rol: { type: String, required: true, enum: ['admin', 'cliente'] },
    fecha_registro: { type: Date, default: Date.now },
},{
    collection: 'usuarios'
});

const Usuario = mongoose.model('Usuario', usuarioSchema);
export default Usuario;