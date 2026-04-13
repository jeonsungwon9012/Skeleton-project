<script setup>
import CalendarMain from '../calendar/calendarMain.vue';
</script>

<template>
  <div class="calendar-page-view">
    <header class="page-header">
      <div class="header-text">
        <p class="page-eyebrow">캘린더</p>
        <h3 class="h3">똑딱 캘린더</h3>
        <p class="body-m color-gray">날짜 흐름에 따라 수입과 지출을 확인해보세요.</p>
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
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.page-header {
  margin-bottom: 40px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.page-eyebrow {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-deepgray-50);
  margin-bottom: 8px;
}

.color-gray {
  color: var(--color-deepgray-60);
}

.content {
  width: 100%;
  min-width: 0;
}

@media (max-width: 768px) {
  .calendar-page-view {
    padding: 0;
  }

  .page-header {
    display: none;
  }
}
</style>
