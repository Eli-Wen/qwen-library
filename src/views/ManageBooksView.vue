<template>
  <h1>Manage Books</h1>
  <p><button type="button" @click="loadBooks">Load Books</button></p>
  <p v-if="message">{{ message }}</p>

  <div v-for="book in books" :key="book.id">
    <p>ISBN: {{ book.isbn }}</p>
    <p><input v-model="book.name" type="text" /></p>
    <p>
      <button type="button" @click="updateBook(book)">Update</button>
      <button type="button" @click="deleteBook(book.id)">Delete</button>
    </p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore'
import db from '../firebase/init'

const books = ref([])
const message = ref('')

const loadBooks = async () => {
  const snapshot = await getDocs(collection(db, 'books'))
  books.value = snapshot.docs.map((bookDoc) => ({ id: bookDoc.id, ...bookDoc.data() }))
}

const updateBook = async (book) => {
  await updateDoc(doc(db, 'books', book.id), { name: book.name })
  message.value = 'Book updated successfully.'
}

const deleteBook = async (id) => {
  await deleteDoc(doc(db, 'books', id))
  books.value = books.value.filter((book) => book.id !== id)
  message.value = 'Book deleted successfully.'
}

onMounted(loadBooks)
</script>
