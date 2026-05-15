import { publishRealtimeEvent } from '../../services/realtime-pubsub.service.js';
import { parkingSummary } from '../../utils/structureForResponse.js';
import Place from '../../models/Place.js';
export async function handleOccupancyMessage(payload) {
  const data = JSON.parse(payload);
  const place = await Place.find({number: data.placeNumber});
  if (!place) return;
  place.state = data.occupied ? 'ocupado' : 'disponible'

  await place.save();

  const dashboardData = await parkingSummary();
  await publishRealtimeEvent({
    channel: 'dashboard',
    event: 'dashboard.updated',
    payload: {
      message: 'reserva auto-cancelada',
      data: dashboardData,
    },
  });
}