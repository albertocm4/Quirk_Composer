import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { withAuthenticationRequired, useAuth0 } from '@auth0/auth0-react';
import { useUserEmail } from '../components/UserEmailContext';
import { useHistory } from 'react-router-dom';
import '../MisCircuitos.css';
import awsIcon from '../assets/aws-icon.png';
import ibmIcon from '../assets/ibm-icon.png';
import trashIcon from '../assets/trash-icon.png';
import playIcon from '../assets/play-icon.png';
import editIcon from '../assets/edit-icon.png';
import searchIcon from '../assets/search-icon.png';
import LoadingOverlay from '../components/LoadingOverlay';
import LoadingOverlayS from '../components/LoadingOverlayS';



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
  const [codigoCircuitoAWS, setCodigoCircuitoAWS] = useState(null); // Definir codigoCircuito
  const [receivedUrl, setReceivedUrl] = useState(null);
  const [selectedCircuitoUrl, setSelectedCircuitoUrl] = useState('');
  const [isEditingName, setIsEditingName] = useState(false); // Estado para controlar si se está editando el nombre
  const [isEditingOrEjecting, setEditingOrEjecting] = useState(false);
  const [precioTarea, setPrecioTarea] = useState(0);
  const [precioShot, setPrecioShot] = useState(0);
  const [costoTotal, setCostoTotal] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [ejecucionEnCurso, setEjecucionEnCurso] = useState(null);
  const [ejecucionCompletada, setEjecucionCompletada] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false); // Estado para controlar la ejecución
  const [noEjecucion, setNoEjecucion] = useState(null);
  const [nombreCircuito, setNombreCircuito] = useState(null);

  const precios = {
    local: { tarea: 0, shot: 0 },
    sv1: { minuto: 0.075 },
    dm1: { minuto: 0.075 },
    tn1: { minuto: 0.275 },
    ionq: { tarea: 0.3, shot: 0.01 },
    "ionq Aria 1": { tarea: 0.3, shot: 0.03 },
    "ionq Aria 2": { tarea: 0.3, shot: 0.03 },
    "ionq Forte": { tarea: 0.3, shot: 0.01 },
    rigetti: { tarea: 0.3, shot: 0.00035 },
    "oqc lucy": { tarea: 0.3, shot: 0.00035 },
    "quera aquila": { tarea: 0.3, shot: 0.01 },
    garnet: { tarea: 0.3, shot: 0.00145 },
  };
  const screenshotBaseUrl = '../../../qweb/djangodb';
  const [selectedProvider, setSelectedProvider] = useState(null);

  const handleProviderClick = (provider) => {
    setSelectedProvider(provider);
    setEjecucionCompletada(null);
    setEjecucionEnCurso("NO NULO");
    setNoEjecucion("NO NULO");
    setSelectedMaquinaAWS('');
    setSelectedMaquinaIBM('');
    setSelectedShotsAWS('');
    setSelectedShotsIBM('');
  };

  useEffect(() => {
    const maquina = precios[selectedMaquinaAWS];
    if (selectedMaquinaAWS === "local") {
      setMensaje("La ejecución es gratis y se ejecuta de forma inmediata.");
      setPrecioTarea(0);
      setPrecioShot(0);
    } else if (maquina && maquina.minuto) {
      setMensaje(`Tarifa por minuto: ${maquina.minuto} USD`);
      setPrecioTarea(0);
      setPrecioShot(0);
    } else if (maquina) {
      setMensaje("");
      setPrecioTarea(maquina.tarea || 0);
      setPrecioShot(maquina.shot || 0);
    } else {
      setMensaje("");
      setPrecioTarea(0);
      setPrecioShot(0);
    }
  }, [selectedMaquinaAWS]);

  useEffect(() => {
    const total = precioTarea + (precioShot * selectedShotsAWS);
    setCostoTotal(total);
  }, [selectedShotsAWS, precioTarea, precioShot]);
  


  useEffect(() => {
    console.log("Circuito ejecutado:", codigoCircuitoAWS);
  }, [codigoCircuitoAWS]);
  

  useEffect(() => {
    const fetchCircuitos = async () => {
      try {
        if (user && user.email) {
          setUserEmail(user.email);
        const response = await axios.get(`http://localhost:8000/obtener_url_y_nombre_por_email/?email=${userEmail}`);
        console.log('Respuesta del servidor:', response.data.circuitos);
        setCircuitos(response.data.circuitos);
      }
      } catch (error) {
        console.error('Error al obtener los circuitos:', error);
      }
    };

    fetchCircuitos();
  }, [userEmail, user, ejecucionCompletada, ejecucionEnCurso]);

  const handleTranslate = async (url, nombre, url_desplegada) => {
    setEditingOrEjecting(true);
    setReceivedUrl(url_desplegada); // Almacenar la URL del circuito desplegado (si existe
    try {
      setIsTranslating(true);
      console.log('URL a traducir:', url);
      setSelectedCircuitoUrl(url); // Almacenar la URL del circuito seleccionado
  
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
      console.log('Respuesta de AWS:', awsResponse.data.code);
      console.log('Respuesta de AWS:', awsResponse.data.code.join('\n'));
      console.log('Respuesta de AWS:', awsResponse);
      console.log('Respuesta de AWS:', awsResponse.data);
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
      console.log('Respuesta de IBM:', ibmResponse.data.code);
      setIbmCode(ibmResponse.data.code.join('\n'));

      setTranslatedCircuito({ url, nombre });
    } catch (error) {
      console.error('Error translating:', error);
      alert('El servidor no permite traducir todos los componentes del circuito correctamente. \nPor favor, edite el circuito.');
    } finally {
      setIsTranslating(false);
      setEditingOrEjecting(false);
    }
  };


  const handleSendUrl = async (url) => {
    setIsExecuting(true);
    console.log('el id del circuito seleccionado es:', selectedCircuitoId);
    try {
      const response = await axios.post('http://localhost:8000/lanzar_servicio/', {
        url: url,
        id: selectedCircuitoId
      });
      setReceivedUrl(response.data.service_url);  // Asegúrate de que el backend devuelve `received_url`
    } catch (error) {
      console.error('Error al enviar la URL:', error);
    } finally {
      setIsExecuting(false);
    }
  };
  

  const ejecutarTraduccion = async (codigoTraducido, plataforma, shots, maquina) => {
    setIsExecuting(true); // Indicar que se está ejecutando el circuito
    try {
          // Verificar si se ha seleccionado una máquina válida
    if (maquina === '') {
      alert('Por favor, selecciona una máquina válida.');
      setIsExecuting(false); 
      return;
    }
    
    // Verificar si se ha ingresado un número de shots válido
    if (shots === '') {
      alert('Por favor, ingresa un número de shots.');
      setIsExecuting(false);
      return;
    } else if (parseInt(shots) < 10 || parseInt(shots) > 10000) {
      alert('El número de shots debe estar entre 100 y 10000.');
      setIsExecuting(false);
      return;
    }
      console.log("Código traducido a enviar:", codigoTraducido);
      console.log("ID del circuito seleccionado:", selectedCircuitoId);
      console.log("Plataforma seleccionada:", plataforma);
      console.log("Número de shots:", shots);
      console.log("Máquina seleccionada:", maquina);
      const response = await axios.post('http://localhost:8000/ejecutar_circuito/', {
        email: userEmail,
        codigo_traducido: codigoTraducido,
        circuito_id: selectedCircuitoId, // Utilizamos el ID almacenado en el estado
        plataforma: plataforma,
        shots: shots,
        maquina: maquina
      });

      console.log('999999999:', response.data.circuito);


      setCodigoCircuitoAWS(response.data.circuito);
      setEjecucionEnCurso(response.data.circuito);
      if (response.data.circuito === "ERROR") {
        setNoEjecucion(response.data.circuito);
      }
      else {
      setEjecucionCompletada(response.data.circuito);
      }
      
      const tareaId = response.data.tarea_id;
      
      // Utiliza los datos como necesites
      console.log("ID de tarea:", tareaId);
    } catch (error) {
      console.error('Error al ejecutar traducción:', error);
    } finally {
      setIsExecuting(false); // Indicar que se ha completado la ejecución
    }
  };
  
  const handleEjecutarAwsClick = () => {
    setEjecucionEnCurso("NO NULO");
    setNoEjecucion("NO NULO");
    setEjecucionCompletada(null);
    ejecutarTraduccion(awsCode, "AWS", selectedShotsAWS, selectedMaquinaAWS);
  };
  
  const handleEjecutarIbmClick = () => {
    setEjecucionEnCurso("NO NULO");
    setNoEjecucion("NO NULO");
    setEjecucionCompletada(null);
    ejecutarTraduccion(ibmCode, "IBM", selectedShotsIBM, selectedMaquinaIBM);
  };

  const handleBack = () => {
    setTranslatedCircuito(null);
    setReceivedUrl(''); // Limpiar la URL del circuito seleccionado
    setEjecucionEnCurso("NO NULO");
    setNoEjecucion("NO NULO");
    setSelectedProvider(null);
    setSelectedMaquinaAWS('');
    setSelectedMaquinaIBM('');
    setSelectedShotsAWS('');
    setSelectedShotsIBM('');
    setEjecucionCompletada(null);
    setNombreCircuito(null);
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
      setIsEditingName(false);
      setEditingOrEjecting(false);
    } catch (error) {
      console.error('Error al actualizar el nombre del circuito:', error);
    }
  };

  const handleDeleteClick = (id) => {
    const isConfirmed = window.confirm("¿Está seguro de que quiere borrar el circuito y todos los resultados del mismo?");
    if (isConfirmed) {
      handleDeleteCircuito(id);
    }
  };
  
  const handleDeleteCircuito = async (id) => {
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
    setIsEditingName(true);
    setEditingOrEjecting(true);
  };

  const handleNombreChange = (event) => {
    setEditedNombre(event.target.value);
  };

  const handleEditCode = (circuito) => {
    const urlQuirk = `${circuito.url}&cadena=${circuito.cadena}`;
    window.location.href = urlQuirk;
  };
  
  

  return (
    <div className="mis-circuitos-container">
      <div className="mis-circuitos-header">
      <h2>Circuitos creados</h2>
      </div>
      {translatedCircuito ? (
        <div>
          <div className="mis-circuitos-circuito-header">
          <h3>{nombreCircuito}</h3>
          </div>
          <div className="mis-circuitos-button-container">
            <button className='button-custom-miscircuitos-aws' onClick={() => handleProviderClick('AWS')}>
              <img src={awsIcon} alt="AWS Logo" className='img-aws'/>
            </button>
            <button className='button-custom-miscircuitos-ibm' onClick={() => handleProviderClick('IBM')}>
              <img src={ibmIcon} alt="IBM Logo" className='img-ibm' />
            </button>
          </div>
          <div className="mis-circuitos-code-container">
            {selectedProvider === 'AWS' && (
              <div className="mis-circuitos-quadrant">
                <h4>Código AWS:</h4>
                <pre>{awsCode}</pre>
                <label htmlFor="selectMaquinaAWS">Seleccionar máquina: </label>
                <select
                  id="selectMaquinaAWS"
                  value={selectedMaquinaAWS}
                  onChange={(e) => setSelectedMaquinaAWS(e.target.value)}
                >
                  <option value="">Seleccione una</option>
                  <option value="local">local</option>
                  <option value="sv1">sv1</option>
                  <option value="tn1">tn1</option>
                  <option value="dm1">dm1</option>
                  <option value="ionq">ionq</option>
                  <option value="ionq Aria 1">ionq Aria 1</option>
                  <option value="ionq Aria 2">ionq Aria 2</option>
                  <option value="ionq Forte">ionq Forte</option>
                  <option value="rigetti">rigetti</option>
                  <option value="oqc lucy">oqc lucy</option>
                  <option value="quera aquila">quera aquila</option>
                  <option value="garnet">garnet</option>
                </select>
                <div className="mis-circuitos-message">
                  {mensaje ? (
                    <p>{mensaje}</p>
                  ) : (
                    <>
                      <p>Precio por tarea: {precioTarea} USD</p>
                      <p>Precio por shot: {precioShot} USD</p>
                    </>
                  )}
                </div>
                <input
                  type="number"
                  value={selectedShotsAWS}
                  onChange={(e) => setSelectedShotsAWS(Number(e.target.value))}
                  placeholder="Número de shots"
                />
                {selectedMaquinaAWS && !["local", "sv1", "dm1", "tn1"].includes(selectedMaquinaAWS) && (
                  <div className="mis-circuitos-cost-info">
                    <p>Costo total: {costoTotal.toFixed(2)} USD</p>
                  </div>
                )}
                <button onClick={handleEjecutarAwsClick}>Ejecutar AWS</button>
                {!ejecucionEnCurso && (
                  <p>
                    Su ejecución está en curso, puede comprobar el estado de la misma en la pestaña <a href="http://localhost:3000/resultados">Resultados</a>.
                  </p>
                )}
                {ejecucionCompletada && (
                  <p>
                    Su ejecución ha sido completada. Puede ver los resultados en la pestaña <a href="http://localhost:3000/resultados">Resultados</a>.
                  </p>
                )}
                {noEjecucion === "ERROR" && (
                  <p>
                    La máquina seleccionada no está disponible. Por favor, inténtelo de nuevo más tarde.
                  </p>
                )}
                {isExecuting && <LoadingOverlayS />}
              </div>
            )}
            {selectedProvider === 'IBM' && (
              <div className="mis-circuitos-quadrant">
                <h4>Código IBM:</h4>
                <pre>{ibmCode}</pre>
                <label htmlFor="selectMaquinaIBM">Seleccionar máquina: </label>
                <select
                  id="selectMaquinaIBM"
                  value={selectedMaquinaIBM}
                  onChange={(e) => setSelectedMaquinaIBM(e.target.value)}
                >
                  <option value="">Seleccione una</option>
                  <option value="local">local</option>
                  <option value="ibmq_qasm_simulator">ibmq_qasm_simulator</option>
                  <option value="simulator_statevector">simulator_statevector</option>
                  <option value="simulator_extended_stabilizer">simulator_extended_stabilizer</option>
                  <option value="simulator_stabilizer">simulator_stabilizer</option>
                  <option value="simulator_mps">simulator_mps</option>
                  <option value="ibm_kyoto">ibm_kyoto</option>
                  <option value="ibm_osaka">ibm_osaka</option>
                  <option value="ibm_brisbane">ibm_brisbane</option>
                  <option value="ibm_sherbrooke">ibm_shebrooke</option>
                </select>
                <input
                  type="number"
                  value={selectedShotsIBM}
                  onChange={(e) => setSelectedShotsIBM(e.target.value)}
                  placeholder="Número de shots"
                />
                <button onClick={handleEjecutarIbmClick}>Ejecutar IBM</button>
                {!ejecucionEnCurso && (
                  <p>
                    Su ejecución está en curso, puede comprobar el estado de la misma en la pestaña <a href="http://localhost:3000/resultados">Resultados</a>.
                  </p>
                )}
                {ejecucionCompletada && (
                  <p>
                    Su ejecución ha sido completada. Puede ver los resultados en la pestaña <a href="http://localhost:3000/resultados">Resultados</a>.
                  </p>
                )}
                {noEjecucion === "ERROR" && (
                  <p>
                    La máquina seleccionada no está disponible. Por favor, inténtelo de nuevo más tarde.
                  </p>
                )}
                {isExecuting && <LoadingOverlayS />}
              </div>
            )}
          </div>
          {!receivedUrl && (
            <p>
              <button onClick={() => handleSendUrl(selectedCircuitoUrl)}>Crear servicio</button>
            </p>
          )}
          {receivedUrl && (
            <p>
              El servicio ha sido creado correctamente. Puede acceder a él en la siguiente URL:{' '}
              <a href={receivedUrl}>{receivedUrl}</a>
            </p>
          )}
          {isExecuting && <LoadingOverlayS />}
          <p>
            <button onClick={handleBack}>Volver</button>
          </p>
        </div>
      ) : (
        <ul className="mis-circuitos-list">
          {circuitos.map((circuito, index) => (
            <li key={index} className="mis-circuitos-circuito-container">
              <div className="mis-circuitos-circuito-header">
                {editingCircuito === circuito ? (
                  <>
                    <input
                      type="text"
                      value={editedNombre}
                      onChange={handleNombreChange}
                    />
                    <button className='mis-circuitos-blue-button' onClick={() => handleEditNombre(circuito.id, editedNombre)}>Guardar cambios</button>
                  </>
                ) : (
                  <>
                    <span className="mis-circuitos-circuito-name">
                      <h4>{circuito.nombre ? circuito.nombre : `Circuito ${circuito.id}`}</h4>
                    </span>
                    <button
                      disabled={isEditingOrEjecting}
                      className="mis-circuitos-blue-button"
                      onClick={() => handleEditClick(circuito)}
                    >
                      Cambiar nombre
                    </button>
                  </>
                )}
              </div>
              {circuito.screenshot_url && (
                <div>
                  <h5>Imagen del circuito:</h5>
                  {/* <p>{circuito.screenshot_url}</p> */}
                  <img src={circuito.screenshot_url} alt="Screenshot del circuito" className='img-circuito' />
                </div>
              )}
              <div className="mis-circuitos-circuito-buttons">
                <div className="mis-circuitos-circuito-buttons-left">
                <button
                  disabled={isEditingName || isEditingOrEjecting}
                  className='mis-circuitos-icon-button'
                  onClick={() => window.open(circuito.url, '_blank')}
                >
                  <img src={searchIcon} alt="Ver" title='Ver circuito (Quirk)' className="icon-button" />
                </button>
                <button
                  disabled={isEditingName || isEditingOrEjecting}
                  className='mis-circuitos-icon-button'
                  onClick={() => handleEditCode(circuito)}
                >
                  <img src={editIcon} alt="Editar" title='Editar circuito (Quirk)' className="icon-button" />
                </button>
                </div>
                <div className="mis-circuitos-circuito-buttons-middle">
                <button
                  disabled={isTranslating || isEditingName || isEditingOrEjecting}
                  className='mis-circuitos-icon-button'
                  onClick={() => {
                    setSelectedCircuitoId(circuito.id);
                    setNombreCircuito(circuito.nombre ? circuito.nombre : `Circuito ${circuito.id}`);
                    handleTranslate(circuito.url, circuito.nombre, circuito.url_desplegada);
                  }}
                >
                  <img src={playIcon} alt="Ejecutar" title='Ejecutar circuito' className="icon-button" />
                </button>
                </div>
                <div className="mis-circuitos-circuito-buttons-right">
                <button
                  disabled={isEditingName || isEditingOrEjecting}
                  className='mis-circuitos-icon-button'
                  onClick={() => handleDeleteClick(circuito.id)}
                >
                  <img src={trashIcon} alt="Borrar" title='Borrar circuito' className="icon-button" />
                </button>
              </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};  

export default withAuthenticationRequired(MisCircuitos, {
  onRedirecting: () => <div>Cargando...</div>,
});