<script setup>
import { useDashboardStore } from '@/stores/dashboardStore';

const dashboard = useDashboardStore();
</script>

<template>
  <div class="summary">
    <p class="page-title">대시보드</p>
    <div class="header">
      <div class="month-nav">
        <button @click="dashboard.prevMonth">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <h2>{{ dashboard.currentMonth }}월</h2>
        <button @click="dashboard.nextMonth">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 6L15 12L9 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
      <div class="monthly-message">
        ☕ {{ dashboard.currentMonth }}월의 나는 커피 마니아!
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary {
  padding: 24px;
  font-family: 'Noto Sans KR', sans-serif;
}

.page-title {
  font-size: 13px;
  color: #aaa;
  margin-bottom: 12px;
}

/* 헤더 */
.header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center; /* ✅ 추가 */
}

.month-nav h2 {
  font-size: 36px;
  font-weight: 800;
  color: #1a1a1a;
  min-width: 80px;
  text-align: center; /* ✅ 추가 */
}

.month-nav button {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1.5px solid #e0e0e0;
  background: #f7f8fa;
  cursor: pointer;
  color: #555;
  transition: all 0.2s ease;
}
.month-nav button:hover {
  background: #4caf50;
  border-color: #4caf50;
  color: white;
  transform: scale(1.1);
}
.month-nav button:active {
  transform: scale(0.95);
}

/* 월별 메시지 */
.monthly-message {
  background: #f0faf0;
  color: #4caf50;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 20px;
  border: 1px solid #c8e6c9;
}
</style>
