import Place from '../models/Place.js';
import { createRedisSseHandler } from '../services/sseRedisService.js';
import { summary } from '../utils/structureForResponse.js';


export const streamParkingSummary = createRedisSseHandler(
  'parking_updates', 
  summary,
);

export const getParkingSummary = async (req, res) => {
  try {
    const data = await summary();
    return res.status(200).json({
      data,
      message: 'Datos obtenidos correctamente',
    });
  } catch (error) {
    console.error('Error en getParkingSummary:', error);
    return res.status(500).json({
      message: 'Error al procesar la información del estacionamiento',
    });
  }
};