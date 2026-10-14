<template>
  <footer class="site-footer">
    <p class="footer-title">CircularLoop Melbourne</p>
    <p>Recycling guidance, location ratings and protected account access.</p>
  </footer>
</template>

<style scoped>
.site-footer {
  width: min(var(--content-width), calc(100% - (var(--page-gutter) * 2)));
  margin: 0 auto;
  padding: var(--space-5) 0 var(--space-6);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.site-footer p {
  margin: var(--space-1) 0;
}

.footer-title {
  color: var(--color-ink);
  font-weight: 800;
}
</style>
