<script setup>
defineEmits(["navigate"])
</script>

<template>
  <section class="home-hero" aria-labelledby="home-title">
    <div class="hero-copy">
      <p class="eyebrow">CircularLoop Melbourne</p>
      <h2 id="home-title">Make your next recycling decision with confidence.</h2>
      <p class="hero-description">
        Start with a simple guide, then find a recycling facility to check before you go.
      </p>
      <div class="hero-actions">
        <button type="button" class="primary-action" @click="$emit('navigate', 'locations')">Find a location</button>
        <button type="button" class="secondary-action" @click="$emit('navigate', 'guide')">How to recycle</button>
      </div>
    </div>
    <aside class="hero-note" aria-label="How CircularLoop helps">
      <p class="note-label">A simpler recycling routine</p>
      <ol>
        <li>Check the item guidance.</li>
        <li>Search for a nearby facility.</li>
        <li>Confirm details with the facility before visiting.</li>
      </ol>
    </aside>
  </section>

  <section class="next-steps" aria-labelledby="next-steps-title">
    <div>
      <p class="eyebrow">Start here</p>
      <h2 id="next-steps-title">Two helpful ways to begin</h2>
    </div>
    <div class="step-grid">
      <article class="step-card">
        <p class="step-number">01</p>
        <h3>Not sure what to do with an item?</h3>
        <p>Use the guide for a clear starting point before you sort or travel.</p>
        <button type="button" class="text-action" @click="$emit('navigate', 'guide')">Open the guide <span aria-hidden="true">→</span></button>
      </article>
      <article class="step-card">
        <p class="step-number">02</p>
        <h3>Ready to find a facility?</h3>
        <p>Search by suburb, facility name or service type across Victoria.</p>
        <button type="button" class="text-action" @click="$emit('navigate', 'locations')">Search locations <span aria-hidden="true">→</span></button>
      </article>
    </div>
  </section>
</template>

<style scoped>
.home-hero { display:grid; grid-template-columns:minmax(0,1.35fr) minmax(18rem,.65fr); gap:var(--space-6); align-items:stretch; padding:clamp(2rem,5vw,4.5rem); border-radius:var(--radius-lg); background:var(--color-brand); color:var(--color-surface); box-shadow:var(--shadow-card); }
.hero-copy { max-width:46rem; }
.eyebrow,.note-label,.step-number { margin:0 0 var(--space-2); color:var(--color-accent); font-size:.8rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }
.home-hero h2 { max-width:14ch; margin:0; color:var(--color-surface); font-size:clamp(2.35rem,5vw,4.6rem); line-height:.98; letter-spacing:-.06em; }
.hero-description { max-width:39rem; margin:var(--space-4) 0 0; color:#dceee3; font-size:1.1rem; line-height:1.6; }
.hero-actions { display:flex; flex-wrap:wrap; gap:var(--space-3); margin-top:var(--space-5); }
.primary-action,.secondary-action { border-radius:999px; padding:.85rem 1.15rem; font:inherit; font-weight:800; cursor:pointer; }
.primary-action { border:1px solid var(--color-accent); background:var(--color-accent); color:var(--color-brand-strong); }
.secondary-action { border:1px solid rgba(255,255,255,.55); background:transparent; color:var(--color-surface); }
.hero-note { align-self:end; padding:var(--space-4); border:1px solid rgba(255,255,255,.2); border-radius:var(--radius-md); background:rgba(255,255,255,.08); }
.hero-note ol { display:grid; gap:var(--space-3); margin:0; padding-left:1.25rem; line-height:1.45; }
.next-steps { display:grid; gap:var(--space-4); padding-top:var(--space-3); }
.next-steps h2 { margin:0; font-size:clamp(1.8rem,3vw,2.5rem); letter-spacing:-.04em; }
.step-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:var(--space-4); }
.step-card { padding:var(--space-5); border:1px solid var(--color-border); border-radius:var(--radius-md); background:var(--color-surface); box-shadow:var(--shadow-card); }
.step-card h3 { margin:0; font-size:1.35rem; letter-spacing:-.03em; }
.step-card p:not(.step-number) { margin:var(--space-2) 0 var(--space-4); color:var(--color-text-muted); line-height:1.55; }
.text-action { padding:0; border:0; background:transparent; color:var(--color-brand); font:inherit; font-weight:800; cursor:pointer; text-decoration:underline; text-underline-offset:.25em; }
button:focus-visible { outline:3px solid var(--color-accent); outline-offset:3px; }
@media (max-width:767px) { .home-hero,.step-grid { grid-template-columns:1fr; } .home-hero { padding:var(--space-5); } }
</style>
