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
    <section class="locations-section">
        <h2>
            Recycling Locations
        </h2>
        <ul class="location-list">
            <li v-for="location in locations" :key="location.id" class="location-item">
                <h3>{{ location.name }}</h3>
                <p>{{ location.suburb }}</p>
                <p>{{ location.acceptedItems }}</p>

            </li>
        </ul>
    </section>
</template>

<style scoped>
.locations-section {
  width: 100%;
}

.location-list {
  display: grid;
  gap: 1rem;
  padding: 0;
  margin: 1rem 0 0;
  list-style: none;
}

.location-item {
  padding: 1rem;
  border: 1px solid #d5d5d5;
  border-radius: 0.6rem;
  background-color: #f8fbfa;
}

.location-item h3 {
  margin: 0 0 0.6rem;
}

.location-item p {
  margin: 0.4rem 0;
}

@media (min-width: 768px) {
  .location-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>