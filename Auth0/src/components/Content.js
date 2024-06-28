import { Row, Col } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth0 } from '@auth0/auth0-react'; // Importa useAuth0 de Auth0
import contentData from "../utils/contentData";

const Content = () => {
  const { isAuthenticated } = useAuth0(); // Extrae el estado de autenticación de Auth0

  return (
    <div className="next-steps my-5">
      <h2 className="my-5 text-center">¿Qué puedo hacer?</h2>
      <Row className="d-flex justify-content-between">
        {contentData.map((col, i) => (
          <Col key={i} md={5} className="mb-4">
            <h6 className="mb-3">
              {/* Renderiza el enlace solo si el usuario está autenticado */}
              {isAuthenticated ? (
                <a href={col.link}>
                  <FontAwesomeIcon icon="link" className="mr-2" />
                  {col.title}
                </a>
              ) : (
                // Si el usuario no está autenticado, renderiza solo el título sin enlace
                <>
                  <FontAwesomeIcon icon="link" className="mr-2" />
                  {col.title}
                </>
              )}
            </h6>
            <p>{col.description}</p>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Content;
