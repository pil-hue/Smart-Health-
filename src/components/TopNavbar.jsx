import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiBell, FiUser, FiAlertCircle, FiAlertTriangle, FiInfo, FiCheck, FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import { TRANSLATIONS } from '../utils/translations';

/**
 * Top Navbar component containing district filtering, notifications dropdown, theme toggler, and user profiles.
 */
const TopNavbar = ({ 
  title = 'Healthcare Dashboard', 
  districts = [], 
  selectedDistrictId, 
  onDistrictChange, 
  onMenuToggle,
  alertsCount = 0,
  alerts = [],
  onResolveAlert,
  onResolveAllAlerts,
  theme = 'system',
  setTheme,
  language = 'en',
  onLanguageChange
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConfirmAll, setShowConfirmAll] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setShowConfirmAll(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeAlerts = alerts.filter((a) => !a.resolved);

  const handleMarkAllRead = () => {
    if (onResolveAllAlerts && activeAlerts.length > 0) {
      const activeIds = activeAlerts.map((a) => a.id);
      onResolveAllAlerts(activeIds);
    }
  };

  const formatRelativeTime = (timeStr) => {
    try {
      const date = new Date(timeStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

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
        <span className="navbar-title">{t.title}</span>
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

        {/* Notifications Icon Button with Dropdown Wrapper */}
        <div className="notifications-wrapper" ref={dropdownRef}>
          <button 
            type="button" 
            className="nav-icon-btn" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-label="Alert logs notifications"
            aria-expanded={isDropdownOpen}
          >
            <FiBell />
            {activeAlerts.length > 0 && <span className="badge-dot"></span>}
          </button>

          {isDropdownOpen && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>{t.activeAlerts} ({activeAlerts.length})</h3>
                {activeAlerts.length > 0 && (
                  <div className="confirm-all-container">
                    {!showConfirmAll ? (
                      <button 
                        type="button" 
                        className="clear-all-btn"
                        onClick={() => setShowConfirmAll(true)}
                      >
                        {t.markAllRead}
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button 
                          type="button" 
                          className="confirm-ack-all-btn"
                          onClick={() => {
                            handleMarkAllRead();
                            setShowConfirmAll(false);
                          }}
                        >
                          {t.confirmAckAll}
                        </button>
                        <button 
                          type="button" 
                          className="cancel-ack-all-btn"
                          onClick={() => setShowConfirmAll(false)}
                        >
                          {t.cancel}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="notifications-list">
                {activeAlerts.length > 0 ? (
                  activeAlerts.map((alert) => {
                    let Icon = FiInfo;
                    if (alert.type === 'critical') Icon = FiAlertCircle;
                    else if (alert.type === 'warning') Icon = FiAlertTriangle;

                    return (
                      <div key={alert.id} className={`notification-item ${alert.type}`}>
                        <div className="notification-icon">
                          <Icon />
                        </div>
                        <div className="notification-details">
                          <div className="notification-meta">
                            <span className="notification-phc">{alert.phcName}</span>
                            <span className="notification-time">{formatRelativeTime(alert.time)}</span>
                          </div>
                          <h4 className="notification-title">{alert.title}</h4>
                          <p className="notification-desc">{alert.description}</p>
                          <button 
                            type="button"
                            className="notification-ack-btn"
                            onClick={() => onResolveAlert && onResolveAlert(alert.id)}
                          >
                            <FiCheck /> Acknowledge
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="notifications-empty">
                    <FiBell className="empty-bell-icon" />
                    <p>{t.activeAlerts === 'Active Alerts' ? 'No active alerts' : t.activeAlerts === 'सक्रिय अलर्ट' ? 'कोई सक्रिय अलर्ट नहीं' : 'యాక్టివ్ హెచ్చరికలు లేవు'}</p>
                    <span>All health facilities report operations running smoothly.</span>
                  </div>
                )}
              </div>

              <div className="notifications-footer">
                <Link to="/alerts" onClick={() => setIsDropdownOpen(false)}>
                  {t.viewAllAlerts}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Multilingual Selector */}
        <div style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
          <select
            className="navbar-district-select"
            value={language}
            onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
            aria-label="Language Selector"
            style={{ padding: '6px 12px', minWidth: '95px' }}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="te">తెలుగు</option>
          </select>
        </div>

        {/* Theme Segmented Switcher */}
        <div className="theme-segmented-control">
          <button 
            type="button" 
            className={`theme-segment-btn ${theme === 'light' ? 'active' : ''}`}
            onClick={() => setTheme('light')}
            aria-label="Light Mode"
            title="Light Mode"
          >
            <FiSun />
          </button>
          <button 
            type="button" 
            className={`theme-segment-btn ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => setTheme('dark')}
            aria-label="Dark Mode"
            title="Dark Mode"
          >
            <FiMoon />
          </button>
          <button 
            type="button" 
            className={`theme-segment-btn ${theme === 'system' ? 'active' : ''}`}
            onClick={() => setTheme('system')}
            aria-label="System Default"
            title="System Default"
          >
            <FiMonitor />
          </button>
        </div>

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
