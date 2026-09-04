<template>
  <div class="row">
    <div class="col-md-6 offset-md-3">
      <h1 class="text-center">Member Login</h1>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="login-username" class="form-label">Username</label>
          <input
            id="login-username"
            v-model="username"
            type="text"
            class="form-control"
            required
          />
        </div>

        <div class="mb-3">
          <label for="login-password" class="form-label">Password</label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            class="form-control"
            required
          />
        </div>

        <div class="text-center">
          <button type="submit" class="btn btn-primary">Login</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../auth'

const username = ref('')
const password = ref('')
const router = useRouter()

const handleLogin = () => {
  if (login(username.value, password.value)) {
    router.push('/about')
  } else {
    router.push('/access-denied')
  }
}
</script>
