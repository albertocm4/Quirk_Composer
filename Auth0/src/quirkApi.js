const axios = require('axios');

// Función para crear un circuito en Quirk y obtener su URL
async function crearCircuitoEnQuirk() {
    try {
        const response = await axios.post('https://api.quirk.info/circuit?format=url', {
            // Aquí puedes proporcionar los detalles del circuito que deseas crear
        });

        return response.data.url;
    } catch (error) {
        console.error('Error al crear el circuito en Quirk:', error);
        throw error;
    }
}

module.exports = {crearCircuitoEnQuirk};
