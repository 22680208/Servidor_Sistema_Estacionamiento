import mqttClient from '../config/mqtt.js';

export const sendAuthCode = (topic, code) => {
  if (!/^\d{6}$/.test(code)) {
    throw new Error("El código debe contener exactamente 6 números.");
  }

  const payload = JSON.stringify({
    code
  });

  const publishOptions = { qos: 1, retain: false };

  mqttClient.publish(topic, payload, publishOptions, (err) => {
    if (err) {
      console.error(`Error al publicar en ${topic}:`, err);
    } else {
      console.log(`Mensaje enviado a [${topic}]: ${code}`); 
    }
  });
};

export const sendLeave = (topic) => {
  const payload = JSON.stringify({
    leave: true
  });

  const publishOptions = { qos: 1, retain: false };

  mqttClient.publish(topic, payload, publishOptions, (err) => {
    if (err) {
      console.error(`Error al publicar en ${topic}:`, err);
    } else {
      console.log(`Mensaje enviado a [${topic}]`); 
    }
  });
};