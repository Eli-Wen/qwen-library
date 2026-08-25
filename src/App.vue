<script setup>
import { ref } from "vue";

import RecyclingGuide from "./components/RecyclingGuide.vue";
import RecyclingLocations from "./components/RecyclingLocations.vue";
import RegisterForm from "./components/RegisterForm.vue";

const activePage = ref("guide");
</script>

<template>
  <header class="site-header">
    <h1 class="site-title">CircularLoop Melbourne</h1>

    <nav class="site-nav" aria-label="Main navigation">
      <button @click="activePage = 'guide'">Guide</button>
      <button @click="activePage = 'locations'">Locations</button>
      <button @click="activePage = 'register'">Register</button>
    </nav>
  </header>

  <main class="page-content">
    <RecyclingGuide v-if="activePage === 'guide'" />
    <RecyclingLocations v-if="activePage === 'locations'" />
    <RegisterForm v-if="activePage === 'register'" />
  </main>
</template>

<style scoped>
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
}

.site-title {
  margin: 0;
  font-size: clamp(1.6rem, 4vw, 2.8rem);
}

.site-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.site-nav button {
  padding: 0.6rem 1rem;
  border: 1px solid #999;
  border-radius: 0.4rem;
  background-color: white;
  cursor: pointer;
}

.site-nav button:hover {
  background-color: #e6f4ef;
}

.page-content {
  padding: 1.5rem 0;
}

@media (max-width: 767px) {
  .site-header {
    flex-direction: column;
    align-items: stretch;
  }

  .site-title {
    text-align: center;
  }

  .site-nav {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .site-nav button {
    width: 100%;
  }
}

@media (max-width: 575px) {
  .site-nav {
    grid-template-columns: 1fr;
  }

  .page-content {
    padding-top: 1rem;
  }
}

@media (min-width: 768px) {
  .site-header {
    flex-direction: row;
    align-items: center;
  }

  .site-nav {
    flex-wrap: nowrap;
  }

  .page-content {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
  }
}
</style>
