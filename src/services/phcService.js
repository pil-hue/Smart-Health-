import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore';

export const MOCK_PHCS = [
  {
    id: 'phc-1',
    name: 'Green Valley Primary Health Center',
    districtId: 'district-1',
    totalBeds: 30,
    occupiedBeds: 24,
    totalDoctors: 6,
    presentDoctors: 5,
    todayFootfall: 145,
    highRisk: true,
    address: '12 Valleyside Road, Green Valley',
    phone: '+1 (555) 019-2834',
    status: 'active'
  },
  {
    id: 'phc-2',
    name: 'Metro Medical Care PHC',
    districtId: 'district-1',
    totalBeds: 50,
    occupiedBeds: 18,
    totalDoctors: 12,
    presentDoctors: 10,
    todayFootfall: 290,
    highRisk: false,
    address: '88 Broadway Street, City Center',
    phone: '+1 (555) 019-5678',
    status: 'active'
  },
  {
    id: 'phc-3',
    name: 'Hill View Clinic PHC',
    districtId: 'district-1',
    totalBeds: 15,
    occupiedBeds: 13,
    totalDoctors: 4,
    presentDoctors: 2,
    todayFootfall: 68,
    highRisk: true,
    address: 'Pine Ridge Summit, Hill Town',
    phone: '+1 (555) 019-9012',
    status: 'active'
  },
  {
    id: 'phc-4',
    name: 'Ocean Breeze PHC',
    districtId: 'district-2',
    totalBeds: 20,
    occupiedBeds: 8,
    totalDoctors: 5,
    presentDoctors: 5,
    todayFootfall: 95,
    highRisk: false,
    address: '45 Coastline Drive, Bayview',
    phone: '+1 (555) 019-3456',
    status: 'active'
  },
  {
    id: 'phc-5',
    name: 'Desert Oasis PHC',
    districtId: 'district-3',
    totalBeds: 25,
    occupiedBeds: 22,
    totalDoctors: 6,
    presentDoctors: 4,
    todayFootfall: 110,
    highRisk: false,
    address: '77 Sand Dune Ave, Oasis Town',
    phone: '+1 (555) 019-7890',
    status: 'active'
  }
];

/**
 * Fetch all PHCs or PHCs within a specific district.
 */
export const getPHCs = async (districtId = null) => {
  try {
    let q = collection(db, 'phcs');
    if (districtId) {
      q = query(q, where('districtId', '==', districtId));
    }
    const querySnapshot = await getDocs(q);
    const phcs = [];
    querySnapshot.forEach((doc) => {
      phcs.push({ id: doc.id, ...doc.data() });
    });
    
    if (phcs.length > 0) return phcs;
    
    return districtId 
      ? MOCK_PHCS.filter(p => p.districtId === districtId) 
      : MOCK_PHCS;
  } catch (error) {
    console.warn("Firestore 'phcs' fetch failed, using mock data:", error);
    return districtId 
      ? MOCK_PHCS.filter(p => p.districtId === districtId) 
      : MOCK_PHCS;
  }
};

/**
 * Fetch details of a single PHC.
 */
export const getPHCById = async (id) => {
  try {
    const docRef = doc(db, 'phcs', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    const mock = MOCK_PHCS.find(p => p.id === id);
    if (mock) return mock;
    throw new Error('PHC not found');
  } catch (error) {
    console.warn(`Firestore 'phc' fetch for id ${id} failed, using mock data:`, error);
    const mock = MOCK_PHCS.find(p => p.id === id);
    if (mock) return mock;
    throw error;
  }
};

/**
 * Subscribe to real-time updates for PHCs.
 */
export const subscribePHCs = (districtId = null, onNext, onError) => {
  let q = collection(db, 'phcs');
  if (districtId) {
    q = query(q, where('districtId', '==', districtId));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const phcs = [];
      snapshot.forEach((doc) => {
        phcs.push({ id: doc.id, ...doc.data() });
      });
      if (phcs.length > 0) {
        onNext(phcs);
      } else {
        onNext(districtId ? MOCK_PHCS.filter(p => p.districtId === districtId) : MOCK_PHCS);
      }
    },
    (error) => {
      console.warn("Firestore 'phcs' subscription failed, using mock data:", error);
      onNext(districtId ? MOCK_PHCS.filter(p => p.districtId === districtId) : MOCK_PHCS);
      if (onError) onError(error);
    }
  );
};

/**
 * Subscribe to real-time updates for a single PHC.
 */
export const subscribePHCById = (id, onNext, onError) => {
  const docRef = doc(db, 'phcs', id);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onNext({ id: docSnap.id, ...docSnap.data() });
      } else {
        const mock = MOCK_PHCS.find(p => p.id === id);
        if (mock) {
          onNext(mock);
        } else {
          if (onError) onError(new Error('PHC not found'));
        }
      }
    },
    (error) => {
      console.warn(`Firestore 'phcs' item ${id} subscription failed, using mock data:`, error);
      const mock = MOCK_PHCS.find(p => p.id === id);
      if (mock) {
        onNext(mock);
      } else {
        if (onError) onError(error);
      }
    }
  );
};
