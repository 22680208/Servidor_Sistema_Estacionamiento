export async function saveOccupancy(req, res) {
  try {
    const { deviceId, slotId, occupied, distanceCm } = req.body;

    if (deviceId == null || slotId == null || occupied == null || distanceCm == null) {
      return res.status(400).json({
        ok: false,
        message: 'deviceId, slotId, occupied y distanceCm son requeridos',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Estado de ocupacion recibido',
      data: {
        deviceId,
        slotId,
        occupied,
        distanceCm,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error guardando ocupacion',
      error: error.message,
    });
  }
}