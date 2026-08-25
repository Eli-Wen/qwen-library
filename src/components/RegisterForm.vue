<script setup>
import { ref } from 'vue'

const fullName = ref('')
const email = ref('')
const errors = ref([])
const successMessage = ref('')

function registerUser(){
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

    if(errors.value.length === 0){
        successMessage.value = 'Registration completed successfully.'
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
