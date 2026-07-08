import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribePHCs } from '../services/phcService';
import { getAttendanceByPHC } from '../services/attendanceService';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorComponent from '../components/ErrorComponent';
import { 
  FiActivity, 
  FiUsers, 
  FiAlertTriangle, 
  FiPlusSquare, 
  FiCheckSquare,
  FiTrendingUp,
  FiX
} from 'react-icons/fi';

/**
 * District Dashboard Page.
 * Displays aggregate metrics and lists all local Primary Health Centers.
 */
const Dashboard = ({ selectedDistrictId }) => {
  const navigate = useNavigate();
  const [phcs, setPhcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Reset modal state when district changes
  useEffect(() => {
    setActiveModal(null);
  }, [selectedDistrictId]);

  // Load doctor attendance data for the district when active modal is opened
  useEffect(() => {
    if (activeModal === 'doctorsPresent' && phcs.length > 0) {
      setLoadingAttendance(true);
      Promise.all(
        phcs.map(async (phc) => {
          try {
            const staff = await getAttendanceByPHC(phc.id);
            // Filter to include only doctor roles
            const doctors = staff.filter(member => 
              member.role.toLowerCase().includes('doctor')
            );
            return doctors.map(doc => ({
              ...doc,
              phcName: phc.name
            }));
          } catch (err) {
            console.error(`Error loading attendance for PHC ${phc.name}:`, err);
            return [];
          }
        })
      ).then(results => {
        setAttendanceData(results.flat());
        setLoadingAttendance(false);
      }).catch(err => {
        console.error("Error loading doctors attendance:", err);
        setLoadingAttendance(false);
      });
    }
  }, [activeModal, phcs]);

  // Subscribe to real-time changes in PHCs under the selected district
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const unsubscribe = subscribePHCs(
      selectedDistrictId,
      (data) => {
        setPhcs(data);
        setLoading(false);
      },
      (err) => {
        setError('Failed to sync Primary Health Center records. Please reload.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedDistrictId]);

  if (loading) {
    return <LoadingSpinner message="Synchronizing district health statistics..." />;
  }

  if (error) {
    return <ErrorComponent message={error} onRetry={() => window.location.reload()} />;
  }

  // Aggregate Metrics calculation from active list of PHCs
  const totalPhcs = phcs.length;
  const totalBeds = phcs.reduce((acc, curr) => acc + (curr.totalBeds || 0), 0);
  const occupiedBeds = phcs.reduce((acc, curr) => acc + (curr.occupiedBeds || 0), 0);
  const bedsOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  
  const totalDoctors = phcs.reduce((acc, curr) => acc + (curr.totalDoctors || 0), 0);
  const doctorsPresent = phcs.reduce((acc, curr) => acc + (curr.presentDoctors || 0), 0);
  
  const todayFootfall = phcs.reduce((acc, curr) => acc + (curr.todayFootfall || 0), 0);
  const highRiskPhcs = phcs.filter(p => p.highRisk).length;

  // Handles navigation to details page
  const handlePhcClick = (phc) => {
    navigate(`/phc/${phc.id}`);
  };

  // Reusable DataTable Columns setup
  const columns = [
    {
      header: 'PHC Name',
      accessor: 'name',
      style: { fontWeight: '600', color: 'var(--text-primary)' }
    },
    {
      header: 'Bed Occupancy',
      render: (row) => {
        const rate = row.totalBeds > 0 ? Math.round((row.occupiedBeds / row.totalBeds) * 100) : 0;
        let barColor = 'var(--success)';
        if (rate >= 90) barColor = 'var(--danger)';
        else if (rate >= 75) barColor = 'var(--warning)';

        return (
          <div className="progress-container" style={{ minWidth: '140px' }}>
            <div className="progress-header">
              <span>{row.occupiedBeds} / {row.totalBeds} Beds</span>
              <span>{rate}%</span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${rate}%`, backgroundColor: barColor }}
              ></div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Doctors Status',
      render: (row) => (
        <span className="flex-align text-semibold">
          <span 
            style={{ 
              color: row.presentDoctors === row.totalDoctors ? 'var(--success)' : row.presentDoctors < row.totalDoctors / 2 ? 'var(--danger)' : 'var(--warning)'
            }}
          >
            {row.presentDoctors} / {row.totalDoctors}
          </span>
          <span className="text-sm" style={{ color: 'var(--text-muted)', fontWeight: '400' }}>
            present
          </span>
        </span>
      )
    },
    {
      header: "Today's Footfall",
      accessor: 'todayFootfall',
      render: (row) => (
        <span className="flex-align text-semibold">
          <FiTrendingUp style={{ color: 'var(--primary)' }} />
          {row.todayFootfall}
        </span>
      )
    },
    {
      header: 'Status Flag',
      render: (row) => (
        <span className={`badge ${row.highRisk ? 'badge-danger' : 'badge-success'}`}>
          {row.highRisk ? 'High Risk' : 'Normal'}
        </span>
      )
    }
  ];

  return (
    <div>
      <div className="dashboard-header">
        <h1>District Analytics Dashboard</h1>
        <p style={{ fontSize: '14px' }}>Real-time updates synced via Firestore</p>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <StatCard 
          title="Total PHCs" 
          value={totalPhcs} 
          icon={FiActivity} 
          iconVariant="primary"
          trend={{ value: 'Active', isPositive: true }}
        />
        <StatCard 
          title="Beds Occupancy" 
          value={`${occupiedBeds}/${totalBeds}`} 
          icon={FiPlusSquare} 
          iconVariant="info"
          trend={{ 
            value: `${bedsOccupancyRate}%`, 
            isPositive: bedsOccupancyRate < 80, 
            isCritical: bedsOccupancyRate >= 85,
            label: 'occupied' 
          }}
        />
        <StatCard 
          title="Doctors Present" 
          value={`${doctorsPresent}/${totalDoctors}`} 
          icon={FiCheckSquare} 
          iconVariant="success"
          trend={{ 
            value: totalDoctors > 0 ? `${Math.round((doctorsPresent / totalDoctors) * 100)}%` : '0%', 
            isPositive: doctorsPresent === totalDoctors,
            label: 'attendance rate' 
          }}
          onClick={() => setActiveModal('doctorsPresent')}
        />
        <StatCard 
          title="Today's Footfall" 
          value={todayFootfall} 
          icon={FiUsers} 
          iconVariant="info"
          trend={{ label: 'total outpatient visits today' }}
        />
        <StatCard 
          title="High Risk PHCs" 
          value={highRiskPhcs} 
          icon={FiAlertTriangle} 
          iconVariant={highRiskPhcs > 0 ? 'danger' : 'success'}
          trend={{ 
            value: highRiskPhcs > 0 ? 'Immediate Attention' : 'All Safe', 
            isCritical: highRiskPhcs > 0, 
            isPositive: highRiskPhcs === 0 
          }}
          onClick={() => setActiveModal('highRisk')}
        />
      </div>

      {/* PHC Table */}
      <DataTable
        title="Primary Health Centers"
        columns={columns}
        data={phcs}
        searchPlaceholder="Filter PHCs by name..."
        searchKeys={['name']}
        onRowClick={handlePhcClick}
      />

      {/* High Risk PHCs Modal */}
      {activeModal === 'highRisk' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>High Risk Primary Health Centers</h2>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setActiveModal(null)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-body-list">
                {phcs.filter(p => p.highRisk).length > 0 ? (
                  phcs.filter(p => p.highRisk).map((phc) => (
                    <div key={phc.id} className="modal-list-item">
                      <div className="modal-list-item-left">
                        <span className="modal-list-item-name">{phc.name}</span>
                        <span className="modal-list-item-sub">
                          Beds: {phc.occupiedBeds}/{phc.totalBeds} occupied • Doctors: {phc.presentDoctors}/{phc.totalDoctors} present
                        </span>
                      </div>
                      <div className="modal-list-item-right">
                        <button 
                          type="button"
                          className="modal-action-btn"
                          onClick={() => {
                            setActiveModal(null);
                            handlePhcClick(phc);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
                    All Health Centers operating normally. No high-risk facilities flagged.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctors Present Modal */}
      {activeModal === 'doctorsPresent' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Doctor Attendance Registry</h2>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setActiveModal(null)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              {loadingAttendance ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '40px 0' }}>
                  <div className="spinner" style={{ width: '36px', height: '36px' }}></div>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Compiling registry lists...</span>
                </div>
              ) : (
                <div className="modal-body-list">
                  {attendanceData.length > 0 ? (
                    attendanceData.map((doc) => {
                      let statusColor = 'var(--text-muted)';
                      let statusBg = 'var(--border)';
                      if (doc.status === 'Present') {
                        statusColor = 'var(--success)';
                        statusBg = 'var(--success-light)';
                      } else if (doc.status === 'Absent') {
                        statusColor = 'var(--danger)';
                        statusBg = 'var(--danger-light)';
                      } else if (doc.status === 'On Leave') {
                        statusColor = 'var(--warning)';
                        statusBg = 'var(--warning-light)';
                      }

                      return (
                        <div key={doc.id} className="modal-list-item">
                          <div className="modal-list-item-left">
                            <span className="modal-list-item-name">{doc.staffName}</span>
                            <span className="modal-list-item-sub">
                              {doc.role} • <strong>{doc.phcName}</strong>
                            </span>
                          </div>
                          <div className="modal-list-item-right">
                            <span 
                              className="badge" 
                              style={{ 
                                backgroundColor: statusBg, 
                                color: statusColor, 
                                border: `1px solid ${statusBg}`,
                                padding: '4px 10px',
                                borderRadius: '9999px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              {doc.status}
                            </span>
                            {doc.status === 'Present' && doc.checkInTime !== '-' && (
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {doc.checkInTime}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
                      No attendance logs compiled for today.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
