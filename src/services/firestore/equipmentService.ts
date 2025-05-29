import { 
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Equipment } from '../../types/equipment';
import { equipmentCollection } from './collections';

export const getEquipment = async (): Promise<Equipment[]> => {
  try {
    const snapshot = await getDocs(equipmentCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp).toDate().toISOString(),
      updatedAt: (doc.data().updatedAt as Timestamp).toDate().toISOString(),
    } as Equipment));
  } catch (error) {
    console.error('Error fetching equipment:', error);
    throw error;
  }
};

export const createEquipment = async (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Equipment> => {
  try {
    const docRef = await addDoc(equipmentCollection, {
      ...equipment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      ...equipment,
      id: docRef.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error creating equipment:', error);
    throw error;
  }
};

export const updateEquipment = async (id: string, updates: Partial<Equipment>): Promise<Equipment> => {
  try {
    const equipmentRef = doc(db, 'equipment', id);
    await updateDoc(equipmentRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return {
      id,
      ...updates,
      updatedAt: new Date().toISOString(),
    } as Equipment;
  } catch (error) {
    console.error('Error updating equipment:', error);
    throw error;
  }
};

export const deleteEquipment = async (id: string): Promise<void> => {
  try {
    const equipmentRef = doc(db, 'equipment', id);
    await deleteDoc(equipmentRef);
  } catch (error) {
    console.error('Error deleting equipment:', error);
    throw error;
  }
};