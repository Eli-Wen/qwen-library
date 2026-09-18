import './assets/main.css'
// import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: 'AIzaSyCYM0EeWdjq9xV06_8Rh0yDsiCsWWWLpnc',
  authDomain: 'fit5032-be4de.firebaseapp.com',
  projectId: 'fit5032-be4de',
  storageBucket: 'fit5032-be4de.firebasestorage.app',
  messagingSenderId: '858644711852',
  appId: '1:858644711852:web:3dc858a2ed5135d2031209',
}

initializeApp(firebaseConfig)

const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
})
app.use(router)

app.mount('#app')
