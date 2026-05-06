import mqttClient from '../config/mqtt.js';
import { MQTT_TOPICS } from '../mqtt/topics.js';

function publish(topic, payload, options = { qos: 1, retain: false }) {
  return new Promise((resolve, reject) => {
    mqttClient.publish(topic, payload, options, (err) => {
      if (err) return reject(err);
      resolve({ topic, payload });
    });
  });
}

export async function publishEntrada(action) {
  return publish(MQTT_TOPICS.cmd.entrada, action);
}

export async function publishSalida(action) {
  return publish(MQTT_TOPICS.cmd.salida, action);
}

export async function publishLed1(action) {
  return publish(MQTT_TOPICS.cmd.led1, action);
}

export async function publishLed2(action) {
  return publish(MQTT_TOPICS.cmd.led2, action);
}

export async function publishDisplay(text) {
  return publish(MQTT_TOPICS.cmd.display, text);
}