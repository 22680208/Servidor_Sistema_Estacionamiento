import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Acceso denegado. No se proporcionó un token.' });
    const accessToken = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(accessToken, process.env.SECRET_KEY);
        req.user = decoded; 
        next();
    } catch (error) {
        console.error("Error al verificar token:", error.message);
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') next();
    else return res.status(403).json({ message: 'Requiere rol de administrador' });
};