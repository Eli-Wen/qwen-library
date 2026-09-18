<template>
  <h1>Create an Account</h1>
  <p><input v-model="email" type="text" placeholder="Email" /></p>
  <p><input v-model="password" type="password" placeholder="Password" /></p>
  <p>
    <select v-model="role">
      <option value="member">Member</option>
      <option value="admin">Admin</option>
    </select>
  </p>
  <p><button @click="register">Save to Firebase</button></p>
</template>

<script setup>
import { ref } from 'vue'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import db from '../firebase/init'

const email = ref('')
const password = ref('')
const role = ref('member')
const router = useRouter()
const auth = getAuth()

const register = () => {
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
      return setDoc(doc(db, 'users', userCredential.user.uid), {
        email: email.value,
        role: role.value,
      })
    })
    .then(() => {
      console.log('Firebase Register Successful')
      router.push('/FireLogin')
    })
    .catch((error) => {
      console.log(error.code)
    })
}
</script>
