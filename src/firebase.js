import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyB9pUM91EE6cO52GHLsGA2uGS_X5qkRygo",
  authDomain: "maasser-app.firebaseapp.com",
  projectId: "maasser-app",
  storageBucket: "maasser-app.firebasestorage.app",
  messagingSenderId: "591588212431",
  appId: "1:591588212431:web:7a37853109e1f0887181ba"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
