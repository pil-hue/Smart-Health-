import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subscribePHCById } from '../services/phcService';
import { subscribeStockByPHC } from '../services/stockService';
import { subscribeAttendanceByPHC } from '../services/attendanceService';
import { subscribeAlerts } from '../services/alertsService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorComponent from '../components/ErrorComponent';
import StatCard from '../components/StatCard';
import { 
  FiArrowLeft, 
  FiPlusSquare, 
  FiUsers, 
  FiPackage, 
  FiBell,
  FiMapPin,
  FiPhone,
  FiActivity
} from 'react-icons/fi';

/**
 * Detailed Dashboard for a single Primary Health Center.
 */
const PHCDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State objects for various Firestore data streams
  const [phc, setPhc] = useState(null);
  const [stock, setStock] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    let unsubPHC, unsubStock, unsubAttendance, unsubAlerts;

    try {
      // 1. Subscribe to basic PHC details
      unsubPHC = subscribePHCById(
        id,
        (data) => {
          setPhc(data);
          // Only stop main loading spinner once primary PHC object is ready
          setLoading(false);
        },
        (err) => {
          setError('Primary Health Center records could not be located.');
          setLoading(false);
        }
      );

      // 2. Subscribe to related stock list
      unsubStock = subscribeStockByPHC(
        id,
        (data) => setStock(data),
        (err) => console.error('Error fetching stock:', err)
      );

      // 3. Subscribe to related staff attendance sheet
      unsubAttendance = subscribeAttendanceByPHC(
        id,
        (data) => setAttendance(data),
        (err) => console.error('Error fetching attendance:', err)
      );

      // 4. Subscribe to alerts logs
      unsubAlerts = subscribeAlerts(
        id,
        (data) => setAlerts(data),
        (err) => console.error('Error fetching alerts:', err)
      );
    } catch (e) {
      setError('An error occurred setting up data streams.');
      setLoading(false);
    }

    // Clean up subscriptions on unmount
    return () => {
      if (unsubPHC) unsubPHC();
      if (unsubStock) unsubStock();
      if (unsubAttendance) unsubAttendance();
      if (unsubAlerts) unsubAlerts();
    };
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Retrieving Primary Health Center dashboard..." />;
  }

  if (error || !phc) {
    return (
      <div style={{ padding: '20px' }}>
        <button type="button" className="filter-btn" onClick={() => navigate('/')} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiArrowLeft /> Back to Dashboard
        </button>
        <ErrorComponent 
          title="Records Missing" 
          message={error || "The selected PHC could not be found."} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    );
  }

  // Calculate metrics for details section
  const lowStockCount = stock.filter(item => item.status === 'Low' || item.status === 'Out of Stock').length;
  const presentStaff = attendance.filter(person => person.status === 'Present').length;
  const totalStaff = attendance.length;
  const activeAlertsCount = alerts.filter(a => !a.resolved).length;
  
  const bedRate = phc.totalBeds > 0 ? Math.round((phc.occupiedBeds / phc.totalBeds) * 100) : 0;

  return (
    <div>
      {/* Navigation and Title */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          type="button" 
          className="filter-btn" 
          onClick={() => navigate('/')} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FiArrowLeft /> Back
        </button>
        <span style={{ color: 'var(--text-muted)' }}>PHC Registry / Details</span>
      </div>

      {/* Header Info Block */}
      <div className="phc-details-header">
        <div className="phc-info-block">
          <h1>{phc.name}</h1>
          <div className="phc-badge-row">
            <span className={`badge ${phc.highRisk ? 'badge-danger' : 'badge-success'}`}>
              {phc.highRisk ? 'High Risk Indicator' : 'Normal Operations'}
            </span>
            <span className="badge badge-info">ID: {phc.id}</span>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '16px', flexWrap: 'wrap' }}>
            <span className="flex-align text-sm" style={{ color: 'var(--text-secondary)' }}>
              <FiMapPin style={{ color: 'var(--primary)' }} /> {phc.address}
            </span>
            <span className="flex-align text-sm" style={{ color: 'var(--text-secondary)' }}>
              <FiPhone style={{ color: 'var(--primary)' }} /> {phc.phone}
            </span>
          </div>
        </div>
      </div>

      {/* Mini Stats Bar */}
      <div className="metrics-grid" style={{ marginBottom: '32px' }}>
        <StatCard 
          title="Beds Occupancy" 
          value={`${phc.occupiedBeds} / ${phc.totalBeds}`} 
          icon={FiPlusSquare} 
          iconVariant={bedRate >= 85 ? 'danger' : bedRate >= 70 ? 'warning' : 'primary'}
          trend={{ value: `${bedRate}%`, isCritical: bedRate >= 85 }}
        />
        <StatCard 
          title="Daily Outpatients" 
          value={phc.todayFootfall} 
          icon={FiActivity} 
          iconVariant="info"
          trend={{ label: 'Footfall today' }}
        />
        <StatCard 
          title="Staff Duty Roll" 
          value={`${presentStaff} / ${totalStaff}`} 
          icon={FiUsers} 
          iconVariant="success"
          trend={{ label: 'Medical staff present' }}
        />
        <StatCard 
          title="Critical Alerts" 
          value={activeAlertsCount} 
          icon={FiBell} 
          iconVariant={activeAlertsCount > 0 ? 'danger' : 'success'}
          trend={{ value: activeAlertsCount > 0 ? 'Active Issues' : 'All clear' }}
        />
      </div>

      {/* Sections Grid */}
      <div className="phc-details-grid">
        
        {/* Section 1: Bed Occupancy */}
        <div className="phc-section-card">
          <div className="phc-section-title">
            <FiPlusSquare style={{ color: 'var(--primary)' }} size={20} />
            <h2>Bed Occupancy Details</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="progress-container">
              <div className="progress-header">
                <span>General Wards & ICU Beds</span>
                <span>{bedRate}%</span>
              </div>
              <div className="progress-bar-bg" style={{ height: '14px' }}>
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${bedRate}%`, 
                    backgroundColor: bedRate >= 85 ? 'var(--danger)' : bedRate >= 70 ? 'var(--warning)' : 'var(--success)'
                  }}
                ></div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Occupied Beds</span>
                <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{phc.occupiedBeds}</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Available Beds</span>
                <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success)' }}>{phc.totalBeds - phc.occupiedBeds}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Active Alerts */}
        <div className="phc-section-card">
          <div className="phc-section-title">
            <FiBell style={{ color: 'var(--primary)' }} size={20} />
            <h2>Active Alerts</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto' }}>
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  style={{ 
                    padding: '12px 16px', 
                    borderRadius: 'var(--radius-sm)', 
                    border: `1px solid ${alert.type === 'critical' ? 'var(--danger-border)' : 'var(--warning-border)'}`,
                    backgroundColor: alert.type === 'critical' ? 'var(--danger-light)' : 'var(--warning-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: alert.type === 'critical' ? 'var(--danger)' : 'var(--warning)', textTransform: 'uppercase', fontSize: '12px' }}>
                      {alert.type}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(alert.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', margin: '2px 0' }}>{alert.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{alert.description}</p>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ padding: '20px' }}>
                No active critical alerts for this facility.
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Staff Attendance */}
        <div className="phc-section-card" style={{ gridColumn: 'span 2' }}>
          <div className="phc-section-title">
            <FiUsers style={{ color: 'var(--primary)' }} size={20} />
            <h2>Medical Staff Duty Roll</h2>
          </div>
          
          <div className="table-responsive">
            <table className="custom-table" style={{ border: 'none' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 16px' }}>Staff Name</th>
                  <th style={{ padding: '10px 16px' }}>Role / Specialty</th>
                  <th style={{ padding: '10px 16px' }}>Date</th>
                  <th style={{ padding: '10px 16px' }}>Check-in</th>
                  <th style={{ padding: '10px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((person) => (
                  <tr key={person.id}>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{person.staffName}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{person.role}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{person.date}</td>
                    <td style={{ padding: '12px 16px' }}>{person.checkInTime}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${
                        person.status === 'Present' ? 'badge-success' : person.status === 'Absent' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {person.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Medicine Stock */}
        <div className="phc-section-card" style={{ gridColumn: 'span 2' }}>
          <div className="phc-section-title">
            <FiPackage style={{ color: 'var(--primary)' }} size={20} />
            <h2>Medicine Inventory Tracker</h2>
          </div>
          
          <div className="table-responsive">
            <table className="custom-table" style={{ border: 'none' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 16px' }}>Medicine Name</th>
                  <th style={{ padding: '10px 16px' }}>Category</th>
                  <th style={{ padding: '10px 16px' }}>Available Quantity</th>
                  <th style={{ padding: '10px 16px' }}>Safety Threshold</th>
                  <th style={{ padding: '10px 16px' }}>Stock Level Status</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((item) => (
                  <tr key={item.id}>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{item.name}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{item.category}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '600' }}>
                      <span style={{ color: item.available === 0 ? 'var(--danger)' : 'inherit' }}>
                        {item.available} units
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{item.minRequired} units</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${
                        item.status === 'Good' ? 'badge-success' : item.status === 'Low' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Demographics & Key Health Indicators */}
        <div className="phc-section-card" style={{ gridColumn: 'span 2' }}>
          <div className="phc-section-title">
            <FiActivity style={{ color: 'var(--primary)' }} size={20} />
            <h2>Demographics & Key Health Indicators ({phc.year || 2023})</h2>
          </div>
          
          <div className="metrics-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '16px' }}>
            <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL POPULATION</span>
              <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: '4px 0' }}>
                {(phc.population_total || 0).toLocaleString()}
              </p>
              <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <span>👦 Male: {(phc.population_male || 0).toLocaleString()}</span>
                <span>👧 Female: {(phc.population_female || 0).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontWeight: '600' }}>AREA & DENSITY</span>
              <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: '4px 0' }}>
                {phc.area_sqkm || 0} sq. km
              </p>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Density: {(phc.population_density_per_sqkm || 0).toLocaleString()} / sq. km
              </span>
            </div>

            <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontWeight: '600' }}>MATERNAL & CHILD HEALTH</span>
              <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: '4px 0' }}>
                ANC Registered: {(phc.anc_registered || 0).toLocaleString()}
              </p>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span>• 4+ ANC Visits: {phc.anc_4plus_visits_pct || 0}%</span>
                <span>• Full Immunization: {phc.immunization_full_pct || 0}%</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontWeight: '600' }}>DELIVERY OUTCOMES</span>
              <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: '4px 0' }}>
                Inst. Deliveries: {phc.institutional_deliveries_pct || 0}%
              </p>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span>• PNC within 48h: {phc.pnc_within_48h_pct || 0}%</span>
                <span>• Skilled Attendance: {phc.skilled_birth_attendance_pct || 0}%</span>
                <span>• C-Section Rate: {phc.c_section_deliveries_pct || 0}%</span>
              </div>
            </div>
          </div>

          <div className="metrics-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontWeight: '600' }}>CHILD NUTRITION (UNDER 5)</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: 'var(--text-primary)', marginTop: '6px' }}>
                <div>Stunting: <strong style={{ color: 'var(--warning)' }}>{phc.stunting_under5_pct || 0}%</strong></div>
                <div>Wasting: <strong style={{ color: 'var(--danger)' }}>{phc.wasting_under5_pct || 0}%</strong></div>
                <div>Underweight: <strong>{phc.underweight_under5_pct || 0}%</strong></div>
                <div>Severe Wasting: <strong style={{ color: 'var(--danger)' }}>{phc.severe_wasting_under5_pct || 0}%</strong></div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontWeight: '600' }}>ANEMIA PREVALENCE</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: 'var(--text-primary)', marginTop: '6px' }}>
                <div>Children: <strong style={{ color: 'var(--danger)' }}>{phc.anemia_children_pct || 0}%</strong></div>
                <div>Women: <strong style={{ color: 'var(--danger)' }}>{phc.anemia_women_pct || 0}%</strong></div>
                <div>Men: <strong>{phc.anemia_men_pct || 0}%</strong></div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontWeight: '600' }}>STATE MMR LEVEL</span>
              <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--danger)', margin: '4px 0' }}>
                {phc.mmr_state_per_100k || 104}
              </p>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Maternal Mortality Ratio (per 100k live births)</span>
            </div>

            <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontWeight: '600' }}>URBAN / RURAL STATUS</span>
              <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)', margin: '4px 0' }}>
                {phc.urban_rural || 'Urban'}
              </p>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Administrative classification of this block</span>
            </div>
          </div>
        </div>

        {/* Section 6: Facilities Infrastructure */}
        <div className="phc-section-card" style={{ gridColumn: 'span 2' }}>
          <div className="phc-section-title">
            <FiPackage style={{ color: 'var(--primary)' }} size={20} />
            <h2>Healthcare Facilities Infrastructure</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL FACILITIES</span>
              <p style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0' }}>{phc.facilities_total || 0}</p>
              <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                <span style={{ color: 'var(--success)' }}>🟢 Functional: {phc.facilities_functional || 0}</span>
                <span style={{ color: 'var(--danger)' }}>🔴 Non-Func: {phc.facilities_non_functional || 0}</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontWeight: '600' }}>PRIMARY CENTERS (PHC)</span>
              <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '2px 0' }}>{phc.facilities_phc || 0}</p>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Primary Health Centers</span>
            </div>

            <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontWeight: '600' }}>COMMUNITY CENTERS (CHC)</span>
              <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '2px 0' }}>{phc.facilities_chc || 0}</p>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Community Health Centers</span>
            </div>

            <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontWeight: '600' }}>URBAN CENTERS (UHC)</span>
              <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '2px 0' }}>{phc.facilities_uhc || 0}</p>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Urban Health Centers</span>
            </div>

            <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontWeight: '600' }}>DISTRICT HOSPITALS</span>
              <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '2px 0' }}>{phc.facilities_district_hospital || 0}</p>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>State-run general hospitals</span>
            </div>

            <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontWeight: '600' }}>PRIVATE HOSPITALS</span>
              <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '2px 0' }}>{phc.facilities_private_hospital || 0}</p>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Registered private clinics</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PHCDetails;
