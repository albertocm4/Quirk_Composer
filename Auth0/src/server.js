const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 4246; // El puerto en el que se ejecutará el servidor intermedio

// Middleware para permitir solicitudes CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-url'); // Agrega 'x-url' al conjunto de encabezados permitidos
  next();
});

// Ruta para manejar la solicitud GET y reenviarla al servidor remoto
app.get('/code/aws', async (req, res) => {
  try {
    const { 'x-url': url } = req.headers; // Extraer la URL del header 'x-url' de la solicitud
    // Hacer la solicitud al servidor remoto con la URL
    const response = await axios.get('http://quantumservicesdeployment.spilab.es:8081/code/aws', { headers: { 'x-url': url } });
    res.json(response.data); // Devolver la respuesta del servidor remoto al cliente
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Error en el servidor intermedio' });
  }
});

// Ruta para manejar la solicitud GET y reenviarla al servidor remoto
app.get('/code/ibm', async (req, res) => {
  try {
    const { 'x-url': url } = req.headers; // Extraer la URL del header 'x-url' de la solicitud
    // Hacer la solicitud al servidor remoto con la URL
    const response = await axios.get('http://quantumservicesdeployment.spilab.es:8081/code/ibm', { headers: { 'x-url': url } });
    res.json(response.data); // Devolver la respuesta del servidor remoto al cliente
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Error en el servidor intermedio' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor intermedio en ejecución en el puerto ${PORT}`);
});
