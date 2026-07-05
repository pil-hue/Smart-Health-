import { db } from '../firebase';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';

export const MOCK_ALERTS = [
  {
    id: 'alert-1',
    phcId: 'phc-1',
    phcName: 'Green Valley Primary Health Center',
    type: 'critical',
    title: 'Insulin Stock Exhausted',
    description: 'Insulin Glargine has run out. 5 patients currently depend on daily administration.',
    time: '2026-07-05T09:15:00Z',
    resolved: false
  },
  {
    id: 'alert-2',
    phcId: 'phc-1',
    phcName: 'Green Valley Primary Health Center',
    type: 'warning',
    title: 'Amoxicillin Stock Low',
    description: 'Amoxicillin 250mg is below the safety threshold of 200 units (currently 80 remaining).',
    time: '2026-07-05T10:30:00Z',
    resolved: false
  },
  {
    id: 'alert-3',
    phcId: 'phc-3',
    phcName: 'Hill View Clinic PHC',
    type: 'critical',
    title: 'Doctor Absence Alert',
    description: 'Dr. Raj Singh is absent today without coverage. Bed occupancy is high at 86%.',
    time: '2026-07-05T08:00:00Z',
    resolved: false
  },
  {
    id: 'alert-4',
    phcId: 'phc-2',
    phcName: 'Metro Medical Care PHC',
    type: 'info',
    title: 'Outpatient Footfall Surge',
    description: 'Daily footfall is at 90% of capacity. Pharmacy lines are experiencing minor delays.',
    time: '2026-07-05T12:00:00Z',
    resolved: false
  }
];

/**
 * Fetch all alerts or alerts for a specific PHC.
 */
export const getAlerts = async (phcId = null) => {
  try {
    let q = collection(db, 'alerts');
    if (phcId) {
      q = query(q, where('phcId', '==', phcId));
    }
    const querySnapshot = await getDocs(q);
    const alerts = [];
    querySnapshot.forEach((doc) => {
      alerts.push({ id: doc.id, ...doc.data() });
    });
    
    if (alerts.length > 0) return alerts;
    
    return phcId 
      ? MOCK_ALERTS.filter(a => a.phcId === phcId) 
      : MOCK_ALERTS;
  } catch (error) {
    console.warn("Firestore 'alerts' fetch failed, using mock data:", error);
    return phcId 
      ? MOCK_ALERTS.filter(a => a.phcId === phcId) 
      : MOCK_ALERTS;
  }
};

/**
 * Subscribe to real-time updates for alerts.
 */
export const subscribeAlerts = (phcId = null, onNext, onError) => {
  let q = collection(db, 'alerts');
  if (phcId) {
    q = query(q, where('phcId', '==', phcId));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const alerts = [];
      snapshot.forEach((doc) => {
        alerts.push({ id: doc.id, ...doc.data() });
      });
      if (alerts.length > 0) {
        onNext(alerts);
      } else {
        onNext(phcId ? MOCK_ALERTS.filter(a => a.phcId === phcId) : MOCK_ALERTS);
      }
    },
    (error) => {
      console.warn("Firestore 'alerts' subscription failed, using mock data:", error);
      onNext(phcId ? MOCK_ALERTS.filter(a => a.phcId === phcId) : MOCK_ALERTS);
      if (onError) onError(error);
    }
  );
};
