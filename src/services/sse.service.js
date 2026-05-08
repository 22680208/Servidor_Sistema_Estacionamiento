const clients = new Map();

export const getSSEHeaders = () => ({
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
  'X-Accel-Buffering': 'no',
});

export const addSSEClient = ({ clientId, res, channels = [] }) => {
  clients.set(clientId, {
    res,
    channels: new Set(channels),
  });
};

export const removeSSEClient = (clientId) => {
  clients.delete(clientId);
};

export const sendToChannel = (channel, event, payload) => {
  const message =
    `event: ${event}\n` +
    `data: ${JSON.stringify(payload)}\n\n`;

  for (const [clientId, client] of clients.entries()) {
    if (!client.channels.has(channel)) continue;

    try {
      client.res.write(message);
    } catch (_) {
      clients.delete(clientId);
    }
  }
};