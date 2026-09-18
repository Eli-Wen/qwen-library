<template>
  <h1>Firebase Logout</h1>
  <p><button @click="logout">Log out</button></p>
  <p v-if="message">{{ message }}</p>
</template>

<script setup>
import { ref } from 'vue'
import { getAuth, signOut } from 'firebase/auth'

const auth = getAuth()
const message = ref('')

const logout = () => {
  signOut(auth)
    .then(() => {
      message.value = 'Signed out successfully.'
      console.log(auth.currentUser)
    })
    .catch((error) => {
      console.log(error.code)
    })
}
</script>
