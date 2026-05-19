import express from 'express';
import morgan from 'morgan';
import { connectDB } from './src/config/db.js';
import authRoute from './src/routes/auth.route.js';
import reservationRoute from './src/routes/reservation.route.js';
import carRoute from './src/routes/car.route.js';
import placeRoute from './src/routes/place.route.js';
import ticketRoute from './src/routes/ticket.route.js';
import dashboardRoute from './src/routes/dashboard.route.js';
import accessRoutes from './src/routes/access.route.js';
import parkingRoutes from './src/routes/sse.route.js'
import { subscribeRealtimeEvents } from './src/services/realtime-pubsub.service.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import 'dotenv/config';

connectDB();
subscribeRealtimeEvents();
const app = express()
const whitelist = [
  'http://localhost:5173',
  'https://servidor-sistema-estacionamiento.onrender.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por CORS: Este origen no está permitido'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true 
};
const frontendPath = path.join(__dirname, 'client/dist');
const apkPath = path.join(frontendPath, 'downloads', 'app-release.apk');

app.get('/', (_req, res) => {
  res.redirect('/welcome');
});
app.use('/welcome', express.static(frontendPath));

app.get('/welcome', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/downloads/app-release.apk', (_req, res) => {
  res.download(apkPath, 'app-release.apk');
});
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/auth', authRoute);
app.use('/api/reservation', reservationRoute);
app.use('/api/car', carRoute);
app.use('/api/place', placeRoute);
app.use('/api/ticket', ticketRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/access', accessRoutes);
app.use('/api/sse', parkingRoutes);

export default app;