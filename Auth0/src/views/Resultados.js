import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUserEmail } from '../components/UserEmailContext'; 
import { useAuth0 } from '@auth0/auth0-react';
import Chart from 'chart.js/auto'; // Importar Chart.js

const Resultados = () => {
  const { user } = useAuth0();
  const { setUserEmail } = useUserEmail();
  const [circuitos, setCircuitos] = useState([]);
  const [selectedCircuito, setSelectedCircuito] = useState(null);
  const [selectedCodigo, setSelectedCodigo] = useState(null); // Nuevo estado para almacenar el código seleccionado

  useEffect(() => {
    const fetchCircuitos = async () => {
      try {
        if (user && user.email) {
          setUserEmail(user.email);
          const response = await axios.get(`http://localhost:8000/obtener_resultados_por_email/?email=${user.email}`);
          console.log('Respuesta de la solicitud axios:', response);
          const circuitosConResultados = response.data.circuitos.filter(circuito => circuito.resultados.length > 0); // Filtrar circuitos con resultados
          setCircuitos(circuitosConResultados);
        }
      } catch (error) {
        console.error('Error al obtener los circuitos:', error);
      }
    };
  
    fetchCircuitos();
  }, [user]);

  const handleVerDetalles = (circuito) => {
    setSelectedCircuito(circuito);
    setSelectedCodigo(null); // Reiniciar el código seleccionado al mostrar detalles del circuito
  };

  const handleVerGrafico = (codigo) => {
    setSelectedCodigo(codigo);
  };

  const handleBorrarCodigo = async (codigoABorrar) => {
    try {
      // Buscar el resultado con el código correspondiente
      const resultadoABorrar = circuitos.flatMap(circuito => circuito.resultados).find(resultado => resultado.codigo === codigoABorrar);
  
      if (!resultadoABorrar) {
        console.error('No se encontró el resultado con el código:', codigoABorrar);
        return;
      }
  
      const response = await axios.delete(`http://localhost:8000/resultados/borrar/${resultadoABorrar.id}/`);
      console.log(response.data.message); // Mensaje de éxito
  
      // Después de borrar el resultado, actualiza la lista de circuitos para reflejar los cambios
      const updatedCircuitos = await fetchCircuitos();
      setCircuitos(updatedCircuitos);
  
      // Filtra los resultados del circuito para eliminar el resultado que coincide con el código que se borró
      const updatedSelectedCircuito = { ...selectedCircuito };
      updatedSelectedCircuito.resultados = updatedSelectedCircuito.resultados.filter(resultado => resultado.codigo !== codigoABorrar);
      setSelectedCircuito(updatedSelectedCircuito);
  
      // Restablecer selectedCodigo a null para volver a la lista de circuitos
      setSelectedCodigo(null);
  
      // Verificar si el listado de códigos está vacío y simular el evento de hacer clic en el botón "Volver"
      if (updatedSelectedCircuito.resultados.length === 0) {
        setSelectedCircuito(null);
      }
    } catch (error) {
      console.error('Error al borrar el resultado:', error.response.data.error); // Mensaje de error
    }
  };
  
  
  
  const fetchCircuitos = async () => {
    try {
      if (user && user.email) {
        setUserEmail(user.email);
        const response = await axios.get(`http://localhost:8000/obtener_resultados_por_email/?email=${user.email}`);
        console.log('Respuesta de la solicitud axios:', response);
        const circuitosConResultados = response.data.circuitos.filter(circuito => circuito.resultados.length > 0); // Filtrar circuitos con resultados
        return circuitosConResultados;
      }
    } catch (error) {
      console.error('Error al obtener los circuitos:', error);
    }
  };
  
  useEffect(() => {
    if (selectedCodigo) {
      renderIndividualChart(selectedCodigo);
    }
  }, [selectedCodigo]);
  
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
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  };

  return (
    <div>
      <h2>Resultados de circuitos:</h2>
      {selectedCodigo && (
        <div>
          <h3>Gráfico del código {selectedCodigo}:</h3>
          <canvas id="myChart" style={{ width: '250px !important', height: '250px !important' }}></canvas>
          <button onClick={() => handleBorrarCodigo(selectedCodigo)}>Borrar código</button>
          <button onClick={() => setSelectedCodigo(null)}>Volver</button>
        </div>
      )}
      {!selectedCodigo && selectedCircuito && (
  <div>
    <h3>Detalles del circuito:</h3>
    <h4>Códigos de tipo AWS:</h4>
    <ul>
      {selectedCircuito.resultados.filter(resultado => resultado.tipo_circuito === 'AWS').map((resultado, index) => (
        <li key={index}>
          <p>Código: {resultado.codigo}</p>
          <button onClick={() => handleVerGrafico(resultado.codigo)}>Ver gráfico</button>
        </li>
      ))}
    </ul>
    <h4>Códigos de tipo IBM:</h4>
    <ul>
      {selectedCircuito.resultados.filter(resultado => resultado.tipo_circuito === 'IBM').map((resultado, index) => (
        <li key={index}>
          <p>Código: {resultado.codigo}</p>
          <button onClick={() => handleVerGrafico(resultado.codigo)}>Ver gráfico</button>
        </li>
      ))}
    </ul>
    <button onClick={() => setSelectedCircuito(null)}>Volver</button>
  </div>
)}

      {!selectedCodigo && !selectedCircuito && (
        <ul>
          {circuitos.map((circuito, index) => (
            <li key={index}>
              <span>Nombre: {circuito.nombre} </span>
              <button onClick={() => handleVerDetalles(circuito)}>Ver resultados</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Resultados;
