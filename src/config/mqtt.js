import mqtt from 'mqtt';

const protocol = process.env.MQTT_PROTOCOL;
const host = process.env.MQTT_HOST;
const port = Number(process.env.MQTT_PORT || 1883);

const options = {
  clientId: `node_server_${Math.random().toString(16).slice(3)}`,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
  username: process.env.MQTT_USERNAME || undefined,
  password: process.env.MQTT_PASSWORD || undefined,
};

const mqttClient = mqtt.connect(`${protocol}://${host}:${port}`, options);

mqttClient.on('connect', () => {
  console.log('[MQTT] Conectado al Broker');
});

mqttClient.on('reconnect', () => {
  console.log('[MQTT] Reintentando conexion...');
});

mqttClient.on('close', () => {
  console.log('[MQTT] Conexion cerrada');
});

mqttClient.on('offline', () => {
  console.log('[MQTT] Cliente offline');
});

mqttClient.on('error', (err) => {
  console.error('[MQTT] Error:', err.message);
});

export default mqttClient;