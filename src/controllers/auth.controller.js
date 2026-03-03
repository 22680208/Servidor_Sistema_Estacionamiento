import Usuario from "../models/usuario.model.js";

export const register = async (req, res) => {
    try {
        const { nombre, correo, telefono, password, rol } = req.body;

        const nuevoUsuario = new Usuario({
            nombre,
            correo,
            telefono,
            password,
            rol
        });

        await nuevoUsuario.save();

        res.status(201).json({
            success: true,
            msg: "Usuario registrado exitosamente",
            user: {
                id: nuevoUsuario._id,
                nombre: nuevoUsuario.nombre,
                rol: nuevoUsuario.rol
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, msg: "El correo ya está registrado" });
        }
        
        res.status(500).json({ success: false, msg: "Error en el servidor", error: error.message });
    }
};