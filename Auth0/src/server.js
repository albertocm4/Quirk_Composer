const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 4246; // El puerto en el que se ejecutará el servidor intermedio

// Middleware para permitir solicitudes CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, data, x-url'); // Agrega 'x-url' al conjunto de encabezados permitidos
  next();
});

// Middleware para parsear el cuerpo de la solicitud como JSON
app.use(express.json());

// Ruta para manejar la solicitud POST y reenviarla al servidor remoto
app.post('/code/aws', async (req, res) => {
  try {
    // console.log(req.body); // Verifica que se esté recibiendo el cuerpo de la solicitud correctamente
    const { url } = req.body; // Extraer la URL directamente del cuerpo de la solicitud
    //console.log("URL recibida en /code/aws:", url, "FINNNNNNNNNNN"); // Verifica la URL recibida

    // Hacer la solicitud al servidor remoto con la URL
    const response = await axios.post('http://quantumservicesdeployment.spilab.es:8083/code/aws', { url: url  });
    // Devolver la respuesta del servidor remoto al cliente
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Error en el servidor intermedio' });
  }
});




// Ruta para manejar la solicitud GET y reenviarla al servidor remoto
app.post('/code/ibm', async (req, res) => {
  try {
    // console.log(req.body); // Verifica que se esté recibiendo el cuerpo de la solicitud correctamente
    const { url } = req.body; // Extraer la URL directamente del cuerpo de la solicitud
    console.log("URL recibida en /code/ibm:", url); // Verifica la URL recibida

    // Hacer la solicitud al servidor remoto con la URL
    const response = await axios.post('http://quantumservicesdeployment.spilab.es:8083/code/ibm', { url: url  });
    console.log(response.data); // Verifica la respuesta del servidor remoto
    // Devolver la respuesta del servidor remoto al cliente
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Error en el servidor intermedio' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor intermedio en ejecución en el puerto ${PORT}`);
});