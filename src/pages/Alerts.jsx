import React, { useState, useEffect } from 'react';
import { subscribeAlerts } from '../services/alertsService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorComponent from '../components/ErrorComponent';
import { FiBell, FiAlertCircle, FiAlertTriangle, FiInfo, FiCheck } from 'react-icons/fi';

/**
 * Alerts page.
 * Synchronizes with Firestore to display all current warnings and system logs across facilities.
 */
const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  // Sync real-time updates for all alerts
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeAlerts(
      null, // Fetch alerts for all PHCs
      (data) => {
        setAlerts(data);
        setLoading(false);
      },
      (err) => {
        setError('Failed to establish real-time alert streams. Please reload.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Synchronizing central notification logs..." />;
  }

  if (error) {
    return <ErrorComponent message={error} onRetry={() => window.location.reload()} />;
  }

  // Filter logic
  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;
    return alert.type === filter;
  });

  // Aggregate counts
  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;
  const infoCount = alerts.filter(a => a.type === 'info').length;

  return (
    <div>
      <div className="dashboard-header">
        <h1>Emergency Alert Logs</h1>
        <p>Real-time facility incidents compiled across the selected district</p>
      </div>

      {/* Filter Tabs & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div className="alerts-filter-bar">
          <button 
            type="button" 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Logs ({alerts.length})
          </button>
          <button 
            type="button" 
            className={`filter-btn ${filter === 'critical' ? 'active' : ''}`}
            onClick={() => setFilter('critical')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FiAlertCircle color="var(--danger)" /> Critical ({criticalCount})
          </button>
          <button 
            type="button" 
            className={`filter-btn ${filter === 'warning' ? 'active' : ''}`}
            onClick={() => setFilter('warning')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FiAlertTriangle color="var(--warning)" /> Warnings ({warningCount})
          </button>
          <button 
            type="button" 
            className={`filter-btn ${filter === 'info' ? 'active' : ''}`}
            onClick={() => setFilter('info')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FiInfo color="var(--info)" /> Updates ({infoCount})
          </button>
        </div>
      </div>

      {/* Alerts Stream List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            let Icon = FiInfo;
            let iconColor = 'var(--info)';
            if (alert.type === 'critical') {
              Icon = FiAlertCircle;
              iconColor = 'var(--danger)';
            } else if (alert.type === 'warning') {
              Icon = FiAlertTriangle;
              iconColor = 'var(--warning)';
            }

            return (
              <div key={alert.id} className="alert-item-card">
                <div 
                  className={`alert-indicator ${alert.type}`}
                  style={{ backgroundColor: iconColor }}
                ></div>
                <div className="alert-content">
                  <div className="alert-meta">
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                      {alert.phcName}
                    </span>
                    <span className="alert-time">
                      {new Date(alert.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                    <Icon style={{ color: iconColor }} />
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {alert.title}
                    </h3>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.4' }}>
                    {alert.description}
                  </p>
                </div>

                <button 
                  type="button" 
                  className="filter-btn" 
                  style={{ padding: '6px 12px', fontSize: '12px', alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => alert.resolved = true}
                  disabled={alert.resolved}
                >
                  <FiCheck /> {alert.resolved ? 'Resolved' : 'Acknowledge'}
                </button>
              </div>
            );
          })
        ) : (
          <div className="table-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <FiBell size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              No alerts found for selected severity.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              All health facilities report operations running smoothly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
