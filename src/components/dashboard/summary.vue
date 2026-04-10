<template>
  <div class="dashboard">
    <p class="page-title">대시보드</p>

    <!-- 헤더 -->
    <div class="header">
      <div class="month-nav">
        <button @click="prevMonth">
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
        <h2>{{ currentMonth }}월</h2>
        <button @click="nextMonth">
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

      <!-- 한 줄 메시지 -->
      <div class="monthly-message">
        ☕ {{ currentMonth }}월의 나는 커피 마니아!
      </div>
    </div>

    <!-- 카드 3개 -->
    <div class="cards">
      <div class="card">
        <div class="card-icon">⬚</div>
        <p class="card-label expense">이번 달 지출</p>
        <p class="card-value">320,000원</p>
      </div>
      <div class="card">
        <div class="card-icon">⬚</div>
        <p class="card-label income">이번 달 수입</p>
        <p class="card-value">1,500,000원</p>
      </div>
      <div class="card">
        <div class="card-icon">⬚</div>
        <div class="card-badge">지난달 8일보다 8%↑</div>
        <p class="card-label net">이번달 순 수익</p>
        <p class="card-value">1,180,000원</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const currentMonth = ref(new Date().getMonth() + 1);

const prevMonth = () => {
  currentMonth.value = currentMonth.value === 1 ? 12 : currentMonth.value - 1;
};
const nextMonth = () => {
  currentMonth.value = currentMonth.value === 12 ? 1 : currentMonth.value + 1;
};
</script>

<style scoped>
.dashboard {
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
  margin-bottom: 32px;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 10px;
}

.month-nav h2 {
  font-size: 36px;
  font-weight: 800;
  color: #1a1a1a;
  min-width: 80px;
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

/* 카드 */
.cards {
  display: flex;
  gap: 24px;
}

.card {
  flex: 1;
  background: #fff;
  border: 1.5px solid #f0f0f0;
  border-radius: 16px;
  padding: 20px 24px;
  position: relative;
  transition: box-shadow 0.2s;
}
.card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
}

.card-icon {
  font-size: 22px;
  margin-bottom: 12px;
  color: #ccc;
}

.card-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 11px;
  color: #4caf50;
  background: #f0faf0;
  padding: 3px 8px;
  border-radius: 10px;
}

.card-label {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
}
.card-label.expense {
  color: #e74c3c;
}
.card-label.income {
  color: #4caf50;
}
.card-label.net {
  color: #3498db;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}
</style>
