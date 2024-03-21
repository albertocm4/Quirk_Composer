import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUserEmail } from '../components/UserEmailContext'; // Importar el hook del contexto

const MisCircuitos = () => {
  const { userEmail } = useUserEmail(); // Obtener el correo electrónico del contexto
  const [circuitos, setCircuitos] = useState([]);

  useEffect(() => {
    const fetchCircuitos = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/obtener_url_por_email/?email=${userEmail}`);
        setCircuitos(response.data.urls);
      } catch (error) {
        console.error('Error al obtener los circuitos:', error);
      }
    };

    fetchCircuitos();
  }, [userEmail]);

  return (
    <div>
      <h2>Circuitos de {userEmail}:</h2>
      <ul>
        {circuitos.map((circuito, index) => (
          <li key={index}><a href={circuito}>{circuito}</a></li>
        ))}
      </ul>
    </div>
  );
};

export default MisCircuitos;
