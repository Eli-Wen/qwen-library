<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const DATASET_URL = "https://discover.data.vic.gov.au/api/3/action/datastore_search?resource_id=e44f5d96-51e8-48ec-b674-299d100a0231&limit=700";

const props = defineProps({ currentUser: { type: Object, default: null } });
const searchTerm = ref("");
const selectedSuburb = ref("");
const selectedType = ref("");
const locations = ref([]);
const loading = ref(true);
const loadError = ref(false);
const selectedLocation = ref(null);
const ratingSummary = ref(null);
const selectedScore = ref(null);
const ratingFeedback = ref(null);

function readField(record, field) {
  return String(record[field] || "").trim();
}

function normaliseLocation(record) {
  return {
    id: String(record._id),
    name: readField(record, "Facility Name") || "Unnamed facility",
    address: readField(record, "Address"),
    suburb: readField(record, "Suburb"),
    localArea: readField(record, "LGA"),
    operator: readField(record, "Owner"),
    type: readField(record, "Infrastructure Type") || readField(record, "Type")
  };
}

const suburbs = computed(() => [...new Set(locations.value.map((location) => location.suburb).filter(Boolean))].sort());
const facilityTypes = computed(() => [...new Set(locations.value.map((location) => location.type).filter(Boolean))].sort());
const filteredLocations = computed(() => {
  const keyword = searchTerm.value.trim().toLowerCase();
  return locations.value.filter((location) => {
    const matchesSearch = !keyword || [location.name, location.address, location.suburb, location.localArea, location.operator, location.type]
      .some((value) => value.toLowerCase().includes(keyword));
    const matchesSuburb = !selectedSuburb.value || location.suburb === selectedSuburb.value;
    const matchesType = !selectedType.value || location.type === selectedType.value;
    return matchesSearch && matchesSuburb && matchesType;
  });
});

