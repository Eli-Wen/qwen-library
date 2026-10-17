<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const props = defineProps({
  locations: { type: Array, required: true },
  selectedLocation: { type: Object, default: null }
});

const emit = defineEmits(["select"]);
const mapElement = ref(null);
const locationStatus = ref("");
const locating = ref(false);
const nearestLocations = ref([]);
let map;
let markers;
let userLayer;
let hasFittedBounds = false;

function hasCoordinates(location) {
  return location && Number.isFinite(location.latitude) && Number.isFinite(location.longitude);
}

function distanceInKilometres(first, second) {
  const radius = 6371;
  const latitudeDifference = (second.latitude - first.latitude) * (Math.PI / 180);
  const longitudeDifference = (second.longitude - first.longitude) * (Math.PI / 180);
  const firstLatitude = first.latitude * (Math.PI / 180);
  const secondLatitude = second.latitude * (Math.PI / 180);
  const calculation = Math.sin(latitudeDifference / 2) ** 2
    + Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDifference / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(calculation), Math.sqrt(1 - calculation));
}

function displayName(location) {
  return `${location.name}${location.suburb ? `, ${location.suburb}` : ""}`;
}

function updateMarkers() {
  if (!map || !markers) return;

  markers.clearLayers();
  const locationsWithCoordinates = props.locations.filter(hasCoordinates);

  locationsWithCoordinates.forEach((location) => {
    const selected = props.selectedLocation?.id === location.id;
    const marker = L.circleMarker([location.latitude, location.longitude], {
      radius: selected ? 9 : 6,
      color: selected ? "#eab94e" : "#174f43",
      weight: selected ? 4 : 2,
      fillColor: selected ? "#174f43" : "#dceee3",
      fillOpacity: 0.95
    });

    marker.bindTooltip(displayName(location), { direction: "top" });
    marker.on("click", () => emit("select", location));
    markers.addLayer(marker);
  });

  if (!hasFittedBounds && locationsWithCoordinates.length) {
    map.fitBounds(L.latLngBounds(locationsWithCoordinates.map((location) => [location.latitude, location.longitude])), { padding: [28, 28] });
    hasFittedBounds = true;
  }
}

function focusSelectedLocation() {
  if (!map || !hasCoordinates(props.selectedLocation)) return;
  map.setView([props.selectedLocation.latitude, props.selectedLocation.longitude], 12, { animate: true });
}

function useMyLocation() {
  if (!navigator.geolocation) {
    locationStatus.value = "Your browser does not support location access.";
    return;
  }

  locating.value = true;
  locationStatus.value = "Finding your location…";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      const rankedLocations = props.locations
        .filter(hasCoordinates)
        .map((location) => ({ ...location, distance: distanceInKilometres(userLocation, location) }))
        .sort((first, second) => first.distance - second.distance)
        .slice(0, 5);

      nearestLocations.value = rankedLocations;
      locationStatus.value = "Your location is shown. These are the nearest listed facilities.";
      locating.value = false;

      if (userLayer) map.removeLayer(userLayer);
      userLayer = L.circleMarker([userLocation.latitude, userLocation.longitude], {
        radius: 9,
        color: "#174f43",
        weight: 3,
        fillColor: "#eab94e",
        fillOpacity: 1
      }).addTo(map).bindTooltip("Your location", { permanent: true, direction: "top" });

      map.setView([userLocation.latitude, userLocation.longitude], 11, { animate: true });
    },
    () => {
      locating.value = false;
      locationStatus.value = "We could not access your location. Check browser permissions and try again.";
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
}

onMounted(async () => {
  await nextTick();
  map = L.map(mapElement.value, { scrollWheelZoom: false }).setView([-37.8136, 144.9631], 8);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);
  markers = L.layerGroup().addTo(map);
  updateMarkers();
});

onBeforeUnmount(() => {
  if (map) map.remove();
});

watch(() => props.locations, updateMarkers, { deep: true });
watch(() => props.selectedLocation, () => {
  updateMarkers();
  focusSelectedLocation();
});
</script>

<template>
  <section class="location-map" aria-labelledby="map-title">
    <div class="map-heading">
      <div>
        <p class="eyebrow">Explore the map</p>
        <h3 id="map-title">View facilities near you</h3>
      </div>
      <button type="button" class="location-button" :disabled="locating" @click="useMyLocation">{{ locating ? "Finding your location…" : "Use my location" }}</button>
    </div>
    <p class="map-description">Select a marker to view facility details. Your location is used only in this browser to calculate nearby facilities.</p>
    <div ref="mapElement" class="map-canvas" aria-label="Map of listed recycling facilities"></div>
    <p v-if="locationStatus" class="location-status" aria-live="polite">{{ locationStatus }}</p>
    <div v-if="nearestLocations.length" class="nearby-list">
      <h4>Nearest listed facilities</h4>
      <ol>
        <li v-for="location in nearestLocations" :key="location.id">
          <button type="button" @click="emit('select', location)">{{ displayName(location) }}</button>
          <span>{{ location.distance.toFixed(1) }} km away</span>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.location-map { display:grid; gap:var(--space-3); padding:var(--space-4); border-radius:var(--radius-md); background:var(--color-surface); box-shadow:var(--shadow-card); }.map-heading { display:flex; align-items:end; justify-content:space-between; gap:var(--space-3); }.eyebrow { margin:0 0 var(--space-1); color:var(--color-brand); font-size:.8rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }.map-heading h3,.nearby-list h4 { margin:0; color:var(--color-brand-strong); }.map-description,.location-status { margin:0; color:var(--color-text-muted); line-height:1.5; }.location-button { padding:.7rem 1rem; border:0; border-radius:999px; background:var(--color-brand); color:var(--color-surface); font:inherit; font-weight:800; cursor:pointer; white-space:nowrap; }.location-button:disabled { background:var(--color-text-muted); cursor:wait; }.map-canvas { min-height:27rem; border:1px solid var(--color-border); border-radius:var(--radius-sm); overflow:hidden; }.nearby-list { padding:var(--space-3); border-radius:var(--radius-sm); background:var(--color-surface-muted); }.nearby-list ol { display:grid; gap:var(--space-2); margin:var(--space-2) 0 0; padding-left:1.3rem; }.nearby-list li { display:flex; flex-wrap:wrap; justify-content:space-between; gap:var(--space-2); }.nearby-list button { padding:0; border:0; background:transparent; color:var(--color-brand); font:inherit; font-weight:800; text-align:left; text-decoration:underline; text-underline-offset:.2em; cursor:pointer; }.nearby-list span { color:var(--color-text-muted); } button:focus-visible { outline:var(--focus-ring); outline-offset:3px; } @media (max-width:575px) { .map-heading { align-items:start; flex-direction:column; }.map-canvas { min-height:22rem; } }
</style>
