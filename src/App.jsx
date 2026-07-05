import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { subscribeDistricts } from './services/districtService';
import { subscribeAlerts } from './services/alertsService';

import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import Dashboard from './pages/Dashboard';
import PHCDetails from './pages/PHCDetails';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';

function App() {
  const [districts, setDistricts] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [alertsCount, setAlertsCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        const activeCount = data.filter((a) => !a.resolved).length;
        setAlertsCount(activeCount);
      },
      (err) => console.error('Error syncing active alerts count:', err)
    );

    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <div className="app-container">
        
        {/* Navigation Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
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
          />

          {/* Active section router frame */}
          <main className="content-area">
            <Routes>
              <Route 
                path="/" 
                element={<Dashboard selectedDistrictId={selectedDistrictId} />} 
              />
              <Route 
                path="/phc/:id" 
                element={<PHCDetails />} 
              />
              <Route 
                path="/alerts" 
                element={<Alerts />} 
              />
              <Route 
                path="/settings" 
                element={<Settings />} 
              />
            </Routes>
          </main>

        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;