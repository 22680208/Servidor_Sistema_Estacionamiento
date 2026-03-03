import express from 'express';
import morgan from 'morgan';
import usuarioRoutes from './src/routes/usuario.route.js';
import entryRoutes from './src/routes/entry.routes.js';
import lugarRoutes from './src/routes/lugar.route.js'
import auth from './src/routes/auth.route.js'
import { connectDB } from './src/config/db.js';
import 'dotenv/config';

connectDB();
const app = express()

app.use(express.json());
app.use(morgan('dev'));
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/estacionamiento', entryRoutes);
app.use('/api/lugares', lugarRoutes);
app.use('/api/auth', auth)


export default app;