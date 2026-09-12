<script setup>
import { ref } from 'vue'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

const fullName = ref('')
const email = ref('')
const password = ref('')
const errors = ref([])
const successMessage = ref('')

async function registerUser(){
    errors.value = []
    successMessage.value = ''

    if(fullName.value.trim() === ''){
        errors.value.push('Please enter your full name.')

    }

    if(email.value.trim() === ''){
        errors.value.push('Please enter your email address.')

    }else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)){
        errors.value.push('Please enter a valid email address.')
    }

    if (password.value.length < 6) {
        errors.value.push('Password must contain at least 6 characters.')
    }

    if (errors.value.length > 0) {
        return
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email.value.trim(),
            password.value
        )

        await updateProfile(userCredential.user, {
            displayName: fullName.value.trim()
        })

        await setDoc(doc(db, 'users', userCredential.user.uid), {
            displayName: fullName.value.trim(),
            email: userCredential.user.email,
            role: 'user',
            createdAt: serverTimestamp()
        })

        successMessage.value = 'Registration completed successfully.'
        fullName.value = ''
        email.value = ''
        password.value = ''
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            errors.value.push('This email address is already registered.')
        } else {
            errors.value.push('Registration failed. Please try again.')
        }
    }

}

</script>

<template>
    <section class="form-section">
        <h2>
            Register Form
        </h2>

        <form
            class="register-form"
        @submit.prevent="registerUser"
        novalidate>
            <div class="form-field">
                <label for="fullName">Full name</label>
                <input id="fullName" v-model="fullName" type="text">
            </div>

            <div class="form-field">
                <label for="email">Email address</label>
                <input id="email" v-model="email" type="email">
            </div>

            <div class="form-field">
                <label for="password">Password</label>
                <input
                    id="password"
                    v-model="password"
                    type="password"
                    autocomplete="new-password"
                >
            </div>


            <button type="submit">Submit</button>

        </form>

        <ul v-if="errors.length > 0" class="error-list">
            <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>

        <p v-if="successMessage" class="success-message">
            {{ successMessage }}
        </p>
    </section>
</template>

<style scoped>
.form-section {
    width: 100%;
    max-width: 32rem;
}

.register-form {
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

.register-form button {
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
