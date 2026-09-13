<script setup>
import { onMounted, ref } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

const users = ref([])
const loading = ref(true)
const errorMessage = ref('')

async function loadUsers() {
  loading.value = true
  errorMessage.value = ''

  try {
    const userSnapshot = await getDocs(collection(db, 'users'))

    users.value = userSnapshot.docs
      .map((userDocument) => {
        const user = userDocument.data()

        return {
          id: userDocument.id,
          displayName: user.displayName,
          email: user.email,
          role: user.role
        }
      })
      .sort((firstUser, secondUser) => {
        return firstUser.displayName.localeCompare(secondUser.displayName)
      })
  } catch (error) {
    errorMessage.value = 'User data could not be loaded.'
  } finally {
    loading.value = false
  }
}

onMounted(loadUsers)
</script>

<template>
  <section class="admin-dashboard">
    <h2>Admin Dashboard</h2>
    <p>Registered user accounts and assigned roles.</p>

    <p v-if="loading" aria-live="polite">
      Loading user accounts...
    </p>

    <p v-else-if="errorMessage" class="error-message" aria-live="polite">
      {{ errorMessage }}
    </p>

    <template v-else>
      <p class="user-count">
        {{ users.length }} registered user{{ users.length === 1 ? '' : 's' }}.
      </p>

      <ul class="user-list">
        <li v-for="user in users" :key="user.id" class="user-item">
          <h3>{{ user.displayName }}</h3>
          <p>{{ user.email }}</p>
          <p>
            Role:
            <span class="role-label">{{ user.role }}</span>
          </p>
        </li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
.admin-dashboard {
  width: 100%;
  max-width: 900px;
  padding: 1.5rem;
  border: 1px solid #d5d5d5;
  border-radius: 0.6rem;
  background-color: #f8fbfa;
}

.user-count {
  font-weight: 600;
}

.user-list {
  display: grid;
  gap: 0.8rem;
  padding: 0;
  margin: 1rem 0 0;
  list-style: none;
}

.user-item {
  padding: 1rem;
  border: 1px solid #d5d5d5;
  border-radius: 0.4rem;
  background-color: white;
}

.user-item h3,
.user-item p {
  margin: 0.35rem 0;
}

.role-label {
  font-weight: 600;
  text-transform: capitalize;
}

.error-message {
  color: #a12626;
}

@media (min-width: 768px) {
  .user-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>