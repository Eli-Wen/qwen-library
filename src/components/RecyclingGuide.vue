<script setup>
const guides = [
    {
        id: 1,
        item: 'Cardboard box',
        category: 'Paper and cardboard',
        instruction: 'Remove food, flatten the box and keep it dry before placing it in mixed recycling. Check your council’s rules for any exceptions.',
        sourceUrl: 'https://www.environment.vic.gov.au/household-waste-recycling/sort-waste-recycling'
    },
    {
        id: 2,
        item: 'Used battery',
        category: 'Battery drop-off',
        instruction: 'Do not put batteries in any household bin. Tape exposed terminals and take them to a battery recycling drop-off point; check B-cycle or your local council for locations.',
        sourceUrl: 'https://www.environment.vic.gov.au/household-waste-recycling/ewaste'
    },
    {
        id: 3,
        item: 'Glass jar',
        category: 'Glass bottles and jars',
        instruction: 'Empty the jar and rinse if needed. Use a glass-only bin where available; otherwise use mixed recycling. Check your council’s rules for lids.',
        sourceUrl: 'https://www.environment.vic.gov.au/household-waste-recycling/sort-waste-recycling'
    },
    {
        id: 4,
        item: 'Old phone',
        category: 'Electronic waste',
        instruction: 'Do not put phones in any household bin. Take them to an e-waste drop-off point and check your council’s accepted items before visiting.',
        sourceUrl: 'https://www.environment.vic.gov.au/household-waste-recycling/ewaste'
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
            <a :href="guide.sourceUrl" target="_blank" rel="noopener noreferrer">Source: Victorian Government</a>
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
