import { db } from '../firebase';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';

const MOCK_DISTRICTS = [
  { id: 'district-1', name: 'Hyderabad' },
  { id: 'district-2', name: 'Rangareddy' },
  { id: 'district-3', name: 'Medchal-Malkajgiri' }
];

/**
 * Fetch all districts.
 * Falls back to mock data if Firestore is empty or fails.
 */
export const getDistricts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'districts'));
    const districts = [];
    querySnapshot.forEach((doc) => {
      districts.push({ id: doc.id, ...doc.data() });
    });
    return districts.length > 0 ? districts : MOCK_DISTRICTS;
  } catch (error) {
    console.warn("Firestore 'districts' fetch failed, using mock data:", error);
    return MOCK_DISTRICTS;
  }
};

/**
 * Subscribe to real-time updates for all districts.
 * Returns an unsubscribe function.
 */
export const subscribeDistricts = (onNext, onError) => {
  const collectionRef = collection(db, 'districts');
  
  return onSnapshot(
    collectionRef,
    (snapshot) => {
      const districts = [];
      snapshot.forEach((doc) => {
        districts.push({ id: doc.id, ...doc.data() });
      });
      if (districts.length > 0) {
        onNext(districts);
      } else {
        onNext(MOCK_DISTRICTS);
      }
    },
    (error) => {
      console.warn("Firestore 'districts' subscription failed, using mock data:", error);
      onNext(MOCK_DISTRICTS);
      if (onError) onError(error);
    }
  );
};
