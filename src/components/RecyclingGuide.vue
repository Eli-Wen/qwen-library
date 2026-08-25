<script setup>
const guides = [
    {
        id: 1,
        item: 'Cardboard box',
        category: 'Sample household item',
        instruction: 'Sample instruction for checking the correct recycling option.'
    },
    {
        id: 2,
        item: 'Used battery',
        category: 'Sample special item',
        instruction: 'Sample instruction for checking a suitable drop-off service.'
    },
    {
        id: 3,
        item: 'Glass jar',
        category: 'Sample container',
        instruction: 'Check whether the jar can be placed in the appropriate recycling bin.'
    }

]
</script>

<template>
  <section class="guide-section">
    <h2>
        Recycling Guide
    </h2>
    <ul class="guide-list">
        <li v-for="guide in guides" :key="guide.id" class="guide-item">
            <h3>{{ guide.item }}</h3>
            <p class="guide-category">{{ guide.category }}</p>
            <p>{{ guide.instruction }}</p>
        </li>
    </ul>
  </section>
</template>

<style scoped>
.guide-section {
    width: 100%;

}

.guide-list {
    display: grid;
    gap: 1rem;
    padding: 0;
    margin: 1rem 0 0;
    list-style: none;

}

.guide-item {
    padding: 1rem;
    border: 1px solid #d5d5d5;
    border-radius: 0.6rem;
    background-color: #f8fbfa;

}

.guide-item h3 {
    margin: 0 0 0.5rem;
}

.guide-item p {
    margin: 0.4rem 0;
}

.guide-category {
    font-weight: 600;
    color: #2c3e50;
}

@media (min-width: 768px) {
    .guide-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>