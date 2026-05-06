export async function handleOccupancyMessage(payload) {
  const data = JSON.parse(payload);

  console.log('Occupancy recibida:', data);
}