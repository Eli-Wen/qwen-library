<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  selectedRowId: { type: String, default: "" },
  selectable: { type: Boolean, default: false },
  selectFromKey: { type: String, default: "" },
  emptyMessage: { type: String, default: "No matching results found." }
});

const emit = defineEmits(["select"]);
const columnFilters = ref({});
const sortKey = ref("");
const sortDirection = ref("asc");
const currentPage = ref(1);
const rowsPerPage = 10;

function valueFor(row, column) {
  return String(column.value(row) || "");
}

const filteredRows = computed(() => props.rows.filter((row) => props.columns.every((column) => {
  const filter = String(columnFilters.value[column.key] || "").trim().toLowerCase();
  return !filter || valueFor(row, column).toLowerCase().includes(filter);
})));

const sortedRows = computed(() => {
  const rows = [...filteredRows.value];
  if (!sortKey.value) return rows;
  const column = props.columns.find((item) => item.key === sortKey.value);
  return rows.sort((first, second) => valueFor(first, column).localeCompare(valueFor(second, column), undefined, { numeric: true }) * (sortDirection.value === "asc" ? 1 : -1));
});

const pageCount = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / rowsPerPage)));
const paginatedRows = computed(() => {
  const page = Math.min(currentPage.value, pageCount.value);
  return sortedRows.value.slice((page - 1) * rowsPerPage, page * rowsPerPage);
});
const resultRange = computed(() => {
  if (!sortedRows.value.length) return "No results";
  const first = (Math.min(currentPage.value, pageCount.value) - 1) * rowsPerPage + 1;
  return `${first}–${Math.min(first + rowsPerPage - 1, sortedRows.value.length)} of ${sortedRows.value.length}`;
});

function filterChanged() { currentPage.value = 1; }
function sortBy(column) {
  if (sortKey.value === column.key) sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  else { sortKey.value = column.key; sortDirection.value = "asc"; }
}
function sortLabel(column) {
  if (sortKey.value !== column.key) return "Sort";
  return sortDirection.value === "asc" ? "Sorted ascending" : "Sorted descending";
}
</script>

<template>
  <section class="interactive-table">
    <div class="table-tools">
      <p aria-live="polite">Showing {{ resultRange }}</p>
    </div>
    <div class="table-scroll">
      <table>
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" scope="col">
            <button type="button" class="sort-button" @click="sortBy(column)">
              {{ column.label }}
              <span class="sort-indicator" :aria-label="sortLabel(column)">{{ sortKey === column.key ? (sortDirection === "asc" ? "↑" : "↓") : "↕" }}</span>
            </button>
          </th>
          <th v-if="selectable && !selectFromKey" scope="col"><span class="visually-hidden">Actions</span></th>
        </tr>
        <tr class="filter-row">
          <th v-for="column in columns" :key="column.key" scope="col">
            <label class="visually-hidden" :for="`filter-${column.key}`">Filter by {{ column.label }}</label>
            <input :id="`filter-${column.key}`" v-model="columnFilters[column.key]" type="search" :placeholder="`Filter ${column.label}`" @input="filterChanged">
          </th>
          <th v-if="selectable && !selectFromKey"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in paginatedRows" :key="row.id" :class="{ selected: selectedRowId === row.id }">
          <td v-for="column in columns" :key="column.key">
            <button v-if="selectable && column.key === selectFromKey" type="button" class="cell-action" @click="emit('select', row)">{{ valueFor(row, column) || "—" }}</button>
            <template v-else>{{ valueFor(row, column) || "—" }}</template>
          </td>
          <td v-if="selectable && !selectFromKey"><button type="button" class="details-button" @click="emit('select', row)">View details</button></td>
        </tr>
        <tr v-if="!paginatedRows.length"><td :colspan="columns.length + (selectable && !selectFromKey ? 1 : 0)" class="empty-cell">{{ emptyMessage }}</td></tr>
      </tbody>
      </table>
    </div>
    <nav v-if="pageCount > 1" class="pagination" aria-label="Table pages">
      <button type="button" :disabled="currentPage === 1" @click="currentPage -= 1">Previous</button>
      <span>Page {{ Math.min(currentPage, pageCount) }} of {{ pageCount }}</span>
      <button type="button" :disabled="currentPage === pageCount" @click="currentPage += 1">Next</button>
    </nav>
  </section>
</template>

<style scoped>
.interactive-table { min-width:0; }.table-tools { margin-bottom:var(--space-2); color:var(--color-text-muted); font-size:.9rem; }.table-scroll { overflow-x:auto; border:1px solid var(--color-border); border-radius:var(--radius-md); background:var(--color-surface); } table { width:100%; min-width:38rem; border-collapse:collapse; } th,td { padding:.8rem; border-bottom:1px solid var(--color-border); text-align:left; vertical-align:top; } th { background:var(--color-surface-muted); color:var(--color-brand-strong); font-size:.875rem; } tbody tr:last-child td { border-bottom:0; } tbody tr.selected { background:#f2f8f4; }.sort-button { display:inline-flex; gap:.35rem; align-items:center; padding:0; background:transparent; color:inherit; font:inherit; font-weight:800; cursor:pointer; }.sort-indicator { color:var(--color-brand); }.filter-row th { padding:.5rem; }.filter-row input { width:100%; min-width:8rem; padding:.5rem; border:1px solid var(--color-border-strong); border-radius:var(--radius-sm); background:var(--color-surface); color:var(--color-text); font:inherit; font-size:.85rem; }.cell-action { padding:0; border:0; background:transparent; color:var(--color-brand-strong); font:inherit; font-weight:800; text-align:left; text-decoration:underline; text-decoration-color:var(--color-accent); text-underline-offset:.25em; cursor:pointer; }.details-button,.pagination button { padding:.5rem .75rem; border:1px solid var(--color-brand); border-radius:999px; background:var(--color-surface); color:var(--color-brand); font:inherit; font-weight:800; cursor:pointer; white-space:nowrap; }.pagination { display:flex; align-items:center; justify-content:flex-end; gap:var(--space-3); margin-top:var(--space-3); }.pagination span { color:var(--color-text-muted); font-size:.9rem; }.pagination button:disabled { border-color:var(--color-border); color:var(--color-text-muted); cursor:not-allowed; }.empty-cell { padding:var(--space-5); color:var(--color-text-muted); text-align:center; }.visually-hidden { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
</style>
