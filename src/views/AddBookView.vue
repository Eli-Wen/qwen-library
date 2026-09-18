<template>
  <h1>Add Book</h1>
  <form @submit.prevent="addBook">
    <p><input v-model.number="isbn" type="number" placeholder="ISBN" required /></p>
    <p><input v-model="name" type="text" placeholder="Book name" required /></p>
    <p><button type="submit">Add Book</button></p>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { addDoc, collection } from 'firebase/firestore'
import db from '../firebase/init'

const isbn = ref(null)
const name = ref('')

const addBook = async () => {
  await addDoc(collection(db, 'books'), {
    isbn: isbn.value,
    name: name.value,
  })
}
</script>
