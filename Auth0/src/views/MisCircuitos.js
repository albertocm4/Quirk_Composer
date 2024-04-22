import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { withAuthenticationRequired, useAuth0 } from '@auth0/auth0-react';
import { useUserEmail } from '../components/UserEmailContext';
import { useHistory } from 'react-router-dom';

const MisCircuitos = () => {
  const { user } = useAuth0();
  const { setUserEmail } = useUserEmail();
  const { userEmail } = useUserEmail();
  const [circuitos, setCircuitos] = useState([]);
  const [translatedCircuito, setTranslatedCircuito] = useState(null);
  const [awsCode, setAwsCode] = useState(null);
  const [ibmCode, setIbmCode] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [editingCircuito, setEditingCircuito] = useState(null);
  const [editedNombre, setEditedNombre] = useState('');
  const [selectedCircuitoId, setSelectedCircuitoId] = useState(null);
  const history = useHistory();
  const [selectedShotsIBM, setSelectedShotsIBM] = useState('');
  const [selectedShotsAWS, setSelectedShotsAWS] = useState('');
  const [selectedMaquinaIBM, setSelectedMaquinaIBM] = useState('');
  const [selectedMaquinaAWS, setSelectedMaquinaAWS] = useState('');

  useEffect(() => {
    const fetchCircuitos = async () => {
      try {
        if (user && user.email) {
          setUserEmail(user.email);
        const response = await axios.get(`http://localhost:8000/obtener_url_y_nombre_por_email/?email=${userEmail}`);
        setCircuitos(response.data.circuitos);
      }
      } catch (error) {
        console.error('Error al obtener los circuitos:', error);
      }
    };

    fetchCircuitos();
  }, [userEmail, user]);

  const handleTranslate = async (url, nombre) => {
    try {
      setIsTranslating(true);
      console.log('URL a traducir:', url);
  
      // Enviar la solicitud al servidor intermedio con la URL como un objeto JSON
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

      setTranslatedCircuito({ url, nombre });
    } catch (error) {
      console.error('Error translating:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const ejecutarTraduccion = async (codigoTraducido, plataforma, shots, maquina) => {
    try {
          // Verificar si se ha seleccionado una máquina válida
    if (maquina === '') {
      alert('Por favor, selecciona una máquina válida.');
      return;
    }
    
    // Verificar si se ha ingresado un número de shots válido
    if (shots === '') {
      alert('Por favor, ingresa un número de shots.');
      return;
    } else if (parseInt(shots) < 100 || parseInt(shots) > 10000) {
      alert('El número de shots debe estar entre 100 y 10000.');
      return;
    }
      console.log("Código traducido a enviar:", codigoTraducido);
      console.log("ID del circuito seleccionado:", selectedCircuitoId);
      console.log("Plataforma seleccionada:", plataforma);
      console.log("Número de shots:", shots);
      console.log("Máquina seleccionada:", maquina);
      const response = await axios.post('http://localhost:8000/ejecutar_circuito/', {
        codigo_traducido: codigoTraducido,
        circuito_id: selectedCircuitoId, // Utilizamos el ID almacenado en el estado
        plataforma: plataforma,
        shots: shots,
        maquina: maquina
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error al ejecutar traducción:', error);
    }
  };
  
  const handleEjecutarAwsClick = () => {
    ejecutarTraduccion(awsCode, "AWS", selectedShotsAWS, selectedMaquinaAWS);
  };
  
  const handleEjecutarIbmClick = () => {
    ejecutarTraduccion(ibmCode, "IBM", selectedShotsIBM, selectedMaquinaIBM);
  };

  const handleBack = () => {
    setTranslatedCircuito(null);
  };

  const handleEditNombre = async (circuitoId, nuevoNombre) => {
    try {
      const response = await axios.post('http://localhost:8000/actualizar_nombre_circuito/', {
        link_id: circuitoId,
        nuevo_nombre: nuevoNombre,
      });
  
      console.log('Nombre actualizado correctamente en la base de datos');
  
      const { link_id } = response.data;
  
      setCircuitos(circuitos.map(circuito => {
        if (circuito.id === link_id) {
          return { ...circuito, nombre: nuevoNombre };
        }
        return circuito;
      }));
      
      setEditingCircuito(null);
      setEditedNombre('');
    } catch (error) {
      console.error('Error al actualizar el nombre del circuito:', error);
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:8000/circuitos/borrar_circuito/${id}/`);
      console.log(response.data);
      // Actualizar la lista de circuitos después de eliminar el circuito
      const updatedCircuitos = circuitos.filter(circuito => circuito.id !== id);
      setCircuitos(updatedCircuitos);
    } catch (error) {
      console.error('Error al borrar el circuito:', error);
    }
  };

  const handleEditClick = (circuito) => {
    setEditingCircuito(circuito);
    setEditedNombre(circuito.nombre || '');
  };

  const handleNombreChange = (event) => {
    setEditedNombre(event.target.value);
  };

  const handleEditCode = (circuito) => {
    const urlQuirk = `${circuito.url}&cadena=${circuito.cadena}`;
    window.location.href = urlQuirk;
  };
  
  

  return (
    <div>
      <h2>Circuitos de {userEmail}:</h2>
      {translatedCircuito ? (
      <div>
        <h3>Traducción de circuito:</h3>
        <h4>Código AWS:</h4>
        <pre>{awsCode}</pre>
        <label htmlFor="selectMaquinaAWS">Seleccionar máquina: </label>
        <select id="selectMaquinaAWS" value={selectedMaquinaAWS} onChange={(e) => setSelectedMaquinaAWS(e.target.value)}>
          <option value="">Seleccione una</option>
          <option value="local">local</option>
        </select>
        <input type="number" value={selectedShotsAWS} onChange={(e) => setSelectedShotsAWS(e.target.value)} placeholder="Número de Shots" />
        <button onClick={handleEjecutarAwsClick}>Ejecutar AWS</button>
        <h4>Código IBM:</h4>
        <pre>{ibmCode}</pre>
        <label htmlFor="selectMaquinaIBM">Seleccionar máquina: </label>
        <select id="selectMaquinaIBM" value={selectedMaquinaIBM} onChange={(e) => setSelectedMaquinaIBM(e.target.value)}>
          <option value="">Seleccione una</option>
          <option value="local">local</option>
        </select>
        <input type="number" value={selectedShotsIBM} onChange={(e) => setSelectedShotsIBM(e.target.value)} placeholder="Número de Shots" />
        <span><button onClick={handleEjecutarIbmClick}>Ejecutar IBM</button></span>
        <p><button onClick={handleBack}>Volver</button></p>
      </div>
   ) : (
        <ul>
          {circuitos.map((circuito, index) => (
            <li key={index}>           
              <div>
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
                    <span>{circuito.nombre ? circuito.nombre : `Circuito ${circuito.id}`} </span>
                    <button onClick={() => handleEditClick(circuito)}>Cambiar nombre</button>
                  </>
                )}
                <span> <button onClick={() => window.open(circuito.url, '_blank')}>Ir al circuito</button> </span>
                <button disabled={isTranslating} onClick={() => {setSelectedCircuitoId(circuito.id); handleTranslate(circuito.url, circuito.nombre)}}>Ver código</button>
                <button onClick={() => handleEditCode(circuito)}>Editar código</button>
                <button onClick={() => handleDeleteClick(circuito.id)}>Borrar</button>
                
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MisCircuitos;
