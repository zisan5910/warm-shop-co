import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD2vilOnqQ6BeI7j3bCUOB4BIsTE7YVKwE",
  authDomain: "e-commerce-i.firebaseapp.com",
  projectId: "e-commerce-i",
  storageBucket: "e-commerce-i.firebasestorage.app",
  messagingSenderId: "1079755621965",
  appId: "1:1079755621965:web:b73b2d16479095ff53fe04",
  measurementId: "G-GNG5FN29ZS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
