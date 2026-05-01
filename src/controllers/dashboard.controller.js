import Place from '../models/Place.js';

export const getParkingSummary = async (req, res) => {
    try {
        const places = await Place.find().lean();


        const parking_slots = places.map(place => ({
            id: place._id,
            name: `Cajón ${place.number}`,
            state: place.state 
        }));

        const total_slots = places.length;
        const available_slots = places.filter(p => p.state === 'disponible').length;
        const occupied_slots = places.filter(p => p.state === 'ocupado').length;
        
        const revenue_today = 450.50; 

        const response = {
            summary: {
                total_slots,
                available_slots,
                occupied_slots,
                revenue_today
            },
            parking_slots
        };

        return res.status(200).json({ data: response, message: 'Datos obtenidos correctamente'});

    } catch (error) {
        return res.status(500).json({ message: 'Error al procesar la información del estacionamiento' });
    }
};