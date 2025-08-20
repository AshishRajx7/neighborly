// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyAMTZMxzYlfaZM4TixbDpz4NJJ0pL4_Siw",
  authDomain: "neighborly-7afaa.firebaseapp.com",
  projectId: "neighborly-7afaa",
  storageBucket: "neighborly-7afaa.firebasestorage.app",
  messagingSenderId: "523945512124",
  appId: "1:523945512124:web:d70af573c99018c0d554b9"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore database
export const db = getFirestore(app);
export const auth = getAuth(app);