<template>
  <h1>Sign in</h1>
  <p><input v-model="email" type="text" placeholder="Email" /></p>
  <p><input v-model="password" type="password" placeholder="Password" /></p>
  <p><button @click="signin">Sign in via Firebase</button></p>
</template>

<script setup>
import { ref } from 'vue'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const router = useRouter()
const auth = getAuth()
const db = getFirestore()

const signin = () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(async (userCredential) => {
      const userProfile = await getDoc(doc(db, 'users', userCredential.user.uid))
      const role = userProfile.data()?.role

      console.log('Firebase Sign in Successful!')
      console.log('Signed in role:', role)
      router.push('/')
      console.log(auth.currentUser)
    })
    .catch((error) => {
      console.log(error.code)
    })
}
</script>
