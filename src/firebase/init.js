import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCYM0EeWdjq9xV06_8Rh0yDsiCsWWWLpnc',
  authDomain: 'fit5032-be4de.firebaseapp.com',
  projectId: 'fit5032-be4de',
  storageBucket: 'fit5032-be4de.firebasestorage.app',
  messagingSenderId: '858644711852',
  appId: '1:858644711852:web:3dc858a2ed5135d2031209',
}

initializeApp(firebaseConfig)

const db = getFirestore()

export default db
