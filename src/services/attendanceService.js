import { db } from '../firebase';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';

const DOCTOR_NAMES_BY_PHC = {
  'phc-1': [
    { name: 'Dr. Sarah Jenkins', role: 'Doctor (CMO)' },
    { name: 'Dr. Amit Patel', role: 'Doctor (Pediatrician)' },
    { name: 'Dr. Sophia Loren', role: 'Doctor (General Physician)' },
    { name: 'Dr. Raj Singh', role: 'Doctor (Surgeon)' }
  ],
  'phc-2': [
    { name: 'Dr. Ramesh Kumar', role: 'Doctor (CMO)' },
    { name: 'Dr. Priya Nair', role: 'Doctor (Pediatrician)' },
    { name: 'Dr. David Miller', role: 'Doctor (General Physician)' },
    { name: 'Dr. Anita Desai', role: 'Doctor (Surgeon)' }
  ],
  'phc-3': [
    { name: 'Dr. Syeda Fatima', role: 'Doctor (CMO)' },
    { name: 'Dr. Asif Ali', role: 'Doctor (Pediatrician)' },
    { name: 'Dr. Vikram Reddy', role: 'Doctor (General Physician)' },
    { name: 'Dr. Mohammed Ghouse', role: 'Doctor (Surgeon)' }
  ],
  'phc-4': [
    { name: 'Dr. John Smith', role: 'Doctor (CMO)' },
    { name: 'Dr. Kavitha Rao', role: 'Doctor (Pediatrician)' },
    { name: 'Dr. George Kutty', role: 'Doctor (General Physician)' },
    { name: 'Dr. Preeti Sharma', role: 'Doctor (Surgeon)' }
  ],
  'phc-5': [
    { name: 'Dr. N. Janardhan', role: 'Doctor (CMO)' },
    { name: 'Dr. B. Radhika', role: 'Doctor (Pediatrician)' },
    { name: 'Dr. M. Sridhar', role: 'Doctor (General Physician)' },
    { name: 'Dr. K. Srinivas', role: 'Doctor (Surgeon)' }
  ],
  'phc-6': [
    { name: 'Dr. T. Venkat', role: 'Doctor (CMO)' },
    { name: 'Dr. G. Lakshmi', role: 'Doctor (Pediatrician)' },
    { name: 'Dr. P. Ravindra', role: 'Doctor (General Physician)' },
    { name: 'Dr. S. Shashi', role: 'Doctor (Surgeon)' }
  ],
  'phc-7': [
    { name: 'Dr. Robert Vance', role: 'Doctor (CMO)' },
    { name: 'Dr. Angela Martin', role: 'Doctor (Pediatrician)' },
    { name: 'Dr. Jim Halpert', role: 'Doctor (General Physician)' },
    { name: 'Dr. Michael Scott', role: 'Doctor (Surgeon)' }
  ],
  'phc-8': [
    { name: 'Dr. Hari Prasad', role: 'Doctor (CMO)' },
    { name: 'Dr. V. Sandhya', role: 'Doctor (Pediatrician)' },
    { name: 'Dr. N. Rakesh', role: 'Doctor (General Physician)' },
    { name: 'Dr. G. Archana', role: 'Doctor (Surgeon)' }
  ],
  'phc-9': [
    { name: 'Dr. K. Raghav', role: 'Doctor (CMO)' },
    { name: 'Dr. M. Swathi', role: 'Doctor (Pediatrician)' },
    { name: 'Dr. D. Rajesh', role: 'Doctor (General Physician)' },
    { name: 'Dr. P. Shilpa', role: 'Doctor (Surgeon)' }
  ],
  'phc-10': [
    { name: 'Dr. B. Yadagiri', role: 'Doctor (CMO)' },
    { name: 'Dr. C. Anuradha', role: 'Doctor (Pediatrician)' },
    { name: 'Dr. M. Shekhar', role: 'Doctor (General Physician)' },
    { name: 'Dr. J. Swapna', role: 'Doctor (Surgeon)' }
  ]
};

const DEFAULT_NURSES = [
  { name: 'Nurse Priya Sharma', role: 'Head Nurse' },
  { name: 'Nurse Jessica Taylor', role: 'Staff Nurse' },
  { name: 'Pharmacist John Doe', role: 'Chief Pharmacist' },
  { name: 'Lab Tech Robert Chen', role: 'Lab Technician' }
];

const getMockAttendanceForPhc = (phcId) => {
  const customDoctors = DOCTOR_NAMES_BY_PHC[phcId] || DOCTOR_NAMES_BY_PHC['phc-1'];
  let staffList = [...customDoctors, ...DEFAULT_NURSES];
  
  if (phcId === 'phc-3') {
    staffList = staffList.slice(0, 5);
  }

  return staffList.map((person, idx) => {
    let status = 'Present';
    let checkIn = '08:30 AM';
    
    // Vary checks based on index
    if (idx === 3) {
      status = 'Absent';
      checkIn = '-';
    } else if (idx === 2 && (phcId === 'phc-3' || phcId === 'phc-5' || phcId === 'phc-9' || phcId === 'phc-10')) {
      status = 'Absent';
      checkIn = '-';
    } else if (idx === 1 && phcId === 'phc-10') {
      status = 'On Leave';
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
