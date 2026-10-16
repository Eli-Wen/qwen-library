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
import HomeView from "./components/HomeView.vue";

const activePage = ref("home");
const currentUser = ref(null);

const currentRole = ref(null);
const pageIntro = {
  guide: {
    label: "Explore",
    description: "Find practical guidance for common household items."
  },
  locations: {
    label: "Find a location",
    description: "Search official Victorian recycling infrastructure near you."
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
    activePage.value = "home";
  }
});

async function logoutUser() {
  await signOut(auth);
  activePage.value = "home";
}
</script>

<template>
  <header class="site-header">
    <div class="topbar-content">
      <h1 class="site-title">CircularLoop Melbourne</h1>

      <div class="topbar-right">
        <nav class="site-nav" aria-label="Main navigation">
          <button
            :class="{ 'is-active': activePage === 'home' }"
            @click="activePage = 'home'"
          >
            Home
          </button>

          <button
            :class="{ 'is-active': activePage === 'guide' }"
            @click="activePage = 'guide'"
          >
            How to recycle
          </button>

          <button
            :class="{ 'is-active': activePage === 'locations' }"
            @click="activePage = 'locations'"
          >
            Find a location
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
    <HomeView
      v-if="activePage === 'home'"
      @navigate="activePage = $event"
    />
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
  width: 100%;
  background-color: var(--color-brand);
  color: var(--color-surface);
  box-shadow: var(--shadow-header);
  position: sticky;
  top: 0;
  z-index: 100;
}

.topbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  width: min(var(--content-width), calc(100% - (var(--page-gutter) * 2)));
  margin: 0 auto;
  padding: 1rem 0;
}

.site-title {
  margin: 0;
  color: var(--color-surface);
  font-size: clamp(1.35rem, 2.4vw, 1.85rem);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 1.1;
}

.topbar-right {
  display: grid;
  gap: 0.45rem;
  justify-items: end;
}

.site-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.45rem;
}

.site-nav button {
  padding: 0.55rem 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 999px;
  background-color: transparent;
  color: var(--color-surface);
  cursor: pointer;
  font-weight: 600;
  transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease;
}

.site-nav button:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.site-nav button.is-active {
  border-color: var(--color-surface);
  background-color: var(--color-surface);
  color: var(--color-brand-strong);
}

.site-nav button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}

.user-status {
  margin: 0;
  color: #dceee3;
  font-size: 0.875rem;
  font-weight: 600;
}

.page-content {
  display: grid;
  gap: var(--space-5);
  width: min(var(--content-width), calc(100% - (var(--page-gutter) * 2)));
  margin: 0 auto;
  padding: var(--space-6) 0 var(--space-7);
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
    padding-top: var(--space-4);
  }
}
</style>
