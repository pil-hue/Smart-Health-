import React from 'react';
import { FiMenu, FiBell, FiUser } from 'react-icons/fi';

/**
 * Top Navbar component containing district filtering and user profiles.
 */
const TopNavbar = ({ 
  title = 'Healthcare Dashboard', 
  districts = [], 
  selectedDistrictId, 
  onDistrictChange, 
  onMenuToggle,
  alertsCount = 0
}) => {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <button 
          type="button" 
          className="menu-toggle" 
          onClick={onMenuToggle}
          aria-label="Open sidebar menu"
          style={{ display: 'none', marginRight: '8px' }} // Controlled by media queries
        >
          <FiMenu />
        </button>
        <span className="navbar-title">{title}</span>
      </div>

      <div className="navbar-right">
        {/* District Selector - Rendered only when list of districts is provided */}
        {districts.length > 0 && (
          <select
            className="navbar-district-select"
            value={selectedDistrictId}
            onChange={(e) => onDistrictChange && onDistrictChange(e.target.value)}
            aria-label="Select District"
          >
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        )}

        {/* Notifications Icon Button */}
        <button type="button" className="nav-icon-btn" aria-label="Alert logs notifications">
          <FiBell />
          {alertsCount > 0 && <span className="badge-dot"></span>}
        </button>

        {/* User Profile */}
        <div className="user-profile">
          <div className="avatar">
            <FiUser />
          </div>
          <div className="user-info" style={{ display: 'none' }}>
            {/* Can show on desktop screens */}
            <span className="user-name">Dr. Rajesh Kumar</span>
            <span className="user-role">District Admin</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .navbar .menu-toggle {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .user-info {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};

export default TopNavbar;
