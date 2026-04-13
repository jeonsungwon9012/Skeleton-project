<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import Sidebar from './components/common/sidebar.vue';

const route = useRoute();
const isSidebarOpen = ref(false);
const isMobile = ref(false);

const updateViewport = () => {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) {
    isSidebarOpen.value = false;
  }
};

const openSidebar = () => {
  if (isMobile.value) {
    isSidebarOpen.value = true;
  }
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
};

const shouldShowMobileHeader = computed(
  () => !route.meta.isFullPage && isMobile.value,
);

onMounted(() => {
  updateViewport();
  window.addEventListener('resize', updateViewport);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewport);
});
</script>

<template>
  <div class="app full-layout" v-if="$route.meta.isFullPage">
    <RouterView />
  </div>

  <div class="app app-layout" v-else>
    <header v-if="shouldShowMobileHeader" class="mobile-header">
      <button
        class="menu-button"
        type="button"
        @click="openSidebar"
        aria-label="Open menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <p class="mobile-title">똑딱</p>
    </header>

    <div
      v-if="isMobile && isSidebarOpen"
      class="sidebar-overlay"
      @click="closeSidebar"
    ></div>

    <Sidebar
      :is-mobile="isMobile"
      :is-open="isMobile ? isSidebarOpen : true"
      @close="closeSidebar"
    />

    <div class="main-content">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
}

.mobile-header,
.sidebar-overlay {
  display: none;
}

@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
    position: relative;
  }

  .mobile-header {
    display: flex;
    align-items: center;
    gap: 12px;
    position: sticky;
    top: 0;
    z-index: 25;
    padding: 14px 16px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--color-deepgray-10);
  }

  .menu-button {
    width: 40px;
    height: 40px;
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    border: none;
    border-radius: 12px;
    background: var(--color-gray-10);
    cursor: pointer;
    padding: 0 10px;
  }

  .menu-button span {
    display: block;
    width: 100%;
    height: 2px;
    border-radius: 999px;
    background: var(--color-deepgray-100);
  }

  .mobile-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-deepgray-100);
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 19;
    background: rgba(44, 51, 51, 0.26);
  }

  .main-content {
    align-items: flex-start;
    width: 100%;
    padding: 0;
    overflow-x: hidden;
  }
}
</style>
