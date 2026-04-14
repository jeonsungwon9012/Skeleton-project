<script setup>
import { computed, onMounted, ref } from 'vue';
import { useDashboardStore } from '@/stores/dashboard';
import { useTransactionStore } from '@/stores/budgetStore';

const dashboard = useDashboardStore();
const transactionStore = useTransactionStore();

const monthLabel = computed(() => `${dashboard.currentMonth}월`);

onMounted(() => {
  transactionStore.loadData();
});
</script>

<template>
  <div class="summary">
    <p class="page-title">캘린더</p>
    <div class="header-layout">
      <div class="header-left">
        <div class="month-nav">
          <button @click="dashboard.prevMonth" aria-label="Previous month">
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
          <h2>{{ monthLabel }}</h2>
          <button @click="dashboard.nextMonth" aria-label="Next month">
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
          {{ transactionStore.topMonthlyMessage }}
        </div>
        <button
          class="compare-toggle-btn"
          :class="{ active: dashboard.isCompareMode }"
          @click="dashboard.isCompareMode = !dashboard.isCompareMode"
        >
          {{ dashboard.isCompareMode ? '일반 보기' : '전 달과 비교' }}
        </button>
      </div>
      <div class="header-right"></div>
    </div>
  </div>
</template>

<style scoped>
.summary {
  padding: 24px 24px 0;
  font-family: var(--font-main, 'Noto Sans KR', sans-serif);
  width: 100%;
  box-sizing: border-box;
}

.page-title {
  font-size: 13px;
  color: #aaa;
  margin-bottom: 12px;
}

.header-layout {
  display: flex;
  gap: 24px; /* Dashboard.vue의 main-side gap과 일치 */
  width: 100%;
}

.header-left {
  flex: 1; /* Dashboard.vue의 left-side 비율과 일치 */
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-right {
  flex: 1; /* Dashboard.vue의 right-side 비율과 일치 */
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.month-nav h2 {
  font-size: 36px;
  font-weight: 800;
  color: #1a1a1a;
  min-width: 90px;
  text-align: center;
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

.compare-toggle-btn {
  margin-left: auto;
  padding: 10px 18px;
  border-radius: 20px;
  border: 1.5px solid var(--color-primary, #4caf50);
  background: white;
  color: var(--color-primary, #4caf50);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.compare-toggle-btn.active {
  background: var(--color-primary, #4caf50);
  color: white;
}

.monthly-message {
  background: #f0faf0;
  color: #4caf50;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 20px;
  border: 1px solid #c8e6c9;
  max-width: 100%;
}

@media (max-width: 768px) {
  .summary {
    padding: 4px 0 0;
  }

  .page-title {
    font-size: 12px;
    margin-bottom: 8px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .month-nav h2 {
    font-size: 34px;
    min-width: auto;
  }

  .month-nav button {
    width: 28px;
    height: 28px;
    border: none;
    background: #f2f4f6;
  }

  .compare-toggle-btn {
    margin-left: 0;
    width: 100%;
  }

  .month-nav button:hover {
    background: #f2f4f6;
    color: #555;
    transform: none;
  }

  .monthly-message {
    font-size: 11px;
    font-weight: 700;
    padding: 7px 12px;
    border-radius: 999px;
    line-height: 1.4;
  }
}
</style>
