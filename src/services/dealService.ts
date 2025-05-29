import { 
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Deal, DealStage } from '../types/deal';
import { dealsCollection } from './firestore/collections';

const convertTimestampToISOString = (timestamp: Timestamp | string | null | undefined): string => {
  if (!timestamp) return new Date().toISOString();
  if (typeof timestamp === 'string') return timestamp;
  return timestamp.toDate().toISOString();
};

export const getDeals = async (): Promise<Deal[]> => {
  try {
    const snapshot = await getDocs(dealsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestampToISOString(doc.data().createdAt as Timestamp),
      updatedAt: convertTimestampToISOString(doc.data().updatedAt as Timestamp),
      expectedCloseDate: convertTimestampToISOString(doc.data().expectedCloseDate as Timestamp),
    } as Deal));
  } catch (error) {
    console.error('Error fetching deals:', error);
    throw error;
  }
};

const createDeal = async (dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> => {
  try {
    const docRef = await addDoc(dealsCollection, {
      ...dealData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      expectedCloseDate: Timestamp.fromDate(new Date(dealData.expectedCloseDate))
    });

    return {
      ...dealData,
      id: docRef.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error creating deal:', error);
    throw error;
  }
};

export const updateDealStage = async (id: string, stage: DealStage): Promise<Deal | null> => {
  try {
    const dealRef = doc(dealsCollection, id);
    await updateDoc(dealRef, {
      stage,
      updatedAt: serverTimestamp(),
    });

    const docSnap = await getDoc(dealRef);
    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: convertTimestampToISOString(data.createdAt as Timestamp),
      updatedAt: convertTimestampToISOString(data.updatedAt as Timestamp),
      expectedCloseDate: convertTimestampToISOString(data.expectedCloseDate as Timestamp),
    } as Deal;
  } catch (error) {
    console.error('Error updating deal stage:', error);
    throw error;
  }
};

const getDealById = async (id: string): Promise<Deal | null> => {
  try {
    const dealRef = doc(dealsCollection, id);
    const docSnap = await getDoc(dealRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: convertTimestampToISOString(data.createdAt as Timestamp),
      updatedAt: convertTimestampToISOString(data.updatedAt as Timestamp),
      expectedCloseDate: convertTimestampToISOString(data.expectedCloseDate as Timestamp),
    } as Deal;
  } catch (error) {
    console.error('Error fetching deal:', error);
    throw error;
  }
};