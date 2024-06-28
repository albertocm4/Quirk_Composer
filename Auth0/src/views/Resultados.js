import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUserEmail } from '../components/UserEmailContext';
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';
import Chart from 'chart.js/auto';
import '../Resultados.css';
import LoadingOverlay from '../components/LoadingOverlayR';

const Resultados = () => {
  const { user } = useAuth0();
  const { setUserEmail } = useUserEmail();
  const [circuitos, setCircuitos] = useState([]);
  const [selectedCircuito, setSelectedCircuito] = useState(null);
  const [selectedCodigo, setSelectedCodigo] = useState(null);
  const [selectedTareaId, setSelectedTareaId] = useState(null);
  const [selectedTipoCircuito, setSelectedTipoCircuito] = useState(null);
  const [selectedEstado, setSelectedEstado] = useState(null);
  const [idCircuito, setIdCircuito] = useState(null);
  const [nombreCircuitoR, setNombreCircuitoR] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    const fetchCircuitos = async () => {
      try {
        if (user && user.email) {
          setUserEmail(user.email);
          const response = await axios.get(`http://localhost:8000/obtener_nombres_circuitos_por_email/?email=${user.email}`);
          setCircuitos(response.data.circuitos);
          console.log("Circuitos:", response.data.circuitos);
        }
      } catch (error) {
        console.error('Error al obtener los circuitos:', error);
      }
    };
    fetchCircuitos();
  }, [user]);

  const handleVerDetalles = async (circuito) => {
    try {
      const response = await axios.get(`http://localhost:8000/obtener_resultados_circuito/?id=${circuito.id}`);
      setSelectedCircuito({ ...circuito, resultados: response.data.resultados });
      setSelectedCodigo(null);
      console.log("Circuitos:", response.data.resultados);
      console.log("Circuito seleccionado:", circuito);
    } catch (error) {
      console.error('Error al obtener los detalles del circuito:', error);
    }
  };

  const handleVerGrafico = async (codigo, tarea_id, tipo_circuito, id) => {
    setSelectedCodigo(codigo);
    setSelectedTareaId(tarea_id);
    console.log("Task ID:", tarea_id);
    setIdCircuito(id);
    console.log("ID Circuito:", id);
    setSelectedTipoCircuito(tipo_circuito);
    setSelectedEstado('DISPONIBLE');
  };

  const handleBorrarCodigo = async (codigoABorrar) => {
      // Mostrar confirmación
  const confirmacion = window.confirm("¿Está seguro de que desea borrar el resultado?");

  // Si el usuario elige "No", no hacer nada
  if (!confirmacion) {
    return;
  }
    console.log("Código a borrarEMPEZAR:", codigoABorrar);
    try {
      console.log("Código a borrar:", codigoABorrar);

      if (!circuitos || !selectedCircuito) {
        console.error('Circuitos o el circuito seleccionado no están definidos');
        return;
      }

      const resultadoIdABorrar = idCircuito;
      console.log("Resultado ID a borrar:", resultadoIdABorrar);
      await axios.delete(`http://localhost:8000/resultados/borrar/${resultadoIdABorrar}/`);

      const updatedCircuitos = await fetchCircuitos();
      setCircuitos(updatedCircuitos);

      setIdCircuito(null);

      const updatedSelectedCircuito = { ...selectedCircuito };
      updatedSelectedCircuito.resultados = updatedSelectedCircuito.resultados.filter(resultado => resultado.id !== resultadoIdABorrar);
      setSelectedCircuito(updatedSelectedCircuito);

      setSelectedCodigo(null);
      if (updatedSelectedCircuito.resultados.length === 0) {
        setSelectedCircuito(null);
      }
      setSelectedTareaId(null);
    } catch (error) {
      console.error('Error al borrar el resultado:', error.response ? error.response.data.error : error.message);
    }
  };

  const fetchCircuitos = async () => {
    try {
      if (user && user.email) {
        setUserEmail(user.email);
        const response = await axios.get(`http://localhost:8000/obtener_nombres_circuitos_por_email/?email=${user.email}`);
        return response.data.circuitos;
      }
    } catch (error) {
      console.error('Error al obtener los circuitos:', error);
    }
  };

  useEffect(() => {
    if (!selectedCodigo && selectedTareaId) {
      visualizerState(selectedTareaId, selectedTipoCircuito);
    } else if (selectedCodigo) {
      renderIndividualChart(selectedCodigo);
    }
  }, [selectedCodigo, selectedTareaId, selectedTipoCircuito]);

  const visualizerState = async (selectedTareaId, selectedTipoCircuito) => {
    setIsExecuting(true);
    try {
      const response = await axios.post('http://localhost:8000/check_task_result/', {
        task_id: selectedTareaId,
        email: user.email,
        tipo_circuito: selectedTipoCircuito,
      });

      if (response.data.result !== null) {
        setSelectedCodigo(response.data.result);
        renderIndividualChart(response.data.result);
      } else {
        setSelectedEstado(null);
      }
    } catch (error) {
      console.error('Error al verificar la tarea:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const renderIndividualChart = (datos) => {
    if (!datos) return;

    const parsedData = JSON.parse(datos.replace(/'/g, '"'));
    const labels = Object.keys(parsedData);
    const values = Object.values(parsedData);

    const ctx = document.getElementById('myChart');
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Cantidad',
            data: values,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  };

  const handleFiltroAWS = () => {
    setFiltro('AWS');
  };

  const handleFiltroIBM = () => {
    setFiltro('IBM');
  };

  return (
    <div className="resultados-container">
      {isExecuting && <LoadingOverlay />}
      <h2>Resultados de circuitos</h2>
      {selectedCodigo && selectedEstado && (
        <div className="resultado-item">
          <h3>Gráfico del código {selectedCodigo}:</h3>
          <canvas id="myChart"></canvas>
          <div className="resultado-buttons">
            <button className='resultado-b-only' onClick={() => handleBorrarCodigo(selectedCodigo)}>Borrar resultado</button>
            <span> <button onClick={() => { setSelectedCodigo(null); setSelectedTareaId(null); }}>Volver</button></span>
          </div>
        </div>
      )}
      {!selectedCodigo && selectedTareaId && !selectedEstado && (
        <div className="resultado-item">
          <h3>El circuito con el ID | {selectedTareaId} | de {selectedTipoCircuito} aún no está disponible. Vuelve a intentarlo después nuevamente.</h3>
          <div className="resultado-buttons">
            <button onClick={() => { setSelectedCodigo(null); setSelectedTareaId(null); setNombreCircuitoR(null); }}>Volver</button>
          </div>
        </div>
      )}
      {!selectedCodigo && selectedCircuito && !selectedTareaId && (
        <div className="resultado-item">
          <div className="filtro-container">
            <button onClick={handleFiltroAWS}>AWS</button>
            <button onClick={handleFiltroIBM}>IBM</button>
          </div>
          <div className="resultados-header">
            <h4>{nombreCircuitoR}</h4>
          </div>
          {filtro && (
            <div className="detalle-header">
              <h4>Plataforma {filtro}:</h4>
            </div>
          )}
          <ul>
            {selectedCircuito.resultados.filter(resultado => resultado.tipo_circuito === filtro).map((resultado, index) => (
              <li key={index} className="resultado-item">
                <div className="resultado-detalle">
                <p>
                  <span className="label">Código: </span>
                  <span className="value">{resultado.codigo}</span>
                </p>
                <p>
                  <span className="label">Tarea: </span>
                  <span className="value">{resultado.tarea_id}</span>
                </p>
                <p>
                  <span className="label">ID del circuito: </span>
                  <span className="value">{resultado.id}</span>
                </p>
                </div>
                <div className="resultado-buttons-lista">
                  <button onClick={() => handleVerGrafico(resultado.codigo, resultado.tarea_id, resultado.tipo_circuito, resultado.id)}>Ver gráfico</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="resultado-buttons">
            <button onClick={() => { setSelectedCircuito(null); setIdCircuito(null); setNombreCircuitoR(null); setFiltro(null); }}>Volver</button>
          </div>
        </div>
      )}
      {!selectedCircuito && (
        <div className="resultado-item">
          <h4>Seleccione un circuito:</h4>
          <ul>
            {circuitos.map((circuito, index) => (
              <li key={index} className="resultado-item">
                <div>
                  <h5>{circuito.nombre}</h5>
                </div>
                <div className="resultado-buttons">
                  <button onClick={() => { setNombreCircuitoR(circuito.nombre ? circuito.nombre : `${circuito.id}`); handleVerDetalles(circuito) }}>Ver detalles</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default withAuthenticationRequired(Resultados, {
  onRedirecting: () => <div>Cargando...</div>,
});