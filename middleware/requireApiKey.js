export const requireApiKey = async (req, res) => {
  try {
    const validApiKey = process.env.API_KEY_SECRET;
    const providedKey =
      req.headers['x-api-key'] || req.query.apiKey || req.body?.apiKey;
    if (!providedKey) {
      res.status(401).json({ error: 'Falta el encabezado x-api-key' });
      return false;
    }

    if (providedKey !== validApiKey) {
      res.status(403).json({ error: 'API key inválida o no autorizada' });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en requireApiKey:', error);
    res.status(500).json({ error: 'Error interno de autenticación' });
    return false;
  }
};
