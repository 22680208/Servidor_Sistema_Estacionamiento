import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Profile from '../models/Profile.js';

const generarToken = (userId) => {
    return jwt.sign({ userId }, process.env.SECRET_KEY, { expiresIn: '1d' });
};  

const generarRefreshToken = (userId) => {
    return jwt.sign({ userId }, process.env.SECRET_KEY, { expiresIn: '7d' });
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        const profile = await Profile.findOne({ userId: user._id }).lean();
        if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Credenciales inválidas' });

        const token = generarToken(user._id);
        const refreshToken = generarRefreshToken(user._id);
        user.refreshToken = refreshToken;
        await user.save();
        return res.json({
            token,
            refreshToken,
            user: {
                id: user._id,
                firstName: profile.firstName,
                lastName: profile.lastName,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error en el servidor al iniciar sesión' });
    }
};

export const register = async (req, res) => {
    try {
        const { firstName, lastName, notifications, email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) return res.status(400).json({ message: 'El correo electrónico ya está en uso' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            email,
            password: hashedPassword,
            role: 'client'
        });

        const newProfile = new Profile({
            userId: newUser._id,
            firstName,
            lastName,
            preferences: {
                notifications
            }
        });
        
        const token = generarToken(newUser._id);
        const refreshToken = generarRefreshToken(newUser._id);
        newUser.refreshToken = refreshToken;
        await newUser.save();
        await newProfile.save();
        return res.status(201).json({
            token,
            refreshToken,
            user: {
                id: newUser._id,
                name: newUser.name,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al registrar el usuario' });
    }
};

export const logout = async (req, res) => {
    try {
        const userId = req.user.userId;
        await User.findByIdAndUpdate(userId, { refreshToken: null });
        return res.json({ message: 'Sesión cerrada correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al cerrar sesión' });
    }
};

export const renovarToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ message: 'Refresh Token es requerido' });

        const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY);
        const user = await User.findOne({ _id: decoded.userId, refreshToken: refreshToken });

        if (!user) return res.status(403).json({ message: 'Sesión expirada o inválida' });
        
        const nuevoToken = generarToken(user._id);
        return res.json({ token: nuevoToken });
    } catch (error) {
        return res.status(403).json({ message: 'Token de refresco inválido' });
    }
};

export const fullname = async (req, res) => {
    
}