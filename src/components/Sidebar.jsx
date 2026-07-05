import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiBell, FiSettings, FiHeart, FiX } from 'react-icons/fi';

/**
 * Responsive Sidebar Navigation for dashboard layout.
 */
const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  // Helper to determine if a route is active
  const isActiveRoute = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: FiGrid },
    { label: 'Alerts Logs', path: '/alerts', icon: FiBell },
    { label: 'Settings', path: '/settings', icon: FiSettings }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <FiHeart size={24} style={{ fill: 'currentColor' }} />
        <span>SmartHealth</span>
        {isOpen && (
          <button 
            type="button" 
            className="menu-toggle" 
            onClick={onClose}
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}
            aria-label="Close menu"
          >
            <FiX size={20} />
          </button>
        )}
      </div>

      <ul className="sidebar-menu">
        {navItems.map((item) => {
          const active = isActiveRoute(item.path);
          const Icon = item.icon;
          return (
            <li 
              key={item.path} 
              className={`sidebar-item ${active ? 'active' : ''}`}
            >
              <Link to={item.path} onClick={() => onClose && onClose()}>
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <p>© 2026 SmartHealth v1.0</p>
        <p>Production Build</p>
      </div>
    </aside>
  );
};

export default Sidebar;
