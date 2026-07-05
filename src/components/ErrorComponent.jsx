import React from 'react';
import { FiAlertOctagon } from 'react-icons/fi';

/**
 * Reusable error UI block with a Retry CTA.
 */
const ErrorComponent = ({ 
  title = 'System Error Occurred', 
  message = 'Failed to load database records. Please try again.', 
  onRetry 
}) => {
  return (
    <div className="error-container">
      <div className="error-title">
        <FiAlertOctagon size={24} />
        <span>{title}</span>
      </div>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button type="button" className="btn-retry" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorComponent;
