// src/components/LoadingOverlay.js
import React from 'react';
import loadingIcon from '../assets/loading-icon.svg'; // Añade el icono de "cargando" en la carpeta assets
import '../LoadingOverlay.css';

const LoadingOverlay = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <img src={loadingIcon} alt="Cargando" className="loading-icon" />
        <p>Cargando servicio en docker, por favor, espere...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
