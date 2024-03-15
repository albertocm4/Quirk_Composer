import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import Loading from "./components/Loading";

const ReceptorDatos = () => {
  const location = useLocation();
  const [id, setId] = useState(null);
  const [link, setLink] = useState(null);
  const [awsCode, setAwsCode] = useState(null);
  const [ibmCode, setIbmCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const idFromUrl = searchParams.get('id');
    setId(idFromUrl);
  }, [location]);

  useEffect(() => {
    if (id) {
      getLinkFromDjango();
    }
  });

  useEffect(() => {
    if (link) {
      translateToPython();
    }
  });

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

    try {
      const awsResponse = await axios.get('http://localhost:4246/code/aws', { headers: { 'x-url': link } });
      setAwsCode(awsResponse.data.code.join('\n'));

      const ibmResponse = await axios.get('http://localhost:4246/code/ibm', { headers: { 'x-url': link } });
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
   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
     <div style={{ width: '45%' }}>
       <h2>Código AWS:</h2>
       <pre>{awsCode}</pre>
     </div>
     <div style={{ width: '45%' }}>
       <h2>Código IBM:</h2>
       <pre>{ibmCode}</pre>
     </div>
   </div>
 );
};

export default withAuthenticationRequired(ReceptorDatos, {
  onRedirecting: () => <Loading />,
});
