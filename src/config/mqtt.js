import mqtt from 'mqtt';

const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';

const options = {
  clientId: `node_server_${Math.random().toString(16).slice(3)}`,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
};

const client = mqtt.connect(MQTT_URL, options);

client.on('connect', () => {
  console.log('Conectado al Broker MQTT');
});

client.on('error', (err) => {
  console.error('Error MQTT:', err);
});

export default client;