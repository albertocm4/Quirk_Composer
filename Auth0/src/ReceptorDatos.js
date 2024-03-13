import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react'; // Importar el hook useAuth0

const ReceptorDatos = () => {
  const location = useLocation();
  const [id, setId] = useState(null);
  const [link, setLink] = useState(null);
  const [awsCode, setAwsCode] = useState(null);
  const [ibmCode, setIbmCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0(); // Obtener el estado de autenticación

  const getParamsFromUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    const idFromUrl = searchParams.get('id');
    setId(idFromUrl);
  };

  const getLinkFromDjango = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/links/${id}/`);
      setLink(response.data.url);
    } catch (error) {
      console.error('Error fetching link:', error);
    }
  };

  const translateToPython = async () => {
    if (!link) return;

    setLoading(true);
    try {
      // Realizar la solicitud a la API de AWS
      const awsResponse = await axios.get('http://localhost:4246/code/aws', { headers: { 'x-url': link } });
      setAwsCode(awsResponse.data.code.join('\n'));

      // Realizar la solicitud a la API de IBM
      const ibmResponse = await axios.get('http://localhost:4246/code/ibm', { headers: { 'x-url': link } });
      setIbmCode(ibmResponse.data.code.join('\n'));
    } catch (error) {
      console.error('Error translating to Python:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getParamsFromUrl();
  }, [location]);

  useEffect(() => {
    if (isAuthenticated && id) {
      // Solo intenta obtener el enlace de Django si el usuario está autenticado y se ha recibido una ID
      getLinkFromDjango();
    }
  }, [isAuthenticated, id]);

  useEffect(() => {
    // Realizar la traducción solo si el enlace está disponible y el usuario está autenticado
    if (link && isAuthenticated) {
      translateToPython();
    }
  }, [link, isAuthenticated]);

  return (
    <div>
      {isLoading ? ( // Si está cargando la autenticación
        <div>Cargando...</div>
      ) : isAuthenticated ? ( // Si está autenticado
        loading ? (
          <div>Traduciendo a Python...</div>
        ) : (
          <div>
            <div>
              <h2>Código AWS:</h2>
              <pre>{awsCode}</pre>
            </div>
            <div>
              <h2>Código IBM:</h2>
              <pre>{ibmCode}</pre>
            </div>
          </div>
        )
      ) : ( // Si no está autenticado, redirigir al inicio de sesión
        loginWithRedirect()
      )}
    </div>
  );
};

export default ReceptorDatos;
