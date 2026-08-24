<script setup>
const guides = [
    {
        id: 1,
        item: 'Carboard box',
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
  <section>
    <h2>
        Recycling Guide
    </h2>
    <ul>
        <li v-for="guide in guides" :key="guide.id">
            <h3>{{ guide.item }}</h3>
            <p>{{ guide.category }}</p>
            <p>{{ guide.instruction }}</p>
        </li>
    </ul>
  </section>
</template>