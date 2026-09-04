<script setup lang="ts">
import BHeader from './components/BHeader.vue'
</script>

<template>
  <div class="main-container">
    <header>
      <BHeader />
    </header>

    <main class="main-box container mt-5">
      <router-view></router-view>
    </main>
  </div>
</template>
