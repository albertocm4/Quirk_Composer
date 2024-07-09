import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { withAuthenticationRequired, useAuth0 } from '@auth0/auth0-react';
import Loading from "./components/Loading";
import { UserEmailProvider, useUserEmail } from './components/UserEmailContext'; // Importar el proveedor y el hook del contexto
import "./ReceptorDatos.css";

const ReceptorDatos = () => {
  const location = useLocation();
  const { user } = useAuth0(); // Obtiene el usuario actual
  const { setUserEmail } = useUserEmail(); // Obtener la función setUserEmail del contexto
  const [cadena, setCadena] = useState(null);
  const [link, setLink] = useState(null);
  const [awsCode, setAwsCode] = useState(null);
  const [ibmCode, setIbmCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const cadena = searchParams.get('id');
    setCadena(cadena);
  }, [location]);

  useEffect(() => {
    if (cadena) {
      getLinkFromDjango();
    }
  }, [cadena]);

  useEffect(() => {
    if (link) {
      translateToPython(id, link); // Llama a la función translateToPython pasando la URL del circuito
    }
  }, [link]);

  useEffect(() => {
    fetchCsrfToken();
  }, []);

  useEffect(() => {
    if (user) {
      setUserEmail(user.email); // Establecer el correo electrónico del usuario cuando esté disponible
    }
  }, [user]);

  const fetchCsrfToken = async () => {
    try {
      const response = await axios.get('http://localhost:8000/get_csrf_token/');
      setCsrfToken(response.data.csrfToken);
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  };

  const getLinkFromDjango = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/get_id_from_cadena/?cadena=${cadena}`);
      const id = response.data.id;
      setId(id);
      const linkResponse = await axios.get(`http://localhost:8000/links/${id}/`);
      setLink(linkResponse.data.url);
    } catch (error) {
      console.error('Error fetching link:', error);
    }
  };
  
  const translateToPython = async (id, url) => {
    if (!url || !user.email || !csrfToken) return;
  
    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      };

      await axios.post('http://localhost:8000/guardar_info/', {
        email: user.email,
        link_id: id,
      }, {
        headers: headers
      });

      const awsResponse = await axios.post('http://localhost:4246/code/aws', 
        { 
          url: url 
        }, // La URL como un objeto JSON
        {
          headers: {
            'Content-Type': 'application/json' // Especificar que el contenido es JSON
          }
        }
      );
  
      // Procesar la respuesta del servidor intermedio
      setAwsCode(awsResponse.data.code.join('\n'));
  
      const ibmResponse = await axios.post('http://localhost:4246/code/ibm', 
        { 
          url: url 
        }, // La URL como un objeto JSON
        {
          headers: {
            'Content-Type': 'application/json' // Especificar que el contenido es JSON
          }
        }
      );
      setIbmCode(ibmResponse.data.code.join('\n'));
  

    } catch (error) {
      console.error('Error translating to Python:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <Loading />;
  }

  return (
    <UserEmailProvider> {/* Envolver el componente con el proveedor de contexto */}
      <div className="receptor-datos-container">
        <div className="codigo-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="codigo-section" style={{ width: '45%' }}>
            <h2>Código AWS:</h2>
            <pre>{awsCode}</pre>
          </div>
          <div className="codigo-section" style={{ width: '45%' }}>
            <h2>Código IBM:</h2>
            <pre>{ibmCode}</pre>
          </div>
        </div>
      </div>
    </UserEmailProvider>
  );
};

export default withAuthenticationRequired(ReceptorDatos, {
  onRedirecting: () => <Loading />,
});
