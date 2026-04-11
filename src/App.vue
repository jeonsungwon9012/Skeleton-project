<script setup>
import Sidebar from './components/common/sidebar.vue';
import { RouterView } from 'vue-router';
</script>

<template>
  <div class="app full-layout" v-if="$route.meta.isFullPage">
    <router-view />
  </div>

  <div class="app app-layout" v-else>
    <Sidebar />
    <div class="main-content">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh; /* 화면 전체 높이 확보 */
}

.main-content {
  /* 1. 사이드바를 제외한 나머지 가로 공간을 모두 차지하게 함 */
  flex: 1;

  /* 2. 내부 요소를 중앙으로 정렬하기 위한 Flexbox 설정 */
  display: flex;
  justify-content: center; /* 가로축 중앙 정렬 */
  align-items: center; /* 세로축 중앙 정렬 */
}
</style>
