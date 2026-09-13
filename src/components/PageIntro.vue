<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
})
</script>

<template>
  <section class="page-intro">
    <p class="page-label">{{ label }}</p>
    <p class="page-description">{{ description }}</p>
  </section>
</template>

<style scoped>
.page-intro {
  padding: 1.25rem 1.5rem;
  border-left: 4px solid #2f7d62;
  border-radius: 0.6rem;
  background-color: #eef7f2;
}

.page-label {
  margin: 0 0 0.35rem;
  color: #1f5d48;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-description {
  max-width: 48rem;
  margin: 0;
  color: #284538;
  line-height: 1.6;
}
</style>