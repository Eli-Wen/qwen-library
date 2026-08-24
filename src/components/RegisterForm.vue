<script setup>
import { ref } from 'vue'

const fullName = ref('')
const email = ref('')
const errors =ref([])
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
    <section>
        <h2>
            Register Form
        </h2>

        <form @submit.prevent="registerUser">
            <div>
                <label for="fullName">Full name</label>
                <input id="fullName" v-model="fullName" type="text">
            </div>

            <div>
                <label for="email">Email address</label>
                <input id="email" v-model="email" type="email">
            </div>

            <button type="submit">Submit</button>

        </form>

        <ul v-if="errors.length > 0">
            <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>

        <p v-if="successMessage">
            {{ successMessage }}
        </p>
    </section>
</template>