
import Lugar from '../models/lugar.model.js';

// 1. Crear un nuevo lugar (Cajón)
export const createLugar = async (req, res) => {
    try {
        const nuevoLugar = await Lugar.create(req.body);
        res.status(201).json({ success: true, lugar: nuevoLugar });
    } catch (error) {
        res.status(400).json({ success: false, msg: "Error al crear el lugar", error: error.message });
    }
};

// 2. Obtener todos los lugares (Ideal para el mapa en Flutter)
export const getLugares = async (req, res) => {
    try {
        const lugares = await Lugar.find();
        res.json({ success: true, lugares });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 3. Obtener un lugar específico por ID o por sensorId
export const getLugarById = async (req, res) => {
    try {
        const lugar = await Lugar.findById(req.params.id);
        if (!lugar) return res.status(404).json({ msg: "Lugar no encontrado" });
        res.json({ success: true, lugar });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 4. Actualizar estado del lugar (Usando la opción moderna returnDocument)
export const updateLugar = async (req, res) => {
    try {
        const lugarActualizado = await Lugar.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { returnDocument: 'after' } // Corregido según el warning de Mongoose
        );
        res.json({ success: true, msg: "Lugar actualizado", lugar: lugarActualizado });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// 5. Eliminar un lugar
export const deleteLugar = async (req, res) => {
    try {
        await Lugar.findByIdAndDelete(req.params.id);
        res.json({ success: true, msg: "Lugar eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
