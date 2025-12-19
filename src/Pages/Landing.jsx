import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Landing.css';

const Landing = () => {
  return (
    <div className="landing-body">
      <Link to="/login" className="namee">
        <div>
          <h1 className="namee-inner">Smart_Canteen_Billing</h1>
        </div>
      </Link>
    </div>
  );
};

export default Landing;