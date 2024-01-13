// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD1290W91FjeJ9TFNIch7fyKE6mYw-T2To",
  authDomain: "react-firebase-sample-ef9f2.firebaseapp.com",
  projectId: "react-firebase-sample-ef9f2",
  storageBucket: "react-firebase-sample-ef9f2.appspot.com",
  messagingSenderId: "178324751896",
  appId: "1:178324751896:web:61690d2a3a324a348ae56d",
  measurementId: "G-KXCD4J7D98",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export type documentType = "profiles" | "posts";
