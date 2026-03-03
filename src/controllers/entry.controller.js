import Ticket from '../models/ticket.model.js';
import Lugar from '../models/lugar.model.js';

export const registrarEntrada = async (req, res) => {
    const { placa } = req.body;

    try {
        const lugarDisponible = await Lugar.findOne({ estado: 'disponible' });
        if (!lugarDisponible) {
            return res.status(400).json({ 
                success: false, 
                msg: "Lo sentimos, el estacionamiento está lleno" 
            });
        }

        const nuevoTicket = new Ticket({
            placa,
            lugar: lugarDisponible._id
        });

        lugarDisponible.estado = 'ocupado';
        
        await nuevoTicket.save();
        await lugarDisponible.save();

        res.status(201).json({
            success: true,
            msg: "Entrada registrada correctamente",
            ticket: nuevoTicket,
            ubicacion: `Cajón número ${lugarDisponible.numero}`
        });

    } catch (error) {
        console.error("Error en el controlador de entrada:", error);
        res.status(500).json({ success: false, msg: "Error interno del servidor" });
    }
};