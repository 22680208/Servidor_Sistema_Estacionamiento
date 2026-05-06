import mqttClient from './src/config/mqtt.js';
import { publishEntrada, publishSalida } from './src/services/mqttPublish.service.js';

mqttClient.on('connect', async () => {
  try {
    console.log('Conectado a MQTT');

    await publishEntrada('OPEN');
    console.log('Comando enviado: abrir entrada');

    await publishSalida('OPEN');
    console.log('Comando enviado: abrir salida');
  } catch (error) {
    console.error('Error publicando:', error);
  } finally {
    setTimeout(() => process.exit(0), 1000);
  }
});