async function loadLocations() {
  loading.value = true;
  loadError.value = false;
  try {
    const response = await fetch(DATASET_URL);
    if (!response.ok) throw new Error("Locations request failed");
    const payload = await response.json();
    locations.value = (payload.result?.records || []).map(normaliseLocation).filter((location) => location.id && location.name);
  } catch (error) {
    locations.value = [];
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

function selectLocation(location) {
  selectedLocation.value = location;
  selectedScore.value = null;
  ratingFeedback.value = null;
  loadRating(location.id);
}

async function loadRating(locationId) {
  ratingSummary.value = null;
  if (!locationId || !props.currentUser) return;
  try {
    const ratingSnapshot = await getDocs(collection(db, "locationRatings", locationId, "ratings"));
    const scores = ratingSnapshot.docs.map((rating) => Number(rating.data().score)).filter((score) => Number.isFinite(score));
    const currentUserRating = ratingSnapshot.docs.find((rating) => rating.id === props.currentUser.uid);
    ratingSummary.value = scores.length ? { count: scores.length, average: scores.reduce((total, score) => total + score, 0) / scores.length } : { count: 0, average: null };
    selectedScore.value = currentUserRating ? Number(currentUserRating.data().score) : null;
  } catch (error) {
    ratingSummary.value = null;
  }
}

async function submitRating() {
  if (!selectedScore.value) {
    ratingFeedback.value = { type: "error", message: "Choose a rating from 1 to 5." };
    return;
  }
  try {
    await setDoc(doc(db, "locationRatings", selectedLocation.value.id, "ratings", props.currentUser.uid), { score: Number(selectedScore.value), updatedAt: serverTimestamp() });
    ratingFeedback.value = { type: "success", message: "Your rating has been saved." };
    await loadRating(selectedLocation.value.id);
  } catch (error) {
    ratingFeedback.value = { type: "error", message: "Something went wrong. Please try again." };
  }
}

watch(() => props.currentUser?.uid, () => {
  ratingFeedback.value = null;
  if (selectedLocation.value) loadRating(selectedLocation.value.id);
}, { immediate: true });

onMounted(loadLocations);
</script>

<template>
  <section class="locations-section" aria-labelledby="locations-title">
    <div class="locations-heading">
      <div>
        <p class="eyebrow">Official directory</p>
        <h2 id="locations-title">Find a recycling facility</h2>
        <p>Search Victorian waste and recycling infrastructure by suburb, name or service type.</p>
      </div>
      <a href="https://discover.data.vic.gov.au/dataset/victoria-s-waste-and-resource-recovery-infrastructure-map-data/resource/e44f5d96-51e8-48ec-b674-299d100a0231" target="_blank" rel="noreferrer">About this directory <span aria-hidden="true">↗</span></a>
    </div>

    <div class="filters" aria-label="Search locations">
      <label>
        <span>Search</span>
        <input v-model="searchTerm" type="search" placeholder="Suburb, facility name or service type">
      </label>
      <label>
        <span>Suburb</span>
        <select v-model="selectedSuburb"><option value="">All suburbs</option><option v-for="suburb in suburbs" :key="suburb" :value="suburb">{{ suburb }}</option></select>
      </label>
      <label>
        <span>Service type</span>
        <select v-model="selectedType"><option value="">All service types</option><option v-for="type in facilityTypes" :key="type" :value="type">{{ type }}</option></select>
      </label>
    </div>

    <p v-if="loading" class="status-message" aria-live="polite">Loading locations…</p>
    <div v-else-if="loadError" class="status-message error" aria-live="polite">
      <p>We could not load locations right now. Please try again.</p>
      <button type="button" class="text-action" @click="loadLocations">Try again</button>
    </div>
    <template v-else>
      <p class="results-count">{{ filteredLocations.length }} locations found</p>
      <div class="directory-layout">
        <ul class="location-list" aria-label="Location results">
          <li v-for="location in filteredLocations" :key="location.id">
            <button type="button" class="location-card" :class="{ selected: selectedLocation?.id === location.id }" @click="selectLocation(location)">
              <span class="location-type">{{ location.type || "Recycling facility" }}</span>
              <strong>{{ location.name }}</strong>
              <span>{{ [location.suburb, location.localArea].filter(Boolean).join(" · ") || "Victoria" }}</span>
            </button>
          </li>
        </ul>
        <aside class="location-detail" aria-live="polite">
          <template v-if="selectedLocation">
            <p class="eyebrow">Facility details</p>
            <h3>{{ selectedLocation.name }}</h3>
            <dl>
              <div v-if="selectedLocation.address"><dt>Address</dt><dd>{{ selectedLocation.address }}</dd></div>
              <div v-if="selectedLocation.suburb"><dt>Suburb</dt><dd>{{ selectedLocation.suburb }}</dd></div>
              <div v-if="selectedLocation.localArea"><dt>Local area</dt><dd>{{ selectedLocation.localArea }}</dd></div>
              <div v-if="selectedLocation.operator"><dt>Operator</dt><dd>{{ selectedLocation.operator }}</dd></div>
              <div v-if="selectedLocation.type"><dt>Service type</dt><dd>{{ selectedLocation.type }}</dd></div>
            </dl>
            <p class="visit-note">Check opening hours, accepted items and access conditions with the facility before visiting.</p>
            <div v-if="currentUser" class="rating-panel">
              <p v-if="ratingSummary" class="rating-summary">{{ ratingSummary.count ? `Average rating: ${ratingSummary.average.toFixed(1)} / 5 from ${ratingSummary.count} ratings.` : "No ratings yet." }}</p>
              <fieldset><legend>Rate this location</legend><label v-for="score in [1, 2, 3, 4, 5]" :key="score"><input v-model="selectedScore" :value="score" type="radio" :name="`rating-${selectedLocation.id}`"> {{ score }}</label></fieldset>
              <button type="button" class="save-rating" @click="submitRating">Save rating</button>
              <p v-if="ratingFeedback" :class="ratingFeedback.type" aria-live="polite">{{ ratingFeedback.message }}</p>
            </div>
            <p v-else class="sign-in-message">Sign in to save your rating.</p>
          </template>
          <template v-else><p class="eyebrow">Choose a result</p><h3>See details before you visit</h3><p>Select a location to view its listed address and service information.</p></template>
        </aside>
      </div>
      <p v-if="filteredLocations.length === 0" class="status-message">We could not find a matching place. Try a suburb or postcode.</p>
    </template>
    <p class="source-note">Data: <a href="https://discover.data.vic.gov.au/dataset/victoria-s-waste-and-resource-recovery-infrastructure-map-data/resource/e44f5d96-51e8-48ec-b674-299d100a0231" target="_blank" rel="noreferrer">Victoria’s Waste and Recycling Infrastructure Map © Recycling Victoria 2023</a>. Data last updated 21 January 2026.</p>
  </section>
</template>

<style scoped>
.locations-section { display:grid; gap:var(--space-4); }
.locations-heading { display:flex; justify-content:space-between; gap:var(--space-4); align-items:end; }
.eyebrow { margin:0 0 var(--space-2); color:var(--color-brand); font-size:.8rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }
h2,h3 { margin:0; letter-spacing:-.04em; } h2 { font-size:clamp(2rem,4vw,3.2rem); } h3 { font-size:1.4rem; }
.locations-heading p:not(.eyebrow) { max-width:42rem; margin:var(--space-2) 0 0; color:var(--color-text-muted); line-height:1.55; }
a,.text-action { color:var(--color-brand); font-weight:800; text-underline-offset:.22em; }
.filters { display:grid; grid-template-columns:2fr 1fr 1fr; gap:var(--space-3); padding:var(--space-4); border-radius:var(--radius-md); background:var(--color-muted); }
.filters label { display:grid; gap:.35rem; color:var(--color-brand-strong); font-weight:800; }
.filters input,.filters select { width:100%; min-height:2.8rem; padding:.6rem .7rem; border:1px solid var(--color-border); border-radius:var(--radius-sm); background:var(--color-surface); color:var(--color-text); font:inherit; }
.results-count,.source-note { margin:0; color:var(--color-text-muted); font-size:.9rem; }
.directory-layout { display:grid; grid-template-columns:minmax(0,1fr) minmax(18rem,.68fr); gap:var(--space-4); align-items:start; }
.location-list { display:grid; gap:var(--space-2); max-height:42rem; margin:0; padding:0; overflow:auto; list-style:none; }
.location-card { display:grid; gap:.3rem; width:100%; padding:var(--space-3); border:1px solid var(--color-border); border-radius:var(--radius-sm); background:var(--color-surface); color:var(--color-text); text-align:left; cursor:pointer; }
.location-card:hover,.location-card.selected { border-color:var(--color-brand); background:#f2f8f4; }
.location-card strong { color:var(--color-brand-strong); font-size:1.05rem; }.location-card span:not(.location-type) { color:var(--color-text-muted); font-size:.9rem; }.location-type { color:var(--color-brand); font-size:.75rem; font-weight:800; letter-spacing:.06em; text-transform:uppercase; }
.location-detail { position:sticky; top:7rem; padding:var(--space-4); border-radius:var(--radius-md); background:var(--color-surface); box-shadow:var(--shadow-card); }.location-detail > p:not(.eyebrow),dd { color:var(--color-text-muted); line-height:1.55; }
dl { display:grid; gap:var(--space-3); margin:var(--space-4) 0; } dl div { display:grid; gap:.15rem; } dt { color:var(--color-brand-strong); font-weight:800; } dd { margin:0; }.visit-note { padding:var(--space-3); border-left:4px solid var(--color-accent); background:#fff9e8; }
.rating-panel { margin-top:var(--space-4); padding-top:var(--space-4); border-top:1px solid var(--color-border); }.rating-summary { font-weight:700; } fieldset { display:flex; flex-wrap:wrap; gap:.65rem; margin:var(--space-3) 0; padding:0; border:0; } legend { width:100%; margin-bottom:.35rem; font-weight:800; } fieldset label { display:flex; gap:.2rem; align-items:center; }.save-rating { padding:.7rem 1rem; border:0; border-radius:999px; background:var(--color-brand); color:var(--color-surface); font:inherit; font-weight:800; cursor:pointer; }.success { color:#176b3a; font-weight:700; }.error { color:#a12626; font-weight:700; }.sign-in-message { margin-top:var(--space-4); font-weight:700; }.status-message { padding:var(--space-4); border-radius:var(--radius-sm); background:var(--color-muted); } button:focus-visible,input:focus-visible,select:focus-visible,a:focus-visible { outline:3px solid var(--color-accent); outline-offset:3px; }
@media (max-width:767px) { .locations-heading,.directory-layout,.filters { grid-template-columns:1fr; display:grid; }.locations-heading { align-items:start; }.location-detail { position:static; }.location-list { max-height:none; } }
</style>
