<script setup>
import { ref } from "vue";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

import RecyclingGuide from "./components/RecyclingGuide.vue";
import RecyclingLocations from "./components/RecyclingLocations.vue";
import RegisterForm from "./components/RegisterForm.vue";
import LoginForm from "./components/LoginForm.vue";
import AdminDashboard from "./components/AdminDashboard.vue";

const activePage = ref("guide");
const currentUser = ref(null);

const currentRole = ref(null);

async function loadUserRole(user) {
  currentRole.value = null;

  if (!user) {
    return;
  }

  const userProfile = await getDoc(doc(db, "users", user.uid));

  if (userProfile.exists()) {
    currentRole.value = userProfile.data().role;
  }
}

onAuthStateChanged(auth, async (user) => {
  currentUser.value = user;
  await loadUserRole(user);

  if (
    user &&
    (activePage.value === "register" || activePage.value === "login")
  ) {
    activePage.value = "guide";
  }
});

async function logoutUser() {
  await signOut(auth);
  activePage.value = "guide";
}
</script>

<template>
  <header class="site-header">
    <h1 class="site-title">CircularLoop Melbourne</h1>

    <nav class="site-nav" aria-label="Main navigation">
      <button @click="activePage = 'guide'">Guide</button>
      <button @click="activePage = 'locations'">Locations</button>
      <template v-if="currentUser">
        <span class="user-status">
          Signed in as {{ currentUser.displayName || currentUser.email }}
        </span>
        <button
          v-if="currentRole === 'admin'"
          @click="activePage = 'admin'"
        >
          Admin Dashboard
        </button>
        <button @click="logoutUser">Logout</button>
      </template>

      <template v-else>
        <button @click="activePage = 'register'">Register</button>
        <button @click="activePage = 'login'">Login</button>
      </template>
    </nav>
  </header>

  <main class="page-content">
    <RecyclingGuide v-if="activePage === 'guide'" />
    <RecyclingLocations
      v-if="activePage === 'locations'"
      :current-user="currentUser"
    />
    <RegisterForm v-if="activePage === 'register'" />
    <LoginForm v-if="activePage === 'login'" />
    <AdminDashboard
      v-if="activePage === 'admin' && currentRole === 'admin'"
    />
  </main>
</template>

<style scoped>
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
}

.site-title {
  margin: 0;
  font-size: clamp(1.6rem, 4vw, 2.8rem);
}

.site-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.site-nav button {
  padding: 0.6rem 1rem;
  border: 1px solid #999;
  border-radius: 0.4rem;
  background-color: white;
  cursor: pointer;
}

.site-nav button:hover {
  background-color: #e6f4ef;
}

.page-content {
  padding: 1.5rem 0;
}

@media (max-width: 767px) {
  .site-header {
    flex-direction: column;
    align-items: stretch;
  }

  .site-title {
    text-align: center;
  }

  .site-nav {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .site-nav button {
    width: 100%;
  }

  .user-status {
    grid-column: 1 / -1;
    text-align: center;
  }
}

@media (max-width: 575px) {
  .site-nav {
    grid-template-columns: 1fr;
  }

  .page-content {
    padding-top: 1rem;
  }
}

@media (min-width: 768px) {
  .site-header {
    flex-direction: row;
    align-items: center;
  }

  .site-nav {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .page-content {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
  }
}

.user-status {
  flex-basis: 100%;
  order: 1;
  text-align: right;
  font-weight: 600;
}


</style>
