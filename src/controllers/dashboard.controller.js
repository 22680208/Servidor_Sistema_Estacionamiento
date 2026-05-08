import { parkingSummary } from '../utils/structureForResponse.js';

export const getParkingSummary = async (req, res) => {
  try {
    const data = await parkingSummary();
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
