import Usuario from '../models/usuario.model.js';

export const getProfile = async (req, res) => {
    try {
        const user = await Usuario.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener el perfil", error: error.message });
    }
};


export const updateProfile = async (req, res) => {
    try {
        const updatedUser = await Usuario.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { returnDocument: 'after' } 
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ msg: "Usuario no encontrado" });

        res.json({ msg: "Perfil actualizado", user: updatedUser });
    } catch (error) {
        res.status(400).json({ msg: "Error al actualizar", error: error.message });
    }
};

export const deleteProfile = async (req, res) => {
    try {
        await Usuario.findByIdAndDelete(req.params.id);
        res.json({ msg: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ msg: "Error al eliminar", error: error.message });
    }
};