import React from "react";

import logo from "../assets/logo.svg";
import logoNuevo from "../assets/favicon0.png"

const Hero = () => (
  <div className="text-center hero my-5">
    <img className="mb-3 app-logo" src={logoNuevo} alt="React logo" style={{ width: '1000px', height: '300px'}}  />
    <h1 className="mb-4">QCRAFT - QUANTUM DEVELOPER INTERFACE</h1>

    <p className="lead">
      An application for develop and analysis of quantum circuits.
    </p>
  </div>
);

export default Hero;
