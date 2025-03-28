
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDoD8BCnPp_Zj2cI9WnBmGQTYGbxuCToCc",
  authDomain: "adversify-platform.firebaseapp.com",
  projectId: "adversify-platform",
  storageBucket: "adversify-platform.appspot.com",
  messagingSenderId: "257721639264",
  appId: "1:257721639264:web:dcf43dc74e1d3507d54b0b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
