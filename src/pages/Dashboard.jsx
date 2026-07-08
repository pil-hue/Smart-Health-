import React, { useState, useEffect, useRef } from 'react';
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

import { TRANSLATIONS } from '../utils/translations';

/**
 * District Dashboard Page.
 * Displays aggregate metrics and lists all local Primary Health Centers.
 */
const Dashboard = ({ 
  selectedDistrictId, 
  language = 'en',
  transferApproved,
  setTransferApproved,
  reassignmentApproved,
  setReassignmentApproved
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const navigate = useNavigate();
  const [phcs, setPhcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');
  const [selectedPhc, setSelectedPhc] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const tableRef = useRef(null);
  const [doctorPage, setDoctorPage] = useState(1);
  const doctorsPerPage = 10;

  useEffect(() => {
    setDoctorPage(1);
  }, [doctorSearchQuery, selectedPhc, selectedStatus, selectedRole, activeModal]);

  useEffect(() => {
    setDoctorSearchQuery('');
    setSelectedPhc('all');
    setSelectedStatus('all');
    setSelectedRole('all');
  }, [activeModal]);

  const handleApproveTransfer = () => {
    setTransferApproved(true);
  };

  const handleApproveReassignment = () => {
    setReassignmentApproved(true);
  };

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
      header: t.facilityName,
      accessor: 'name',
      style: { fontWeight: '600', color: 'var(--text-primary)' }
    },
    {
      header: t.bedsAvailability,
      render: (row) => {
        const rate = row.totalBeds > 0 ? Math.round((row.occupiedBeds / row.totalBeds) * 100) : 0;
        let barColor = 'var(--success)';
        if (rate >= 90) barColor = 'var(--danger)';
        else if (rate >= 75) barColor = 'var(--warning)';

        return (
          <div className="progress-container" style={{ minWidth: '140px' }}>
            <div className="progress-header">
              <span>{row.occupiedBeds} / {row.totalBeds} {t.beds.split(' ')[0]}</span>
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
      header: t.doctorsAtt,
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
            {language === 'hi' ? 'उपस्थित' : language === 'te' ? 'హాజరు' : 'present'}
          </span>
        </span>
      )
    },
    {
      header: t.dailyOutpatients,
      accessor: 'todayFootfall',
      render: (row) => (
        <span className="flex-align text-semibold">
          <FiTrendingUp style={{ color: 'var(--primary)' }} />
          {row.todayFootfall}
        </span>
      )
    },
    {
      header: t.riskStatus,
      render: (row) => (
        <span className={`badge ${row.highRisk ? 'badge-danger' : 'badge-success'}`}>
          {row.highRisk ? t.critical : t.normal}
        </span>
      )
    }
  ];

  return (
    <div>
      <div className="dashboard-header">
        <h1>{t.title}</h1>
        <p style={{ fontSize: '14px' }}>
          {language === 'hi' ? 'फायरस्टोर के माध्यम से रीयल-टाइम अपडेट' : language === 'te' ? 'ఫైర్‌స్టోర్ ద్వారా నిజ-సమయ అప్‌డేట్లు' : 'Real-time updates synced via Firestore'}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <StatCard 
          title={t.totalPhcs} 
          value={totalPhcs} 
          icon={FiActivity} 
          iconVariant="primary"
          trend={{ value: 'Active', isPositive: true }}
          onClick={() => tableRef.current?.scrollIntoView({ behavior: 'smooth' })}
        />
        <StatCard 
          title={t.beds} 
          value={`${occupiedBeds}/${totalBeds}`} 
          icon={FiPlusSquare} 
          iconVariant="info"
          trend={{ 
            value: `${bedsOccupancyRate}%`, 
            isPositive: bedsOccupancyRate < 80, 
            isCritical: bedsOccupancyRate >= 85,
            label: language === 'hi' ? 'अधिभोग' : language === 'te' ? 'వినియోగం' : 'occupied' 
          }}
          onClick={() => tableRef.current?.scrollIntoView({ behavior: 'smooth' })}
        />
        <StatCard 
          title={t.doctors} 
          value={`${doctorsPresent}/${totalDoctors}`} 
          icon={FiCheckSquare} 
          iconVariant="success"
          trend={{ 
            value: totalDoctors > 0 ? `${Math.round((doctorsPresent / totalDoctors) * 100)}%` : '0%', 
            isPositive: doctorsPresent === totalDoctors,
            label: language === 'hi' ? 'उपस्थिति दर' : language === 'te' ? 'హజరు శాతం' : 'attendance rate' 
          }}
          onClick={() => setActiveModal('doctorsPresent')}
        />
        <StatCard 
          title={t.footfall} 
          value={todayFootfall} 
          icon={FiUsers} 
          iconVariant="info"
          trend={{ label: language === 'hi' ? 'आज की कुल ओपीडी' : language === 'te' ? 'నేటి మొత్తం అవుట్‌పేషంట్లు' : 'total outpatient visits today' }}
          onClick={() => tableRef.current?.scrollIntoView({ behavior: 'smooth' })}
        />
        <StatCard 
          title={t.highRisk} 
          value={highRiskPhcs} 
          icon={FiAlertTriangle} 
          iconVariant={highRiskPhcs > 0 ? 'danger' : 'success'}
          trend={{ 
            value: highRiskPhcs > 0 ? (language === 'hi' ? 'तत्काल ध्यान दें' : language === 'te' ? 'తక్షణ శ్రద్ధ' : 'Immediate Attention') : (language === 'hi' ? 'सब सुरक्षित' : language === 'te' ? 'సురక్షితం' : 'All Safe'), 
            isCritical: highRiskPhcs > 0, 
            isPositive: highRiskPhcs === 0 
          }}
          onClick={() => setActiveModal('highRisk')}
        />
      </div>

      {/* AI Supply Chain Optimizer & Resource Redistribution */}
      <div style={{ marginTop: '32px', marginBottom: '32px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <FiActivity style={{ color: 'var(--primary)' }} size={24} />
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            {t.aiOptimizer}
          </h2>
          <span className="badge badge-success" style={{ fontSize: '11px', textTransform: 'uppercase' }}>AI Live Recommendations</span>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '-8px', marginBottom: '20px' }}>
          {t.redistributionRecs}
        </p>

        <div className="theme-options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Recommendation 1: Supplies Transfer */}
          <div style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-warning" style={{ fontSize: '11px' }}>SUPPLY OPTIMIZATION</span>
              <strong style={{ fontSize: '12px', color: 'var(--warning)' }}>98% Match Confidence</strong>
            </div>
            <h4 style={{ margin: '4px 0', fontSize: '15px', color: 'var(--text-primary)' }}>
              Transfer 20 Units of Insulin Glargine
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              <strong>Amberpet</strong> has run out of Insulin (0 units remaining, 5 active patients). <strong>Kukatpally</strong> reports a surplus of 50 units (only 12 units required for local safety buffer).
            </p>
            <div style={{ marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Kukatpally → Amberpet
              </span>
              <button 
                type="button" 
                className="modal-action-btn"
                onClick={handleApproveTransfer}
                disabled={transferApproved}
                style={{
                  backgroundColor: transferApproved ? 'var(--success-light)' : '',
                  color: transferApproved ? 'var(--success)' : '',
                  borderColor: transferApproved ? 'var(--success-border)' : '',
                  cursor: transferApproved ? 'not-allowed' : 'pointer'
                }}
              >
                {transferApproved ? '✓ Dispatched' : 'Approve Transfer'}
              </button>
            </div>
          </div>

          {/* Recommendation 2: Staff Reassignment */}
          <div style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-danger" style={{ fontSize: '11px' }}>STAFF WORKLOAD REDISTRIBUTION</span>
              <strong style={{ fontSize: '12px', color: 'var(--danger)' }}>94% Match Confidence</strong>
            </div>
            <h4 style={{ margin: '4px 0', fontSize: '15px', color: 'var(--text-primary)' }}>
              Temporarily Reassign 1 Medical Officer
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              <strong>Charminar</strong> reports a Doctor Absence alert and high beds occupancy (91%). <strong>Nampally</strong> has a surplus of active staff (10 doctors present, occupancy 84%).
            </p>
            <div style={{ marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Nampally → Charminar
              </span>
              <button 
                type="button" 
                className="modal-action-btn"
                onClick={handleApproveReassignment}
                disabled={reassignmentApproved}
                style={{
                  backgroundColor: reassignmentApproved ? 'var(--success-light)' : '',
                  color: reassignmentApproved ? 'var(--success)' : '',
                  borderColor: reassignmentApproved ? 'var(--success-border)' : '',
                  cursor: reassignmentApproved ? 'not-allowed' : 'pointer'
                }}
              >
                {reassignmentApproved ? '✓ Dispatched' : 'Approve Reassignment'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PHC Table */}
      <div ref={tableRef}>
        <DataTable
          title={t.totalPhcs}
          columns={columns}
          data={phcs}
          searchPlaceholder={language === 'hi' ? 'चिकित्सा सुविधा को नाम से फ़िल्टर करें...' : language === 'te' ? 'ఆరోగ్య కేంద్రాన్ని పేరు ద్వారా శోధించండి...' : 'Filter facilities by name...'}
          searchKeys={['name']}
          onRowClick={handlePhcClick}
        />
      </div>

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
                <>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
                    gap: '12px', 
                    padding: '0 0 16px 0', 
                    borderBottom: '1px solid var(--border)', 
                    marginBottom: '16px' 
                  }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        {language === 'hi' ? 'डॉक्टर का नाम' : language === 'te' ? 'వైద్యుని పేరు' : 'Doctor Name'}
                      </label>
                      <input
                        type="text"
                        placeholder={language === 'hi' ? 'नाम से खोजें...' : language === 'te' ? 'పేరు ద్వారా శోధించండి...' : 'Search name...'}
                        value={doctorSearchQuery}
                        onChange={(e) => setDoctorSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-app)',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                          height: '38px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        {language === 'hi' ? 'स्थान (पीएचसी)' : language === 'te' ? 'స్థలం (PHC)' : 'Place (PHC)'}
                      </label>
                      <select
                        value={selectedPhc}
                        onChange={(e) => setSelectedPhc(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-app)',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                          height: '38px',
                          cursor: 'pointer',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="all">{language === 'hi' ? 'सभी स्थान' : language === 'te' ? 'అన్ని స్థలాలు' : 'All Places'}</option>
                        {Array.from(new Set(attendanceData.map(doc => doc.phcName))).sort().map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        {language === 'hi' ? 'स्थिति' : language === 'te' ? 'స్థితి' : 'Status'}
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-app)',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                          height: '38px',
                          cursor: 'pointer',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="all">{language === 'hi' ? 'सभी' : language === 'te' ? 'అన్ని' : 'All'}</option>
                        <option value="Present">{language === 'hi' ? 'उपस्थित' : language === 'te' ? 'హాజరు' : 'Present'}</option>
                        <option value="Absent">{language === 'hi' ? 'अनुपस्थित' : language === 'te' ? 'గైర్హాజరు' : 'Absent'}</option>
                        <option value="On Leave">{language === 'hi' ? 'छुट्टी पर' : language === 'te' ? 'సెలవులో' : 'On Leave'}</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        {language === 'hi' ? 'पद / विशेषता' : language === 'te' ? 'పదవి / ప్రత్యేకత' : 'Position / Specialty'}
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-app)',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                          height: '38px',
                          cursor: 'pointer',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="all">{language === 'hi' ? 'सभी पद' : language === 'te' ? 'అన్ని పదవులు' : 'All Roles'}</option>
                        <option value="cmo">{language === 'hi' ? 'सीएमओ (CMO)' : language === 'te' ? 'సీఎంఓ (CMO)' : 'CMO'}</option>
                        <option value="surgeon">{language === 'hi' ? 'सर्जन' : language === 'te' ? 'సర్జన్' : 'Surgeon'}</option>
                        <option value="pediatrician">{language === 'hi' ? 'बाल रोग विशेषज्ञ' : language === 'te' ? 'పిడియాట్రీషియన్' : 'Pediatrician'}</option>
                        <option value="general physician">{language === 'hi' ? 'सामान्य चिकित्सक' : language === 'te' ? 'జనరల్ ఫిజీషియన్' : 'General Physician'}</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="modal-body-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {(() => {
                      const filtered = attendanceData.filter(doc => {
                        const matchesSearch = doc.staffName.toLowerCase().includes(doctorSearchQuery.toLowerCase());
                        const matchesPhc = selectedPhc === 'all' || doc.phcName === selectedPhc;
                        const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
                        const matchesRole = selectedRole === 'all' || doc.role.toLowerCase().includes(selectedRole.toLowerCase());
                        return matchesSearch && matchesPhc && matchesStatus && matchesRole;
                      });

                      const totalPages = Math.ceil(filtered.length / doctorsPerPage);
                      const startIndex = (doctorPage - 1) * doctorsPerPage;
                      const endIndex = startIndex + doctorsPerPage;
                      const paginatedDocs = filtered.slice(startIndex, endIndex);

                      return (
                        <>
                          {paginatedDocs.length > 0 ? (
                            paginatedDocs.map((doc) => {
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
                              {language === 'hi' ? 'कोई डॉक्टर नहीं मिले।' : language === 'te' ? 'వైద్యులు ఎవరూ కనుగొనబడలేదు.' : 'No doctors found matching query.'}
                            </div>
                          )}

                          {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
                              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                Showing {startIndex + 1}-{Math.min(endIndex, filtered.length)} of {filtered.length} Doctors
                              </span>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <button 
                                  type="button" 
                                  className="filter-btn" 
                                  onClick={() => setDoctorPage(prev => Math.max(1, prev - 1))}
                                  disabled={doctorPage === 1}
                                  style={{ padding: '6px 10px', fontSize: '12px', cursor: doctorPage === 1 ? 'not-allowed' : 'pointer', opacity: doctorPage === 1 ? 0.5 : 1 }}
                                >
                                  Prev
                                </button>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pg) => {
                                    const isVisible = pg === 1 || pg === totalPages || Math.abs(pg - doctorPage) <= 1;
                                    if (!isVisible) {
                                      if (pg === 2 || pg === totalPages - 1) {
                                        return <span key={`ell-${pg}`} style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '0 4px' }}>...</span>;
                                      }
                                      return null;
                                    }

                                    return (
                                      <button
                                        key={pg}
                                        type="button"
                                        onClick={() => setDoctorPage(pg)}
                                        style={{
                                          width: '28px',
                                          height: '28px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          borderRadius: 'var(--radius-sm)',
                                          border: '1px solid var(--border)',
                                          fontSize: '12px',
                                          cursor: 'pointer',
                                          backgroundColor: doctorPage === pg ? 'var(--primary)' : 'var(--bg-app)',
                                          color: doctorPage === pg ? '#fff' : 'var(--text-primary)',
                                          fontWeight: doctorPage === pg ? 'bold' : 'normal'
                                        }}
                                      >
                                        {pg}
                                      </button>
                                    );
                                  })}
                                </div>
                                <button 
                                  type="button" 
                                  className="filter-btn" 
                                  onClick={() => setDoctorPage(prev => Math.min(totalPages, prev + 1))}
                                  disabled={doctorPage === totalPages}
                                  style={{ padding: '6px 10px', fontSize: '12px', cursor: doctorPage === totalPages ? 'not-allowed' : 'pointer', opacity: doctorPage === totalPages ? 0.5 : 1 }}
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
