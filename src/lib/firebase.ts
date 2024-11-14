import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCPnLaHxSkBvluh0FGfC-biSeLEgTI1xNc",
  authDomain: "turistapp-86c6d.firebaseapp.com",
  projectId: "turistapp-86c6d",
  storageBucket: "turistapp-86c6d.appspot.com",
  messagingSenderId: "777661481241",
  appId: "1:777661481241:web:7b3a1b2402da539f384588"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Create root storage reference
const storageRef = ref(storage);

// Add metadata for CORS
const metadata = {
  customMetadata: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }
};

export { auth, db, storage, storageRef, metadata };