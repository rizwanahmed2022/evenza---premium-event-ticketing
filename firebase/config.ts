
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCSJYoD_Gx-n8UkvIc_MaBWO82rU0A7Lu4",
  authDomain: "eventmagsystem.firebaseapp.com",
  projectId: "eventmagsystem",
  storageBucket: "eventmagsystem.firebasestorage.app",
  messagingSenderId: "410265349052",
  appId: "1:410265349052:web:e428b9c7b573453a6e59b9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
