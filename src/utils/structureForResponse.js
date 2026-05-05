import Place from '../models/Place.js';

export const summary = async () => {
  const places = await Place.find().lean();

  return {
    summary: {
      total_slots: places.length,
      available_slots: places.filter(p => p.state === 'disponible').length,
      occupied_slots: places.filter(p => p.state === 'ocupado').length,
    },
    parking_slots: places.map(p => ({
      id: p._id,
      name: p.number,
      state: p.state,
    })),
  };
};