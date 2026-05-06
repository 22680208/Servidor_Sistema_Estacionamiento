export const MQTT_TOPICS = {
  cmd: {
    entrada: 'parking/acceso/cmd/entrada',
    salida: 'parking/acceso/cmd/salida',
    led1: 'parking/acceso/cmd/led1',
    led2: 'parking/acceso/cmd/led2',
    display: 'parking/acceso/cmd/display',
  },

  device: {
    reservation: 'parking/acceso/reservation',
    ticket: 'parking/acceso/ticket',
    exit: 'parking/acceso/exit',
  },

  status: {
    system: 'parking/acceso/status/system',
    occupancy: 'parking/acceso/status/occupancy',
  },
};