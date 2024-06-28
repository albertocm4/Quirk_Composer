import React, { Fragment } from "react";

import Hero from "../components/Hero";
import Content from "../components/Content";
import "../Home.css";


const Home = () => (
  <Fragment>
    <Hero />
    <hr />
    <Content />
    <div className="centered-button">
    <button onClick={() => window.location.href = "http://localhost:4444/quirk.html"}>¡Crear circuito!</button>
    </div>
  </Fragment>
);

export default Home;
