import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const ReceptorDatos = () => {
  const location = useLocation();
  const [id, setId] = useState(null);
  const [link, setLink] = useState(null);

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

  useEffect(() => {
    getParamsFromUrl();
  }, [location]);

  useEffect(() => {
    if (id) {
      getLinkFromDjango();
    }
  }, [id]);

  if (!id) {
    return <div>No se pudo obtener el ID</div>;
  }

  if (!link) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <p>Link asociado al ID {id}: {link}</p>
    </div>
  );
};

export default ReceptorDatos;
