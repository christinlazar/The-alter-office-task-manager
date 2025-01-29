
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { saveUserData } from "../services/firebaseServices";

const firebaseConfig = {
  apiKey: "AIzaSyCHme1Yv5tPoPRUS07DJDfhCUH2zS8sauI",
  authDomain: "task-manager-c3e38.firebaseapp.com",
  projectId: "task-manager-c3e38",
  storageBucket: "task-manager-c3e38.firebasestorage.app",
  messagingSenderId: "83520359947",
  appId: "1:83520359947:web:5bd2296c7aace6e1b0810e",
  measurementId: "G-CBB253HWBE"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
const db = getFirestore(app)

const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("User signed in:", result.user);
      if(result?.user){
      const res = await saveUserData(result.user)  
      return res
      }
      return result.user;
    } catch (error) {
      console.error("Error signing in:", error);
    }
};
  
  const logOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  export { auth, signInWithGoogle, logOut,db };