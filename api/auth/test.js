export default async function handler(req, res) {
    try {
      // Hacer la solicitud a Cat Facts API
      const response = await fetch('https://catfact.ninja/fact');
      
      if (!response.ok) {
        throw new Error(`Error al obtener el dato curioso: ${response.status}`);
      }
  
      const data = await response.json();
  
      // Enviar el dato curioso como respuesta
      res.status(200).json({
        fact: data.fact,
      });
    } catch (error) {
      console.error('Error al obtener el dato curioso:', error.message);
      res.status(500).json({
        error: 'Error al obtener el dato curioso sobre gatos',
      });
    }
  }
  
