import axios from 'axios';

export default async function handler(req, res) {
  try {
    // Hacer la solicitud a Cat Facts API
    const response = await axios.get('https://catfact.ninja/fact');

    // Enviar el dato curioso como respuesta
    res.status(200).json({
      fact: response.data.fact,
    });
  } catch (error) {
    console.error('Error al obtener el dato curioso:', error.message);
    res.status(500).json({
      error: 'Error al obtener el dato curioso sobre gatos',
    });
  }
}
