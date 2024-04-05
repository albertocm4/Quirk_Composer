import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { withAuthenticationRequired, useAuth0 } from '@auth0/auth0-react';
import { useUserEmail } from '../components/UserEmailContext';

const MisCircuitos = () => {
  const { user } = useAuth0(); // Obtiene el usuario actual
  const { setUserEmail } = useUserEmail(); // Obtener la función setUserEmail del contexto
  const { userEmail } = useUserEmail();
  const [circuitos, setCircuitos] = useState([]);
  const [translatedCircuito, setTranslatedCircuito] = useState(null);
  const [awsCode, setAwsCode] = useState(null);
  const [ibmCode, setIbmCode] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [editingCircuito, setEditingCircuito] = useState(null);
  const [editedNombre, setEditedNombre] = useState('');

  useEffect(() => {
    if (user) {
      setUserEmail(user.email); // Establecer el correo electrónico del usuario cuando esté disponible
    }
    const fetchCircuitos = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/obtener_url_y_nombre_por_email/?email=${userEmail}`);
        setCircuitos(response.data.circuitos); // Modificar para usar los circuitos
      } catch (error) {
        console.error('Error al obtener los circuitos:', error);
      }
    };

    fetchCircuitos();
  }, [userEmail, user]);

  const handleTranslate = async (url, nombre) => {
    try {
      setIsTranslating(true);

      const awsResponse = await axios.get('http://localhost:4246/code/aws', { 
        headers: {'x-url': url} 
      });
      setAwsCode(awsResponse.data.code.join('\n'));

      const ibmResponse = await axios.get('http://localhost:4246/code/ibm', { 
        headers: {'x-url': url} 
      });
      setIbmCode(ibmResponse.data.code.join('\n'));

      setTranslatedCircuito({ url, nombre });
    } catch (error) {
      console.error('Error translating:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const ejecutarTraduccion = async (codigoTraducido) => {
    try {
      console.log("Código traducido a enviar:", codigoTraducido); // Agrega esta línea para imprimir el código traducido
      const response = await axios.post('http://localhost:8000/ejecutar_circuito/', {
        codigo_traducido: codigoTraducido
      });
      console.log(response.data);
      // Aquí puedes manejar la respuesta del backend después de ejecutar la traducción
    } catch (error) {
      console.error('Error al ejecutar traducción:', error);
    }
  };
  
  const handleEjecutarAwsClick = () => {
    ejecutarTraduccion(awsCode);
  };
  
  const handleEjecutarIbmClick = () => {
    ejecutarTraduccion(ibmCode);
  };

  const handleBack = () => {
    setTranslatedCircuito(null);
  };

  const handleEditNombre = async (circuitoId, nuevoNombre) => {
    console.log('ID del circuito:', circuitoId);
    console.log('Nuevo nombre:', nuevoNombre);
    try {
      const response = await axios.post('http://localhost:8000/actualizar_nombre_circuito/', {
        link_id: circuitoId, // Cambiar circuito.id por circuito.link_id
        nuevo_nombre: nuevoNombre,
      });
  
      // Si la solicitud se completa sin errores, imprime el mensaje de éxito
      console.log('Nombre actualizado correctamente en la base de datos');
  
      // Actualizar el estado local con el ID del circuito actualizado
      const { link_id } = response.data;
  
      // Actualizar el estado local con el nuevo nombre
      setCircuitos(circuitos.map(circuito => {
        if (circuito.id === link_id) {
          return { ...circuito, nombre: nuevoNombre };
        }
        return circuito;
      }));
      
      // Limpiar el estado de edición
      setEditingCircuito(null);
      setEditedNombre('');
    } catch (error) {
      console.error('Error al actualizar el nombre del circuito:', error);
    }
  };

  const handleEditClick = (circuito) => {
    setEditingCircuito(circuito);
    setEditedNombre(circuito.nombre || '');
  };

  const handleNombreChange = (event) => {
    setEditedNombre(event.target.value);
  };

  return (
    <div>
      <h2>Circuitos de {userEmail}:</h2>
      {translatedCircuito ? (
        <div>
          <h3>Traducción de circuito:</h3>
          <h4>Código AWS:</h4>
          <pre>{awsCode}</pre>
          <h4>Código IBM:</h4>
          <pre>{ibmCode}</pre>
          <button onClick={handleBack}>Volver</button>
          {/* Agrega botones para ejecutar traducción */}
          <button onClick={handleEjecutarAwsClick}>Ejecutar AWS</button>
          <button onClick={handleEjecutarIbmClick}>Ejecutar IBM</button>
        </div>
      ) : (
        <ul>
          {circuitos.map((circuito, index) => (
            <li key={index}>           
              <div>
                <button onClick={() => window.open(circuito.url, '_blank')}>Ir al circuito</button>
                {/* Mostrar el campo de nombre editable si está siendo editado */}
                {editingCircuito === circuito ? (
                  <>
                    <input
                      type="text"
                      value={editedNombre}
                      onChange={handleNombreChange}
                    />
                    <button onClick={() => handleEditNombre(circuito.id, editedNombre)}>Guardar Cambios</button>
                  </>
                ) : (
                  <>
                    <span>{circuito.nombre ? circuito.nombre : `Circuito ${circuito.id}`}</span>
                    <button onClick={() => handleEditClick(circuito)}>Editar</button>
                  </>
                )}
                <button disabled={isTranslating} onClick={() => handleTranslate(circuito.url, circuito.nombre)}>Ver código</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MisCircuitos;
