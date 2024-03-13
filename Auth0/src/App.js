import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ReceptorDatos from './ReceptorDatos';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/receptor-datos" component={ReceptorDatos} />
        {/* Otras rutas y componentes */}
      </Switch>
    </Router>
  );
}
 
export default App;
