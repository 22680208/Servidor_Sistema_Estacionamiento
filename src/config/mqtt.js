import mqtt from 'mqtt';

const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';

const options = {
  clientId: `node_server_${Math.random().toString(16).slice(3)}`,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
};

const mqttClient = mqtt.connect(MQTT_URL, options);

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