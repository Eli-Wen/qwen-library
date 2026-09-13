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
import PageIntro from "./components/PageIntro.vue";
import SiteFooter from "./components/SiteFooter.vue";

const activePage = ref("guide");
const currentUser = ref(null);

const currentRole = ref(null);
const pageIntro = {
  guide: {
    label: "Explore",
    description: "Browse practical recycling guidance for common household items."
  },
  locations: {
    label: "Find and rate",
    description: "Search listed locations and, once signed in, share a rating."
  },
  register: {
    label: "Create an account",
    description: "Register to access protected account and rating features."
  },
  login: {
    label: "Account access",
    description: "Sign in to submit ratings and access your account."
  },
  admin: {
    label: "Protected area",
    description: "Review registered accounts and their assigned roles."
  }
};

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
    <div class="topbar-content">
      <h1 class="site-title">CircularLoop Melbourne</h1>

      <div class="topbar-right">
        <nav class="site-nav" aria-label="Main navigation">
          <button
            :class="{ 'is-active': activePage === 'guide' }"
            @click="activePage = 'guide'"
          >
            Guide
          </button>

          <button
            :class="{ 'is-active': activePage === 'locations' }"
            @click="activePage = 'locations'"
          >
            Locations
          </button>

          <template v-if="currentUser">
            <button
              v-if="currentRole === 'admin'"
              :class="{ 'is-active': activePage === 'admin' }"
              @click="activePage = 'admin'"
            >
              Admin Dashboard
            </button>
            <button @click="logoutUser">Logout</button>
          </template>

          <template v-else>
            <button
              :class="{ 'is-active': activePage === 'register' }"
              @click="activePage = 'register'"
            >
              Register
            </button>

            <button
              :class="{ 'is-active': activePage === 'login' }"
              @click="activePage = 'login'"
            >
              Login
            </button>
          </template>
        </nav>

        <p v-if="currentUser" class="user-status">
          Signed in as {{ currentUser.displayName || currentUser.email }}
        </p>
      </div>
    </div>
  </header>

  <main class="page-content">
    <PageIntro
      v-if="pageIntro[activePage]"
      :label="pageIntro[activePage].label"
      :description="pageIntro[activePage].description"
    />
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
  <SiteFooter />
</template>

<style scoped>
.site-header {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  background-color: #123d31;
  color: white;
  box-shadow: 0 2px 10px rgba(18, 61, 49, 0.18);
  position: sticky;
  top: 0;
  z-index: 100;
}

.topbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  width: min(1200px, calc(100% - 3rem));
  margin: 0 auto;
  padding: 1rem 0;
}

.site-title {
  margin: 0;
  color: white;
  font-size: clamp(1.5rem, 3vw, 2.15rem);
  letter-spacing: -0.03em;
}

.topbar-right {
  display: grid;
  gap: 0.55rem;
  justify-items: end;
}

.site-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

.site-nav button {
  padding: 0.55rem 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 0.45rem;
  background-color: transparent;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

.site-nav button:hover {
  background-color: rgba(255, 255, 255, 0.14);
}

.site-nav button.is-active {
  border-color: #d8eee4;
  background-color: #d8eee4;
  color: #123d31;
}

.site-nav button:focus-visible {
  outline: 3px solid #f4c95d;
  outline-offset: 2px;
}

.user-status {
  margin: 0;
  color: #e1f3ea;
  font-weight: 600;
}

.page-content {
  display: grid;
  gap: 1.5rem;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem 0;
}

@media (max-width: 767px) {
  .topbar-content {
    flex-direction: column;
    align-items: stretch;
  }

  .site-title {
    text-align: center;
  }

  .topbar-right {
    justify-items: stretch;
  }

  .site-nav {
    justify-content: center;
  }

  .user-status {
    text-align: center;
  }
}

@media (max-width: 575px) {
  .site-nav {
    display: grid;
    grid-template-columns: 1fr;
  }

  .site-nav button {
    width: 100%;
  }

  .page-content {
    padding-top: 1rem;
  }
}
</style>
