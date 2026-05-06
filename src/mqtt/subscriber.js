import mqttClient from '../config/mqtt.js';
import { MQTT_TOPICS } from './topics.js';
import { handleSystemMessage } from './handlers/system.handler.js';
import { handleOccupancyMessage } from './handlers/occupancy.handler.js';
import { handleReservationMessage } from './handlers/reservation.handler.js';
import { handleTicketMessage } from './handlers/ticket.handler.js';
import { handleExitMessage } from './handlers/exit.handler.js';

const subscriptions = [
  MQTT_TOPICS.status.system,
  MQTT_TOPICS.status.occupancy,
  MQTT_TOPICS.device.reservation,
  MQTT_TOPICS.device.ticket,
  MQTT_TOPICS.device.exit,
];

let initialized = false;

export function startMqttSubscriber() {
  if (initialized) return;
  initialized = true;

  const doSubscribe = () => {
    mqttClient.subscribe(subscriptions, (err, granted) => {
      if (err) {
        console.error('[MQTT SUB] Error suscribiendo:', err.message);
      }
    });
  };

  if (mqttClient.connected) {
    doSubscribe();
  } else {
    mqttClient.on('connect', () => {
      doSubscribe();
    });
  }

  mqttClient.on('message', async (topic, payloadBuffer) => {
    const payload = payloadBuffer.toString();

    try {
      switch (topic) {
        case MQTT_TOPICS.status.system:
          return handleSystemMessage(payload);

        case MQTT_TOPICS.status.occupancy:
          return handleOccupancyMessage(payload);

        case MQTT_TOPICS.device.reservation:
          return handleReservationMessage(payload);

        case MQTT_TOPICS.device.ticket:
          return handleTicketMessage(payload);

        case MQTT_TOPICS.device.exit:
          return handleExitMessage(payload);

        default:
          console.log('[MQTT SUB] Topic no manejado:', topic);
          return;
      }
    } catch (error) {
      console.error('[MQTT SUB] Error en handler:', error);
    }
  });
}