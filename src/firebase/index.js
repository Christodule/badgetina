

import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'

export const REALTIME_DB_URL = 'https://drbarbeccu-default-rtdb.firebaseio.com'
export const AUTH_LOGIN_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDXIGMFxchSqrxz0h63Teus0A9W0I_Yp1U`
export const AUTH_REGISTER_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDXIGMFxchSqrxz0h63Teus0A9W0I_Yp1U`

const firebaseConfig = {
  apiKey: "AIzaSyDXIGMFxchSqrxz0h63Teus0A9W0I_Yp1U",
  authDomain: "drbarbeccu.firebaseapp.com",
  databaseURL: "https://drbarbeccu-default-rtdb.firebaseio.com",
  projectId: "drbarbeccu",
  storageBucket: "drbarbeccu.appspot.com",
  messagingSenderId: "165833672097",
  appId: "1:165833672097:web:ceb3caabe212451d82f7e0",
  measurementId: "G-0S0JMKV9XL"
}

const app = initializeApp(firebaseConfig)

export const db = getDatabase(app)
export const storage = getStorage(app)
