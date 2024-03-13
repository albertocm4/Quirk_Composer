import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  return (
    <Route
      {...rest}
      render={(props) =>
        isLoading ? (
          <div>Cargando...</div>
        ) : isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default ProtectedRoute;
