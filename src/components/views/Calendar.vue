<script setup>
import CalendarMain from '../calendar/calendarMain.vue';
</script>

<template>
  <div class="calendar-page-view">
    <header class="page-header">
      <div class="header-text">
        <h3 class="h3">똑딱 캘린더</h3>
        <p class="body-m color-gray">나의 소비 흐름을 한눈에 관리해보세요.</p>
      </div>
    </header>

    <main class="content">
      <CalendarMain />
    </main>
  </div>
</template>

<style scoped>
.calendar-page-view {
  padding: 40px;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 40px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.color-gray {
  color: var(--color-deepgray-60);
}

.content {
  width: 100%;
}
</style>