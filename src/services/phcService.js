import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore';

export const MOCK_PHCS = [
  {
    id: 'phc-1',
    name: 'Amberpet',
    districtId: 'district-1',
    totalBeds: 40,
    occupiedBeds: 28,
    totalDoctors: 8,
    presentDoctors: 7,
    todayFootfall: 180,
    highRisk: false,
    address: 'Amberpet, Hyderabad, Telangana',
    phone: '+91 40 2700 1122',
    status: 'active',
    state: 'Telangana',
    district: 'Hyderabad',
    sub_district: 'Amberpet',
    year: 2023,
    urban_rural: 'Urban',
    population_total: 410000,
    population_male: 210000,
    population_female: 200000,
    area_sqkm: 12.0,
    population_density_per_sqkm: 34167,
    anc_registered: 6200,
    anc_4plus_visits_pct: 78.5,
    institutional_deliveries_number: 5800,
    institutional_deliveries_pct: 99.0,
    pnc_within_48h_pct: 92.0,
    immunization_full_pct: 88.0,
    stunting_under5_pct: 26.0,
    wasting_under5_pct: 16.0,
    underweight_under5_pct: 27.0,
    severe_wasting_under5_pct: 3.5,
    anemia_children_pct: 62.0,
    anemia_women_pct: 54.0,
    anemia_men_pct: 18.0,
    facilities_total: 38,
    facilities_phc: 4,
    facilities_chc: 1,
    facilities_uhc: 6,
    facilities_district_hospital: 1,
    facilities_private_hospital: 20,
    facilities_functional: 35,
    facilities_non_functional: 3,
    mmr_state_per_100k: 104,
    skilled_birth_attendance_pct: 98.0,
    c_section_deliveries_pct: 58.0
  },
  {
    id: 'phc-2',
    name: 'Nampally',
    districtId: 'district-1',
    totalBeds: 50,
    occupiedBeds: 42,
    totalDoctors: 12,
    presentDoctors: 10,
    todayFootfall: 220,
    highRisk: false,
    address: 'Nampally, Hyderabad, Telangana',
    phone: '+91 40 2700 3344',
    status: 'active',
    state: 'Telangana',
    district: 'Hyderabad',
    sub_district: 'Nampally',
    year: 2023,
    urban_rural: 'Urban',
    population_total: 350000,
    population_male: 180000,
    population_female: 170000,
    area_sqkm: 9.0,
    population_density_per_sqkm: 38889,
    anc_registered: 5400,
    anc_4plus_visits_pct: 80.0,
    institutional_deliveries_number: 5100,
    institutional_deliveries_pct: 99.2,
    pnc_within_48h_pct: 93.0,
    immunization_full_pct: 89.0,
    stunting_under5_pct: 24.0,
    wasting_under5_pct: 15.0,
    underweight_under5_pct: 25.0,
    severe_wasting_under5_pct: 3.0,
    anemia_children_pct: 60.0,
    anemia_women_pct: 52.0,
    anemia_men_pct: 17.0,
    facilities_total: 34,
    facilities_phc: 3,
    facilities_chc: 1,
    facilities_uhc: 5,
    facilities_district_hospital: 1,
    facilities_private_hospital: 18,
    facilities_functional: 31,
    facilities_non_functional: 3,
    mmr_state_per_100k: 104,
    skilled_birth_attendance_pct: 98.5,
    c_section_deliveries_pct: 60.0
  },
  {
    id: 'phc-3',
    name: 'Charminar',
    districtId: 'district-1',
    totalBeds: 60,
    occupiedBeds: 55,
    totalDoctors: 15,
    presentDoctors: 11,
    todayFootfall: 310,
    highRisk: true,
    address: 'Charminar, Hyderabad, Telangana',
    phone: '+91 40 2700 5566',
    status: 'active',
    state: 'Telangana',
    district: 'Hyderabad',
    sub_district: 'Charminar',
    year: 2023,
    urban_rural: 'Urban',
    population_total: 470000,
    population_male: 240000,
    population_female: 230000,
    area_sqkm: 10.5,
    population_density_per_sqkm: 44762,
    anc_registered: 7000,
    anc_4plus_visits_pct: 76.0,
    institutional_deliveries_number: 6500,
    institutional_deliveries_pct: 98.5,
    pnc_within_48h_pct: 90.0,
    immunization_full_pct: 86.0,
    stunting_under5_pct: 29.0,
    wasting_under5_pct: 17.0,
    underweight_under5_pct: 30.0,
    severe_wasting_under5_pct: 4.0,
    anemia_children_pct: 64.0,
    anemia_women_pct: 56.0,
    anemia_men_pct: 19.0,
    facilities_total: 42,
    facilities_phc: 4,
    facilities_chc: 2,
    facilities_uhc: 7,
    facilities_district_hospital: 1,
    facilities_private_hospital: 24,
    facilities_functional: 38,
    facilities_non_functional: 4,
    mmr_state_per_100k: 104,
    skilled_birth_attendance_pct: 97.5,
    c_section_deliveries_pct: 61.0
  },
  {
    id: 'phc-4',
    name: 'Secunderabad',
    districtId: 'district-1',
    totalBeds: 80,
    occupiedBeds: 64,
    totalDoctors: 18,
    presentDoctors: 16,
    todayFootfall: 350,
    highRisk: false,
    address: 'Secunderabad, Hyderabad, Telangana',
    phone: '+91 40 2700 7788',
    status: 'active',
    state: 'Telangana',
    district: 'Hyderabad',
    sub_district: 'Secunderabad',
    year: 2023,
    urban_rural: 'Urban',
    population_total: 520000,
    population_male: 265000,
    population_female: 255000,
    area_sqkm: 14.0,
    population_density_per_sqkm: 37143,
    anc_registered: 7600,
    anc_4plus_visits_pct: 82.0,
    institutional_deliveries_number: 7200,
    institutional_deliveries_pct: 99.5,
    pnc_within_48h_pct: 94.0,
    immunization_full_pct: 91.0,
    stunting_under5_pct: 23.0,
    wasting_under5_pct: 14.0,
    underweight_under5_pct: 24.0,
    severe_wasting_under5_pct: 3.0,
    anemia_children_pct: 59.0,
    anemia_women_pct: 51.0,
    anemia_men_pct: 16.0,
    facilities_total: 46,
    facilities_phc: 5,
    facilities_chc: 2,
    facilities_uhc: 8,
    facilities_district_hospital: 1,
    facilities_private_hospital: 26,
    facilities_functional: 41,
    facilities_non_functional: 5,
    mmr_state_per_100k: 104,
    skilled_birth_attendance_pct: 99.0,
    c_section_deliveries_pct: 63.0
  },
  {
    id: 'phc-5',
    name: 'Kukatpally',
    districtId: 'district-1',
    totalBeds: 90,
    occupiedBeds: 82,
    totalDoctors: 20,
    presentDoctors: 18,
    todayFootfall: 420,
    highRisk: true,
    address: 'Kukatpally, Hyderabad, Telangana',
    phone: '+91 40 2700 9900',
    status: 'active',
    state: 'Telangana',
    district: 'Hyderabad',
    sub_district: 'Kukatpally',
    year: 2023,
    urban_rural: 'Urban',
    population_total: 600000,
    population_male: 305000,
    population_female: 295000,
    area_sqkm: 16.0,
    population_density_per_sqkm: 37500,
    anc_registered: 8800,
    anc_4plus_visits_pct: 81.0,
    institutional_deliveries_number: 8400,
    institutional_deliveries_pct: 99.3,
    pnc_within_48h_pct: 93.0,
    immunization_full_pct: 90.0,
    stunting_under5_pct: 22.0,
    wasting_under5_pct: 13.0,
    underweight_under5_pct: 23.0,
    severe_wasting_under5_pct: 2.8,
    anemia_children_pct: 58.0,
    anemia_women_pct: 50.0,
    anemia_men_pct: 15.0,
    facilities_total: 50,
    facilities_phc: 5,
    facilities_chc: 2,
    facilities_uhc: 9,
    facilities_district_hospital: 1,
    facilities_private_hospital: 30,
    facilities_functional: 44,
    facilities_non_functional: 6,
    mmr_state_per_100k: 104,
    skilled_birth_attendance_pct: 99.2,
    c_section_deliveries_pct: 65.0
  },
  {
    id: 'phc-6',
    name: 'L.B. Nagar',
    districtId: 'district-1',
    totalBeds: 70,
    occupiedBeds: 58,
    totalDoctors: 14,
    presentDoctors: 12,
    todayFootfall: 280,
    highRisk: false,
    address: 'L.B. Nagar, Hyderabad, Telangana',
    phone: '+91 40 2700 1234',
    status: 'active',
    state: 'Telangana',
    district: 'Hyderabad',
    sub_district: 'L.B. Nagar',
    year: 2023,
    urban_rural: 'Urban',
    population_total: 450000,
    population_male: 230000,
    population_female: 220000,
    area_sqkm: 18.0,
    population_density_per_sqkm: 25000,
    anc_registered: 6600,
    anc_4plus_visits_pct: 79.0,
    institutional_deliveries_number: 6200,
    institutional_deliveries_pct: 98.8,
    pnc_within_48h_pct: 92.0,
    immunization_full_pct: 88.0,
    stunting_under5_pct: 25.0,
    wasting_under5_pct: 15.0,
    underweight_under5_pct: 26.0,
    severe_wasting_under5_pct: 3.2,
    anemia_children_pct: 61.0,
    anemia_women_pct: 53.0,
    anemia_men_pct: 17.0,
    facilities_total: 37,
    facilities_phc: 4,
    facilities_chc: 1,
    facilities_uhc: 6,
    facilities_district_hospital: 1,
    facilities_private_hospital: 21,
    facilities_functional: 33,
    facilities_non_functional: 4,
    mmr_state_per_100k: 104,
    skilled_birth_attendance_pct: 98.2,
    c_section_deliveries_pct: 59.0
  },
  {
    id: 'phc-7',
    name: 'Serilingampalle',
    districtId: 'district-1',
    totalBeds: 85,
    occupiedBeds: 68,
    totalDoctors: 16,
    presentDoctors: 15,
    todayFootfall: 330,
    highRisk: false,
    address: 'Serilingampalle, Hyderabad, Telangana',
    phone: '+91 40 2700 5678',
    status: 'active',
    state: 'Telangana',
    district: 'Hyderabad',
    sub_district: 'Serilingampalle',
    year: 2023,
    urban_rural: 'Urban',
    population_total: 520000,
    population_male: 270000,
    population_female: 250000,
    area_sqkm: 22.0,
    population_density_per_sqkm: 23636,
    anc_registered: 7400,
    anc_4plus_visits_pct: 83.0,
    institutional_deliveries_number: 7000,
    institutional_deliveries_pct: 99.1,
    pnc_within_48h_pct: 94.0,
    immunization_full_pct: 92.0,
    stunting_under5_pct: 21.0,
    wasting_under5_pct: 12.0,
    underweight_under5_pct: 22.0,
    severe_wasting_under5_pct: 2.5,
    anemia_children_pct: 57.0,
    anemia_women_pct: 49.0,
    anemia_men_pct: 15.0,
    facilities_total: 44,
    facilities_phc: 4,
    facilities_chc: 2,
    facilities_uhc: 8,
    facilities_district_hospital: 1,
    facilities_private_hospital: 29,
    facilities_functional: 39,
    facilities_non_functional: 5,
    mmr_state_per_100k: 104,
    skilled_birth_attendance_pct: 99.0,
    c_section_deliveries_pct: 62.0
  },
  {
    id: 'phc-8',
    name: 'Hayathnagar',
    districtId: 'district-1',
    totalBeds: 35,
    occupiedBeds: 28,
    totalDoctors: 6,
    presentDoctors: 5,
    todayFootfall: 150,
    highRisk: false,
    address: 'Hayathnagar, Hyderabad, Telangana',
    phone: '+91 40 2700 9012',
    status: 'active',
    state: 'Telangana',
    district: 'Hyderabad',
    sub_district: 'Hayathnagar',
    year: 2023,
    urban_rural: 'Urban',
    population_total: 320000,
    population_male: 165000,
    population_female: 155000,
    area_sqkm: 20.0,
    population_density_per_sqkm: 16000,
    anc_registered: 4800,
    anc_4plus_visits_pct: 77.0,
    institutional_deliveries_number: 4500,
    institutional_deliveries_pct: 98.2,
    pnc_within_48h_pct: 91.0,
    immunization_full_pct: 87.0,
    stunting_under5_pct: 27.0,
    wasting_under5_pct: 16.0,
    underweight_under5_pct: 28.0,
    severe_wasting_under5_pct: 3.6,
    anemia_children_pct: 63.0,
    anemia_women_pct: 55.0,
    anemia_men_pct: 18.0,
    facilities_total: 30,
    facilities_phc: 3,
    facilities_chc: 1,
    facilities_uhc: 5,
    facilities_district_hospital: 1,
    facilities_private_hospital: 18,
    facilities_functional: 27,
    facilities_non_functional: 3,
    mmr_state_per_100k: 104,
    skilled_birth_attendance_pct: 97.8,
    c_section_deliveries_pct: 57.0
  },
  {
    id: 'phc-9',
    name: 'Shamirpet',
    districtId: 'district-1',
    totalBeds: 30,
    occupiedBeds: 25,
    totalDoctors: 6,
    presentDoctors: 4,
    todayFootfall: 120,
    highRisk: true,
    address: 'Shamirpet, Hyderabad, Telangana',
    phone: '+91 40 2700 3456',
    status: 'active',
    state: 'Telangana',
    district: 'Hyderabad',
    sub_district: 'Shamirpet',
    year: 2023,
    urban_rural: 'Rural',
    population_total: 180000,
    population_male: 92000,
    population_female: 88000,
    area_sqkm: 35.0,
    population_density_per_sqkm: 5143,
    anc_registered: 2600,
    anc_4plus_visits_pct: 72.0,
    institutional_deliveries_number: 2400,
    institutional_deliveries_pct: 96.5,
    pnc_within_48h_pct: 88.0,
    immunization_full_pct: 84.0,
    stunting_under5_pct: 31.0,
    wasting_under5_pct: 18.0,
    underweight_under5_pct: 32.0,
    severe_wasting_under5_pct: 4.2,
    anemia_children_pct: 66.0,
    anemia_women_pct: 58.0,
    anemia_men_pct: 20.0,
    facilities_total: 22,
    facilities_phc: 3,
    facilities_chc: 1,
    facilities_uhc: 3,
    facilities_district_hospital: 0,
    facilities_private_hospital: 15,
    facilities_functional: 19,
    facilities_non_functional: 3,
    mmr_state_per_100k: 104,
    skilled_birth_attendance_pct: 96.0,
    c_section_deliveries_pct: 40.0
  },
  {
    id: 'phc-10',
    name: 'Moinabad',
    districtId: 'district-1',
    totalBeds: 25,
    occupiedBeds: 22,
    totalDoctors: 5,
    presentDoctors: 3,
    todayFootfall: 95,
    highRisk: true,
    address: 'Moinabad, Hyderabad, Telangana',
    phone: '+91 40 2700 7890',
    status: 'active',
    state: 'Telangana',
    district: 'Hyderabad',
    sub_district: 'Moinabad',
    year: 2023,
    urban_rural: 'Rural',
    population_total: 150000,
    population_male: 77000,
    population_female: 73000,
    area_sqkm: 30.0,
    population_density_per_sqkm: 5000,
    anc_registered: 2200,
    anc_4plus_visits_pct: 70.0,
    institutional_deliveries_number: 2000,
    institutional_deliveries_pct: 95.8,
    pnc_within_48h_pct: 86.0,
    immunization_full_pct: 82.0,
    stunting_under5_pct: 32.0,
    wasting_under5_pct: 19.0,
    underweight_under5_pct: 33.0,
    severe_wasting_under5_pct: 4.5,
    anemia_children_pct: 67.0,
    anemia_women_pct: 59.0,
    anemia_men_pct: 21.0,
    facilities_total: 18,
    facilities_phc: 2,
    facilities_chc: 1,
    facilities_uhc: 2,
    facilities_district_hospital: 0,
    facilities_private_hospital: 13,
    facilities_functional: 13,
    facilities_non_functional: 2,
    mmr_state_per_100k: 104,
    skilled_birth_attendance_pct: 95.0,
    c_section_deliveries_pct: 35.0
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
