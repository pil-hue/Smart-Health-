import { db } from '../firebase';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';

const DEFAULT_MOCK_STOCK = [
  { name: 'Paracetamol 500mg', category: 'Analgesics', available: 1500, minRequired: 500 },
  { name: 'Amoxicillin 250mg', category: 'Antibiotics', available: 120, minRequired: 300 },
  { name: 'Insulin Glargine', category: 'Hormones', available: 8, minRequired: 30 },
  { name: 'Oral Rehydration Salts', category: 'Rehydration', available: 800, minRequired: 400 },
  { name: 'Amlodipine 5mg', category: 'Cardiovascular', available: 600, minRequired: 200 },
  { name: 'Ibuprofen 400mg', category: 'NSAIDs', available: 40, minRequired: 150 }
];

const getMockStockForPhc = (phcId) => {
  // Generate structured inventory based on phcId
  return DEFAULT_MOCK_STOCK.map((item, idx) => {
    let avail = item.available;
    // Add variations based on phcId values to make things interesting
    if (phcId === 'phc-1') {
      if (idx === 1) avail = 80;        // Amoxicillin Low
      if (idx === 2) avail = 0;         // Insulin Out of Stock
      if (idx === 5) avail = 250;       // Ibuprofen Good
    } else if (phcId === 'phc-3') {
      if (idx === 0) avail = 120;       // Paracetamol Low
      if (idx === 4) avail = 15;        // Amlodipine Low
    }
    
    let status = 'Good';
    if (avail === 0) {
      status = 'Out of Stock';
    } else if (avail < item.minRequired) {
      status = 'Low';
    }

    return {
      id: `stock-${phcId}-${idx}`,
      phcId,
      name: item.name,
      category: item.category,
      available: avail,
      minRequired: item.minRequired,
      status
    };
  });
};

/**
 * Fetch medicine stock for a specific PHC.
 */
export const getStockByPHC = async (phcId) => {
  try {
    const q = query(collection(db, 'stock'), where('phcId', '==', phcId));
    const querySnapshot = await getDocs(q);
    const stockItems = [];
    querySnapshot.forEach((doc) => {
      stockItems.push({ id: doc.id, ...doc.data() });
    });
    return stockItems.length > 0 ? stockItems : getMockStockForPhc(phcId);
  } catch (error) {
    console.warn(`Firestore 'stock' fetch failed for PHC ${phcId}, using mock data:`, error);
    return getMockStockForPhc(phcId);
  }
};

/**
 * Subscribe to real-time stock updates for a specific PHC.
 */
export const subscribeStockByPHC = (phcId, onNext, onError) => {
  const q = query(collection(db, 'stock'), where('phcId', '==', phcId));

  return onSnapshot(
    q,
    (snapshot) => {
      const stockItems = [];
      snapshot.forEach((doc) => {
        stockItems.push({ id: doc.id, ...doc.data() });
      });
      if (stockItems.length > 0) {
        onNext(stockItems);
      } else {
        onNext(getMockStockForPhc(phcId));
      }
    },
    (error) => {
      console.warn(`Firestore 'stock' subscription failed for PHC ${phcId}, using mock data:`, error);
      onNext(getMockStockForPhc(phcId));
      if (onError) onError(error);
    }
  );
};
