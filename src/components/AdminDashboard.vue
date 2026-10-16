<script setup>
import { onMounted, ref } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import InteractiveDataTable from './InteractiveDataTable.vue'

const users = ref([])
const loading = ref(true)
const errorMessage = ref('')
const userColumns = [
  { key: 'displayName', label: 'Name', value: (user) => user.displayName },
  { key: 'email', label: 'Email', value: (user) => user.email },
  { key: 'role', label: 'Role', value: (user) => user.role }
]

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
  errorMessage.value = 'We could not load account details right now. Please try again.'
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

      <InteractiveDataTable
        :columns="userColumns"
        :rows="users"
        empty-message="No registered accounts match those filters."
      />
    </template>
  </section>
</template>

<style scoped>
.admin-dashboard { width:100%; }

.user-count {
  font-weight: 600;
}

.error-message {
  color: var(--color-danger);
}
</style>
