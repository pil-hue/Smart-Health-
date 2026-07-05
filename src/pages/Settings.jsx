import React, { useState } from 'react';
import { FiSliders, FiBell, FiShield, FiSave } from 'react-icons/fi';

/**
 * Settings and thresholds configuration page.
 */
const Settings = () => {
  const [activeTab, setActiveTab] = useState('thresholds');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings values
  const [bedThreshold, setBedThreshold] = useState(85);
  const [medicineThreshold, setMedicineThreshold] = useState(25);
  const [cmoName, setCmoName] = useState('Dr. Rajesh Kumar');
  const [districtEmail, setDistrictEmail] = useState('admin.central@health.gov');
  const [enableSMS, setEnableSMS] = useState(true);
  const [enableEmail, setEnableEmail] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1>System Configurations</h1>
        <p>Manage alert triggers, notification rules, and district registry details</p>
      </div>

      <div className="settings-grid">
        {/* Navigation Sidebar */}
        <div className="settings-nav">
          <button 
            type="button" 
            className={`settings-nav-btn ${activeTab === 'thresholds' ? 'active' : ''}`}
            onClick={() => setActiveTab('thresholds')}
          >
            <FiSliders style={{ marginRight: '8px' }} /> Threshold Settings
          </button>
          <button 
            type="button" 
            className={`settings-nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <FiBell style={{ marginRight: '8px' }} /> Dispatch Rules
          </button>
          <button 
            type="button" 
            className={`settings-nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <FiShield style={{ marginRight: '8px' }} /> Profile Registry
          </button>
        </div>

        {/* Configurations Forms Container */}
        <div>
          <form className="settings-form" onSubmit={handleSave}>
            
            {activeTab === 'thresholds' && (
              <>
                <h2>Critical Alert Thresholds</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '-12px' }}>
                  Define percentages and counts at which automated alarms will trigger in the alerts register.
                </p>

                <div className="form-group">
                  <label htmlFor="bedThreshold">Bed Occupancy Alert Limit ({bedThreshold}%)</label>
                  <input 
                    id="bedThreshold"
                    type="range" 
                    min="50" 
                    max="100" 
                    value={bedThreshold} 
                    onChange={(e) => setBedThreshold(Number(e.target.value))}
                  />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Alarms dispatch if total occupied beds exceed this percentage of standard capacity.
                  </span>
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label htmlFor="medicineThreshold">Medicine Out-of-Stock Level ({medicineThreshold}%)</label>
                  <input 
                    id="medicineThreshold"
                    type="range" 
                    min="5" 
                    max="50" 
                    value={medicineThreshold} 
                    onChange={(e) => setMedicineThreshold(Number(e.target.value))}
                  />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Triggers warning flags when available medicine inventory goes below this ratio of minimum requirements.
                  </span>
                </div>
              </>
            )}

            {activeTab === 'notifications' && (
              <>
                <h2>Alert Dispatch Rules</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '-12px' }}>
                  Configure where incident notifications are pushed when a PHC issues critical alarms.
                </p>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                  <input 
                    id="enableSMS"
                    type="checkbox" 
                    checked={enableSMS} 
                    onChange={(e) => setEnableSMS(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <label htmlFor="enableSMS" style={{ cursor: 'pointer' }}>SMS Alerts to Chief Medical Officer</label>
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                  <input 
                    id="enableEmail"
                    type="checkbox" 
                    checked={enableEmail} 
                    onChange={(e) => setEnableEmail(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <label htmlFor="enableEmail" style={{ cursor: 'pointer' }}>Email Reports to State Health Directorate</label>
                </div>
              </>
            )}

            {activeTab === 'admin' && (
              <>
                <h2>Registry Contact Info</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '-12px' }}>
                  Primary contacts registered for system logs audit reports.
                </p>

                <div className="form-group">
                  <label htmlFor="cmoName">Chief Medical Officer (CMO)</label>
                  <input 
                    id="cmoName"
                    type="text" 
                    value={cmoName} 
                    onChange={(e) => setCmoName(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="districtEmail">Official Reporting Email</label>
                  <input 
                    id="districtEmail"
                    type="email" 
                    value={districtEmail} 
                    onChange={(e) => setDistrictEmail(e.target.value)} 
                    required 
                  />
                </div>
              </>
            )}

            {/* Save Row & Notifications */}
            <div className="settings-save-row" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {saveSuccess && (
                <span style={{ color: 'var(--success)', fontWeight: '600', fontSize: '14px' }}>
                  Settings updated successfully!
                </span>
              )}
              <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiSave /> Save Changes
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
