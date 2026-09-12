<script setup>
import { computed, ref, watch } from 'vue'
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc
} from 'firebase/firestore'
import { db } from '../firebase'

const props = defineProps({
  currentUser: {
    type: Object,
    default: null
  }
})

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

const searchTerm = ref('')
const ratingsByLocation = ref({})
const selectedScores = ref({})
const feedbackByLocation = ref({})

const filteredLocations = computed(() => {
  const keyword = searchTerm.value.trim().toLowerCase()

  if (keyword === '') {
    return locations
  }

  return locations.filter((location) => {
    return [
      location.name,
      location.suburb,
      location.acceptedItems
    ].some((value) => value.toLowerCase().includes(keyword))
  })
})

async function loadRatings() {
  const summaries = {}
  const userScores = {}

  for (const location of locations) {
    const ratingSnapshot = await getDocs(
      collection(db, 'locationRatings', String(location.id), 'ratings')
    )

    const scores = ratingSnapshot.docs.map((ratingDocument) => {
      return ratingDocument.data().score
    })

    summaries[location.id] = {
      count: scores.length,
      average: scores.length === 0
        ? null
        : scores.reduce((total, score) => total + score, 0) / scores.length
    }

    const currentUserRating = ratingSnapshot.docs.find((ratingDocument) => {
      return ratingDocument.id === props.currentUser.uid
    })

    if (currentUserRating) {
      userScores[location.id] = currentUserRating.data().score
    }
  }

  ratingsByLocation.value = summaries
  selectedScores.value = userScores
}

function ratingSummary(locationId) {
  const summary = ratingsByLocation.value[locationId]

  if (!summary || summary.count === 0) {
    return 'No ratings yet.'
  }

  const ratingLabel = summary.count === 1 ? 'rating' : 'ratings'

  return `Average rating: ${summary.average.toFixed(1)} / 5 from ${summary.count} ${ratingLabel}.`
}

async function submitRating(locationId) {
  const selectedScore = selectedScores.value[locationId]

  if (!selectedScore) {
    feedbackByLocation.value[locationId] = {
      type: 'error',
      message: 'Please select a rating from 1 to 5.'
    }
    return
  }

  try {
    await setDoc(
      doc(
        db,
        'locationRatings',
        String(locationId),
        'ratings',
        props.currentUser.uid
      ),
      {
        score: Number(selectedScore),
        updatedAt: serverTimestamp()
      }
    )

    feedbackByLocation.value[locationId] = {
      type: 'success',
      message: 'Your rating has been saved.'
    }

    await loadRatings()
  } catch (error) {
    feedbackByLocation.value[locationId] = {
      type: 'error',
      message: 'Your rating could not be saved. Please try again.'
    }
  }
}

watch(
  () => props.currentUser?.uid,
  async (userId) => {
    ratingsByLocation.value = {}
    selectedScores.value = {}
    feedbackByLocation.value = {}

    if (userId) {
      await loadRatings()
    }
  },
  { immediate: true }
)
</script>

<template>
  <section class="locations-section">
    <h2>Recycling Locations</h2>

    <div class="location-search">
      <label for="locationSearch">
        Search by name, suburb or accepted item
      </label>

      <input
        id="locationSearch"
        v-model="searchTerm"
        type="search"
        placeholder="e.g. battery"
      >
    </div>

    <ul class="location-list">
      <li
        v-for="location in filteredLocations"
        :key="location.id"
        class="location-item"
      >
        <h3>{{ location.name }}</h3>
        <p>{{ location.suburb }}</p>
        <p>{{ location.acceptedItems }}</p>

        <div v-if="currentUser" class="rating-panel">
          <p class="rating-summary">{{ ratingSummary(location.id) }}</p>

          <fieldset class="rating-options">
            <legend>Rate this location</legend>

            <label v-for="score in [1, 2, 3, 4, 5]" :key="score">
              <input
                v-model="selectedScores[location.id]"
                :name="`rating-${location.id}`"
                :value="score"
                type="radio"
              >
              {{ score }}
            </label>
          </fieldset>

          <button type="button" @click="submitRating(location.id)">
            Submit rating
          </button>

          <p
            v-if="feedbackByLocation[location.id]"
            :class="feedbackByLocation[location.id].type"
            aria-live="polite"
          >
            {{ feedbackByLocation[location.id].message }}
          </p>
        </div>

        <p v-else class="sign-in-message">
          Sign in to view and submit ratings.
        </p>
      </li>
    </ul>

    <p v-if="filteredLocations.length === 0" class="no-results">
      No matching recycling locations found.
    </p>
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

.location-search {
  display: grid;
  gap: 0.35rem;
  margin: 1rem 0;
}

.location-search input {
  width: 100%;
  max-width: 32rem;
  padding: 0.65rem;
  font-size: 1rem;
}

.rating-panel {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #d5d5d5;
}

.rating-summary {
  font-weight: 600;
}

.rating-options {
  display: flex;
  gap: 0.65rem;
  margin: 0.8rem 0;
  padding: 0;
  border: 0;
}

.rating-options label {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.rating-panel button {
  padding: 0.6rem 1rem;
  cursor: pointer;
}

.success {
  color: #176b3a;
}

.error,
.no-results {
  color: #a12626;
}

.sign-in-message {
  font-style: italic;
}

@media (min-width: 768px) {
  .location-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>