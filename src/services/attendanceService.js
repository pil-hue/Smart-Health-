import { db } from '../firebase';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';

const DEFAULT_NURSES = [
  { name: 'Nurse Priya Sharma', role: 'Head Nurse' },
  { name: 'Nurse Jessica Taylor', role: 'Staff Nurse' },
  { name: 'Pharmacist John Doe', role: 'Chief Pharmacist' },
  { name: 'Lab Tech Robert Chen', role: 'Lab Technician' }
];

const getMockAttendanceForPhc = (phcId) => {
  let totalD = 8;
  let presentD = 7;
  
  if (phcId === 'phc-2') { totalD = 12; presentD = 10; }
  else if (phcId === 'phc-3') { totalD = 15; presentD = 11; }
  else if (phcId === 'phc-4') { totalD = 18; presentD = 16; }
  else if (phcId === 'phc-5') { totalD = 20; presentD = 18; }
  else if (phcId === 'phc-6') { totalD = 14; presentD = 12; }
  else if (phcId === 'phc-7') { totalD = 16; presentD = 15; }
  else if (phcId === 'phc-8') { totalD = 6;  presentD = 5; }
  else if (phcId === 'phc-9') { totalD = 6;  presentD = 4; }
  else if (phcId === 'phc-10') { totalD = 5; presentD = 3; }

  const firstNames = ['Sarah', 'Amit', 'Sophia', 'Raj', 'Ramesh', 'Priya', 'David', 'Anita', 'Syeda', 'Asif', 'Vikram', 'George', 'Kavitha', 'John', 'Preeti', 'Janardhan', 'Radhika', 'Sridhar', 'Srinivas', 'Venkat', 'Lakshmi', 'Ravindra', 'Shashi', 'Angela', 'Jim', 'Michael', 'Robert', 'Archana', 'Rakesh', 'Sandhya', 'Hari', 'Raghav', 'Swathi', 'Rajesh', 'Shilpa', 'Yadagiri', 'Anuradha', 'Shekhar', 'Swapna', 'Kishore', 'Deepika', 'Kiran', 'Nisha', 'Vijay', 'Divya'];
  const lastNames = ['Jenkins', 'Patel', 'Loren', 'Singh', 'Kumar', 'Nair', 'Miller', 'Desai', 'Fatima', 'Ali', 'Reddy', 'Ghouse', 'Rao', 'Kutty', 'Smith', 'Sharma', 'Vance', 'Halpert', 'Scott', 'Martin', 'Prasad', 'Chawla', 'Mehta', 'Joshi', 'Gupta', 'Verma', 'Kapoor', 'Sen', 'Dutta'];
  const roles = ['Doctor (General Physician)', 'Doctor (Pediatrician)', 'Doctor (Surgeon)', 'Doctor (CMO)'];

  const doctorsList = [];
  const facilitySeed = parseInt(phcId.replace('phc-', '')) || 1;

  for (let i = 0; i < totalD; i++) {
    const fIdx = (i + facilitySeed * 7) % firstNames.length;
    const lIdx = (i * 2 + facilitySeed * 11) % lastNames.length;
    const roleIdx = i % roles.length;
    
    const name = `Dr. ${firstNames[fIdx]} ${lastNames[lIdx]}`;
    const role = i === 0 ? 'Doctor (CMO)' : roles[roleIdx];
    
    let status = 'Present';
    let checkIn = '08:30 AM';
    
    if (i >= presentD) {
      status = (i % 2 === 0) ? 'On Leave' : 'Absent';
      checkIn = '-';
    }

    doctorsList.push({
      staffName: name,
      role,
      status,
      checkInTime: checkIn
    });
  }

  const staffList = [...doctorsList, ...DEFAULT_NURSES];

  return staffList.map((person, idx) => {
    return {
      id: `att-${phcId}-${idx}`,
      phcId,
      staffName: person.staffName,
      role: person.role,
      status: person.status,
      checkInTime: person.checkInTime,
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
