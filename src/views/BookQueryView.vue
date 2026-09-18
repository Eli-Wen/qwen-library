<template>
  <h1>Search Books</h1>
  <form @submit.prevent="searchBooks">
    <p><input v-model.number="minimumIsbn" type="number" placeholder="Minimum ISBN" required /></p>
    <p><button type="submit">Search</button></p>
  </form>

  <ul>
    <li v-for="book in books" :key="book.id">{{ book.isbn }} - {{ book.name }}</li>
  </ul>
</template>

<script setup>
import { ref } from 'vue'
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import db from '../firebase/init'

const minimumIsbn = ref(null)
const books = ref([])

const searchBooks = async () => {
  const booksQuery = query(
    collection(db, 'books'),
    where('isbn', '>=', minimumIsbn.value),
    orderBy('isbn', 'asc'),
    limit(5),
  )
  const snapshot = await getDocs(booksQuery)
  books.value = snapshot.docs.map((bookDoc) => ({ id: bookDoc.id, ...bookDoc.data() }))
}
</script>
