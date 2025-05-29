import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { setupInitialUsers } from '../services/firestore/setupUsers';

const firebaseConfig = {
  apiKey: "AIzaSyABVXrylOIescVfarC8WhtDcDvJa8bxDKU",
  authDomain: "ai-crm-database.firebaseapp.com",
  projectId: "ai-crm-database",
  storageBucket: "ai-crm-database.firebasestorage.app",
  messagingSenderId: "201042126488",
  appId: "1:201042126488:web:9c85da043d8db0686452ed"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Set up initial users
setupInitialUsers().catch(console.error);