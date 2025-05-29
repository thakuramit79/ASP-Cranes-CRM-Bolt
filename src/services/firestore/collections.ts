import { collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export const usersCollection = collection(db, 'users');
export const leadsCollection = collection(db, 'leads');
export const dealsCollection = collection(db, 'deals');
const customersCollection = collection(db, 'customers');
const quotationsCollection = collection(db, 'quotations');
const jobsCollection = collection(db, 'jobs');
export const equipmentCollection = collection(db, 'equipment');
const operatorsCollection = collection(db, 'operators');