import React from 'react';

/**
 * A premium loading spinner with customizable text.
 */
const LoadingSpinner = ({ message = 'Loading system data...' }) => {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p className="loader-text">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
