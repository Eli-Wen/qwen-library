<script setup>
import { ref } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

const email = ref('')
const password = ref('')
const errors = ref([])
const successMessage = ref('')

async function loginUser() {
    errors.value = []
    successMessage.value = ''

    if (email.value.trim() === '') {
        errors.value.push('Please enter your email address.')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        errors.value.push('Please enter a valid email address.')
    }

    if (password.value === '') {
        errors.value.push('Please enter your password.')
    }

    if (errors.value.length > 0) {
        return
    }

    try {
        await signInWithEmailAndPassword(
            auth,
            email.value.trim(),
            password.value
        )

        successMessage.value = 'Login successful.'
        password.value = ''
    } catch (error) {
        errors.value.push('Email address or password is incorrect.')
    }
}
</script>

<template>
    <section class="form-section">
        <h2>Login</h2>

        <form class="login-form" @submit.prevent="loginUser" novalidate>
            <div class="form-field">
                <label for="loginEmail">Email address</label>
                <input
                    id="loginEmail"
                    v-model="email"
                    type="email"
                    autocomplete="email"
                >
            </div>

            <div class="form-field">
                <label for="loginPassword">Password</label>
                <input
                    id="loginPassword"
                    v-model="password"
                    type="password"
                    autocomplete="current-password"
                >
            </div>

            <button type="submit">Login</button>
        </form>

        <ul v-if="errors.length > 0" class="error-list" aria-live="polite">
            <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>

        <p v-if="successMessage" class="success-message" aria-live="polite">
            {{ successMessage }}
        </p>
    </section>
</template>

<style scoped>
.form-section {
    width: 100%;
    max-width: 32rem;
}

.login-form {
    display: grid;
    gap: 1rem;
}

.form-field {
    display: grid;
    gap: 0.35rem;
}

.form-field input {
    width: 100%;
    padding: 0.65rem;
    font-size: 1rem;
}

.login-form button {
    width: fit-content;
    padding: 0.6rem 1rem;
    cursor: pointer;
}

.error-list {
    color: #a12626;
    padding-left: 1.2rem;
}

.success-message {
    color: #176b3a;
}
</style>