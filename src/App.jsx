import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { subscribeDistricts } from './services/districtService';
import { subscribeAlerts, resolveAlert, resolveAllAlerts } from './services/alertsService';

import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import Dashboard from './pages/Dashboard';
import PHCDetails from './pages/PHCDetails';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';

function App() {
  const [districts, setDistricts] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [alertsCount, setAlertsCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });
  const [transferApproved, setTransferApproved] = useState(false);
  const [reassignmentApproved, setReassignmentApproved] = useState(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // Apply theme to html root tag
  useEffect(() => {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Subscribe to districts listing from database
  useEffect(() => {
    const unsubscribe = subscribeDistricts(
      (data) => {
        setDistricts(data);
        if (data.length > 0) {
          // Default to the first district in list if none selected yet
          setSelectedDistrictId((prev) => prev || data[0].id);
        }
      },
      (err) => console.error('Error syncing districts:', err)
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to active alerts to compute counts
  useEffect(() => {
    const unsubscribe = subscribeAlerts(
      null, // Subscribes to all facility warnings
      (data) => {
        setAlerts(data);
        const activeCount = data.filter((a) => !a.resolved).length;
        setAlertsCount(activeCount);
      },
      (err) => console.error('Error syncing active alerts count:', err)
    );

    return () => unsubscribe();
  }, []);

  const handleResolveAlert = async (alertId) => {
    try {
      await resolveAlert(alertId);
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
    // Optimistic / Fallback state update
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    );
    setAlertsCount((prev) => Math.max(0, prev - 1));
  };

  const handleResolveAllAlerts = async (alertIds) => {
    try {
      await resolveAllAlerts(alertIds);
    } catch (err) {
      console.error('Error resolving all alerts:', err);
    }
    // Optimistic / Fallback state update
    setAlerts((prev) =>
      prev.map((a) => (alertIds.includes(a.id) ? { ...a, resolved: true } : a))
    );
    setAlertsCount(0);
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        
        {/* Navigation Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          language={language}
        />

        {/* Main Panel layout */}
        <div className="main-layout">
          
          {/* Global Header */}
          <TopNavbar 
            title="Healthcare Operations Center"
            districts={districts}
            selectedDistrictId={selectedDistrictId}
            onDistrictChange={setSelectedDistrictId}
            onMenuToggle={() => setIsSidebarOpen(true)}
            alertsCount={alertsCount}
            alerts={alerts}
            onResolveAlert={handleResolveAlert}
            onResolveAllAlerts={handleResolveAllAlerts}
            theme={theme}
            setTheme={setTheme}
            language={language}
            onLanguageChange={handleLanguageChange}
          />


          {/* Active section router frame */}
          <main className="content-area">
            <Routes>
              <Route 
                path="/" 
                element={
                  <Dashboard 
                    selectedDistrictId={selectedDistrictId} 
                    language={language}
                    transferApproved={transferApproved}
                    setTransferApproved={setTransferApproved}
                    reassignmentApproved={reassignmentApproved}
                    setReassignmentApproved={setReassignmentApproved}
                  />
                } 
              />
              <Route 
                path="/phc/:id" 
                element={<PHCDetails language={language} />} 
              />
              <Route 
                path="/alerts" 
                element={<Alerts language={language} />} 
              />
              <Route 
                path="/settings" 
                element={<Settings language={language} />} 
              />
            </Routes>
          </main>

        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;