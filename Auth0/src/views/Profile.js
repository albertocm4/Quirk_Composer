import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Button, Form, FormGroup, Label, Input } from "reactstrap";
import Loading from "../components/Loading";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import "../ProfileComponent.css";


export const ProfileComponent = () => {
  const { user } = useAuth0();
  const [editMode, setEditMode] = useState(false);
  const [awsPublic, setawsPublic] = useState("");
  const [awsPrivate, setawsPrivate] = useState("");
  const [awsFolder, setawsFolder] = useState("");
  const [ibmKey, setIBMKey] = useState("");

  useEffect(() => {
    const fetchDeploymentInfo = async () => {
      try {
        console.log(`URL de solicitud: http://localhost:8000/recuperar_info/${user.email}/`);
        const response = await axios.get(`http://localhost:8000/recuperar_info/${user.email}/`);
        if (Object.keys(response.data).length !== 0) {
          const { public_AWS, private_AWS, folder_AWS, clave_IBM } = response.data;
          setawsPublic(public_AWS || "");
          setawsPrivate(private_AWS || "");
          setawsFolder(folder_AWS || "");
          setIBMKey(clave_IBM || "");
        }
        else {
          console.log('No se encontró información del email del usuario en la base de datos.');
        }
      } catch (error) {
        console.error('Error al obtener la información del despliegue:', error);
      }
    };
    
    fetchDeploymentInfo();
  }, [user]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        await axios.post(`http://localhost:8000/create_update/`, {
          email: user.email,
          public_AWS: awsPublic,
          private_AWS: awsPrivate,
          s3_folder: awsFolder,
          clave_IBM: ibmKey
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } 
      setEditMode(false);
    } catch (error) {
      console.error('Error al guardar los datos del despliegue:', error);
    }
  };

  return (
    <Container className="profile-component mb-5">
      <Row className="align-items-center profile-header mb-5 text-center text-md-left">
        <Col md={2}>
          <img
            src={user.picture}
            alt="Profile"
            className="rounded-circle img-fluid profile-picture mb-3 mb-md-0"
          />
        </Col>
        <Col md>
          <h2>{user.name}</h2>
          <p className="lead text-muted">{user.email}</p>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form>
            <FormGroup>
              <Label for="awsPublic">Clave AWS</Label>
              <Input
                type="text"
                name="awsPublic"
                id="awsPublic"
                placeholder="Clave pública"
                value={awsPublic}
                onChange={(e) => setawsPublic(e.target.value)}
                disabled={!editMode}
              />
            </FormGroup>
            <FormGroup>
              <Input
                type="text"
                name="awsPrivate"
                id="awsPrivate"
                placeholder="Clave privada"
                value={awsPrivate}
                onChange={(e) => setawsPrivate(e.target.value)}
                disabled={!editMode}
              />
            </FormGroup>
            <FormGroup>
              <Input
                type="text"
                name="awsFolder"
                id="awsFolder"
                placeholder="Carpeta S3"
                value={awsFolder}
                onChange={(e) => setawsFolder(e.target.value)}
                disabled={!editMode}
              />
            </FormGroup>
            <FormGroup>
              <Label for="ibmKey">Clave IBM</Label>
              <Input
                type="text"
                name="ibmKey"
                id="ibmKey"
                placeholder="Token"
                value={ibmKey}
                onChange={(e) => setIBMKey(e.target.value)}
                disabled={!editMode}
              />
            </FormGroup>
            <div className="profile-button">
            {editMode ? (
              <Button  onClick={handleSave}>
                Guardar
              </Button>
            ) : (
              <Button onClick={handleEdit}>
                Editar
              </Button>
            )}
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default withAuthenticationRequired(ProfileComponent, {
  onRedirecting: () => <Loading />,
});
