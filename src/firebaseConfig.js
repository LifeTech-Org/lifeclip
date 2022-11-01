// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDq2fooS6gVcAgxn59bOhBLQ_YksdD_GWE",
  authDomain: "lifeclip-51f96.firebaseapp.com",
  projectId: "lifeclip-51f96",
  storageBucket: "lifeclip-51f96.appspot.com",
  messagingSenderId: "635303428871",
  appId: "1:635303428871:web:f19f17cf8128e9eb143ba2",
  measurementId: "G-MPXG5D6N0N",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, provider, db };
