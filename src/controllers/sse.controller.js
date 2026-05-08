import crypto from 'node:crypto';

import { parkingSummary, reservationSummary } from '../utils/structureForResponse.js';
import {
  addSSEClient,
  removeSSEClient,
  getSSEHeaders,
} from '../services/sse.service.js';

export const streamDashboard = async (req, res) => {
  const clientId = crypto.randomUUID();

  res.writeHead(200, getSSEHeaders());
  res.write('retry: 5000\n\n');

  addSSEClient({
    clientId,
    res,
    channels: ['dashboard'],
  });

  const initialData = await parkingSummary();

  res.write(
    `event: dashboard.updated\n` +
    `data: ${JSON.stringify({
      message: 'conexion dashboard establecida',
      data: initialData,
    })}\n\n`
  );

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    removeSSEClient(clientId);
  });
};

export const streamReservation = async (req, res) => {
  const clientId = crypto.randomUUID();
  const { id } = req.params;
  res.writeHead(200, getSSEHeaders());
  res.write('retry: 5000\n\n');

  addSSEClient({
    clientId,
    res,
    channels: ['reservation'],
  });

  const initialData = await reservationSummary(id);
  res.write(
    `event: reservation.updated\n` +
    `data: ${JSON.stringify({
      message: 'conexion reservation establecida',
      data: initialData,
    })}\n\n`
  );

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    removeSSEClient(clientId);
  });
};