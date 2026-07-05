import { db } from '../firebase';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';

const DEFAULT_STAFF = [
  { name: 'Dr. Sarah Jenkins', role: 'Doctor (CMO)' },
  { name: 'Dr. Amit Patel', role: 'Doctor (Pediatrician)' },
  { name: 'Dr. Sophia Loren', role: 'Doctor (General Physician)' },
  { name: 'Dr. Raj Singh', role: 'Doctor (Surgeon)' },
  { name: 'Nurse Priya Sharma', role: 'Head Nurse' },
  { name: 'Nurse Jessica Taylor', role: 'Staff Nurse' },
  { name: 'Pharmacist John Doe', role: 'Chief Pharmacist' },
  { name: 'Lab Tech Robert Chen', role: 'Lab Technician' }
];

const getMockAttendanceForPhc = (phcId) => {
  // Let's create a realistic attendance list based on PHC capacity/stats
  // e.g. phc-1 has 6 doctors total, 5 present. phc-3 has 4 doctors total, 2 present.
  let staffList = [...DEFAULT_STAFF];
  
  if (phcId === 'phc-3') {
    // Hill View Clinic - smaller staff
    staffList = staffList.slice(0, 5);
  }

  return staffList.map((person, idx) => {
    let status = 'Present';
    let checkIn = '08:30 AM';
    
    // Create status patterns based on phcId
    if (phcId === 'phc-1' && person.name === 'Dr. Raj Singh') {
      status = 'Absent';
      checkIn = '-';
    } else if (phcId === 'phc-3') {
      if (idx === 1) {
        status = 'Absent';
        checkIn = '-';
      }
      if (idx === 3) {
        status = 'On Leave';
        checkIn = '-';
      }
    } else if (phcId === 'phc-5' && idx === 2) {
      status = 'Absent';
      checkIn = '-';
    }

    return {
      id: `att-${phcId}-${idx}`,
      phcId,
      staffName: person.name,
      role: person.role,
      status,
      checkInTime: checkIn,
      date: new Date().toISOString().split('T')[0]
    };
  });
};

/**
 * Fetch staff attendance for a specific PHC.
 */
export const getAttendanceByPHC = async (phcId) => {
  try {
    const q = query(collection(db, 'attendance'), where('phcId', '==', phcId));
    const querySnapshot = await getDocs(q);
    const attendanceItems = [];
    querySnapshot.forEach((doc) => {
      attendanceItems.push({ id: doc.id, ...doc.data() });
    });
    return attendanceItems.length > 0 ? attendanceItems : getMockAttendanceForPhc(phcId);
  } catch (error) {
    console.warn(`Firestore 'attendance' fetch failed for PHC ${phcId}, using mock data:`, error);
    return getMockAttendanceForPhc(phcId);
  }
};

/**
 * Subscribe to real-time staff attendance for a specific PHC.
 */
export const subscribeAttendanceByPHC = (phcId, onNext, onError) => {
  const q = query(collection(db, 'attendance'), where('phcId', '==', phcId));

  return onSnapshot(
    q,
    (snapshot) => {
      const attendanceItems = [];
      snapshot.forEach((doc) => {
        attendanceItems.push({ id: doc.id, ...doc.data() });
      });
      if (snapshot.size > 0) {
        onNext(attendanceItems);
      } else {
        onNext(getMockAttendanceForPhc(phcId));
      }
    },
    (error) => {
      console.warn(`Firestore 'attendance' subscription failed for PHC ${phcId}, using mock data:`, error);
      onNext(getMockAttendanceForPhc(phcId));
      if (onError) onError(error);
    }
  );
};
