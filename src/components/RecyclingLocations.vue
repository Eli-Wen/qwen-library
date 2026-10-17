<script setup>
import { onMounted, ref, watch } from "vue";
import { collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import InteractiveDataTable from "./InteractiveDataTable.vue";
import LocationMap from "./LocationMap.vue";

const DATASET_URL = "https://discover.data.vic.gov.au/api/3/action/datastore_search?resource_id=e44f5d96-51e8-48ec-b674-299d100a0231&limit=700";

const props = defineProps({ currentUser: { type: Object, default: null } });
const locations = ref([]);
const loading = ref(true);
const loadError = ref(false);
const selectedLocation = ref(null);
const ratingSummary = ref(null);
const selectedScore = ref(null);
const ratingFeedback = ref(null);
const emailFeedback = ref(null);
const emailSending = ref(false);
const locationColumns = [
  { key: "name", label: "Facility", value: (location) => location.name },
  { key: "suburb", label: "Suburb", value: (location) => location.suburb },
  { key: "localArea", label: "Local area", value: (location) => location.localArea },
  { key: "type", label: "Service type", value: (location) => location.type }
];

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
    type: readField(record, "Infrastructure Type") || readField(record, "Type"),
    latitude: Number(readField(record, "Latitude")),
    longitude: Number(readField(record, "Longitude"))
  };
}

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
  emailFeedback.value = null;
  loadRating(location.id);
}

async function emailFacilityDetails() {
  if (!auth.currentUser || !selectedLocation.value) {
    return;
  }

  emailSending.value = true;
  emailFeedback.value = null;

  try {
    const idToken = await auth.currentUser.getIdToken();
    const response = await fetch("/api/send-facility-email", {
      method: "POST",
      headers: {
        authorization: `Bearer ${idToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ location: selectedLocation.value })
    });
    const payload = await response.json();

    emailFeedback.value = {
      type: response.ok ? "success" : "error",
      message: payload.message || "Something went wrong. Please try again."
    };
  } catch {
    emailFeedback.value = {
      type: "error",
      message: "Something went wrong. Please try again."
    };
  } finally {
    emailSending.value = false;
  }
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
        <p>Search and sort Victorian waste and recycling infrastructure by individual columns.</p>
      </div>
      <a href="https://discover.data.vic.gov.au/dataset/victoria-s-waste-and-resource-recovery-infrastructure-map-data/resource/e44f5d96-51e8-48ec-b674-299d100a0231" target="_blank" rel="noreferrer">About this directory <span aria-hidden="true">↗</span></a>
    </div>

    <p v-if="loading" class="status-message" aria-live="polite">Loading locations…</p>
    <div v-else-if="loadError" class="status-message error" aria-live="polite">
      <p>We could not load locations right now. Please try again.</p>
      <button type="button" class="text-action" @click="loadLocations">Try again</button>
    </div>
    <template v-else>
      <LocationMap
        :locations="locations"
        :selected-location="selectedLocation"
        @select="selectLocation"
      />
      <div class="directory-layout">
        <InteractiveDataTable
          :columns="locationColumns"
          :rows="locations"
          :selected-row-id="selectedLocation?.id || ''"
          selectable
          select-from-key="name"
          empty-message="We could not find a matching place. Try a suburb or postcode."
          @select="selectLocation"
        />
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
            <div v-if="currentUser" class="email-panel">
              <h4>Email these details</h4>
              <p>We will send a text attachment to your signed-in email address.</p>
              <button type="button" class="email-button" :disabled="emailSending" @click="emailFacilityDetails">{{ emailSending ? "Sending…" : "Email facility details" }}</button>
              <p v-if="emailFeedback" :class="emailFeedback.type" aria-live="polite">{{ emailFeedback.message }}</p>
            </div>
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
.source-note { margin:0; color:var(--color-text-muted); font-size:.9rem; }
.directory-layout { display:grid; grid-template-columns:minmax(0,1fr) minmax(18rem,.68fr); gap:var(--space-4); align-items:start; }
.location-detail { position:sticky; top:7rem; padding:var(--space-4); border-radius:var(--radius-md); background:var(--color-surface); box-shadow:var(--shadow-card); }.location-detail > p:not(.eyebrow),dd { color:var(--color-text-muted); line-height:1.55; }
dl { display:grid; gap:var(--space-3); margin:var(--space-4) 0; } dl div { display:grid; gap:.15rem; } dt { color:var(--color-brand-strong); font-weight:800; } dd { margin:0; }.visit-note { padding:var(--space-3); border-left:4px solid var(--color-accent); background:#fff9e8; }
.email-panel,.rating-panel { margin-top:var(--space-4); padding-top:var(--space-4); border-top:1px solid var(--color-border); }.email-panel h4 { margin:0; color:var(--color-brand-strong); font-size:1rem; }.email-panel p { margin:var(--space-1) 0 var(--space-3); }.email-button,.save-rating { padding:.7rem 1rem; border:0; border-radius:999px; background:var(--color-brand); color:var(--color-surface); font:inherit; font-weight:800; cursor:pointer; }.email-button:disabled { background:var(--color-text-muted); cursor:wait; }.rating-summary { font-weight:700; } fieldset { display:flex; flex-wrap:wrap; gap:.65rem; margin:var(--space-3) 0; padding:0; border:0; } legend { width:100%; margin-bottom:.35rem; font-weight:800; } fieldset label { display:flex; gap:.2rem; align-items:center; }.success { color:#176b3a; font-weight:700; }.error { color:#a12626; font-weight:700; }.sign-in-message { margin-top:var(--space-4); font-weight:700; }.status-message { padding:var(--space-4); border-radius:var(--radius-sm); background:var(--color-muted); } button:focus-visible,input:focus-visible,select:focus-visible,a:focus-visible { outline:3px solid var(--color-accent); outline-offset:3px; }
@media (max-width:767px) { .locations-heading,.directory-layout { grid-template-columns:1fr; display:grid; }.locations-heading { align-items:start; }.location-detail { position:static; } }
</style>
