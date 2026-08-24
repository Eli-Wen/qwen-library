<script setup>
import { ref } from 'vue'

import RecyclingGuide from './components/RecyclingGuide.vue'
import RecyclingLocations from './components/RecyclingLocations.vue'
import RegisterForm from './components/RegisterForm.vue'

const activePage = ref('guide')
</script>

<template>
  <header>
    <h1>
      CircularLoop Melbourne
    </h1>
    <nav>
      <button @click="activePage = 'guide'">Guide</button>
      <button @click="activePage = 'locations'">Locations</button>
      <button @click="activePage = 'register'">Register</button>
    </nav>
  </header>

  <main>
      <RecyclingGuide v-if="activePage === 'guide'" />
      <RecyclingLocations v-if="activePage === 'locations'"/>
      <RegisterForm v-if="activePage === 'register'"/>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

/* .logo {
  display: block;
  margin: 0 auto 2rem;
} */

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }




}
</style>
