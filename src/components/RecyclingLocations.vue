<script setup>
const locations = [
    {
        id: 1,
        name: 'Sample Recycling Hub',
        suburb: 'Melbourne',
        acceptedItems: 'Paper, cardboard and glass'
    },
    {
        id: 2,
        name: 'Sample Battery Drop-off Point',
        suburb: 'North Melbourne',
        acceptedItems: 'Used household batteries'
    }
]
</script>

<template>
    <section>
        <h2>
            Recycling Locations
        </h2>
        <ul>
            <li v-for="location in locations" :key="location.id">
                <h3>{{ location.name }}</h3>
                <p>{{ location.suburb }}</p>
                <p>{{ location.acceptedItems }}</p>

            </li>
        </ul>
    </section>
</template>