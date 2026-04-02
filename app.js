import express from 'express';
import morgan from 'morgan';
import { connectDB } from './src/config/db.js';
import authRoute from './src/routes/auth.route.js';
import reservationRoute from './src/routes/reservation.route.js';
import carRoute from './src/routes/car.route.js';
import 'dotenv/config';

connectDB();
const app = express()


app.use(express.json());
app.use(morgan('dev'));
app.use('/api/auth', authRoute);
app.use('/api/reservation', reservationRoute);
app.use('/api/car', carRoute);
export default app;