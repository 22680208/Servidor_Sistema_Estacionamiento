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
import parkingRoutes from './src/routes/parking.route.js'

import cors from 'cors'


import 'dotenv/config';

connectDB();
const app = express()
const whitelist = [
  'http://localhost:64189',
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
app.use('/api/parking', parkingRoutes);

export default app;