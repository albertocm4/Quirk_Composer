import React, { useEffect } from "react";

const Home = ({ urlQuirk }) => {
  useEffect(() => {
    console.log("URL Redirected:", urlQuirk);
  }, [urlQuirk]);

  return (
    <div>
      <h1>Welcome to the Home Page!</h1>
      {urlQuirk !== null && (
        <div>
          <h2>URL Redirected from Flask:</h2>
          <p>{urlQuirk}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
