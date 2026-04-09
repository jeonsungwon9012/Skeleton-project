<script setup>
import Sidebar from './components/common/sidebar.vue';
import Calendar from "./components/views/Calendar.vue";
</script>

<template>
  <div class="app full-layout" v-if="$route.meta.isFullPage">
    <router-view />
  </div>

  <div class="app app-layout" v-else>
    <Sidebar />
    <main class="main">
      <router-view />
      <Calendar/>
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
}
</style>
