export async function validatePin(req, res) {
  try {
    const { deviceId, pin } = req.body;

    if (!deviceId || !pin) {
      return res.status(400).json({
        ok: false,
        message: 'deviceId y pin son requeridos',
      });
    }

    const valid = pin === '1234';

    return res.status(200).json({
      ok: true,
      deviceId,
      valid,
      message: valid ? 'PIN valido' : 'PIN invalido',
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error validando PIN',
      error: error.message,
    });
  }
}