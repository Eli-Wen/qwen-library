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
  padding: clamp(1.5rem, 3vw, 2.5rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(125deg, var(--color-surface) 15%, var(--color-surface-muted));
  box-shadow: var(--shadow-card);
}

.page-label {
  margin: 0 0 var(--space-2);
  color: var(--color-brand);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.page-description {
  max-width: 44rem;
  margin: 0;
  color: var(--color-ink);
  font-size: clamp(1.25rem, 2.2vw, 1.7rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.3;
}
</style>
