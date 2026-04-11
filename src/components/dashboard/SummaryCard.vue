<template>
  <div class="cards">
    <div class="card">
      <div class="card-icon">📉</div>
      <p class="card-label expense">이번 달 지출</p>
      <p class="card-value">{{ summary.expense.toLocaleString() }}원</p>
    </div>
    <div class="card">
      <div class="card-icon">📈</div>
      <p class="card-label income">이번 달 수입</p>
      <p class="card-value">{{ summary.income.toLocaleString() }}원</p>
    </div>
    <div class="card">
      <div class="card-icon">💰</div>
      <p class="card-label net">이번달 순 수익</p>
      <p class="card-value">{{ summary.net.toLocaleString() }}원</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useTransactionStore } from '@/stores/budgetStore';
import { useDashboardStore } from '@/stores/dashboard';

const store = useTransactionStore();
const dashboard = useDashboardStore();

onMounted(() => store.loadData());

const summary = computed(() => store.getMonthlySummary(dashboard.currentMonth));
</script>

<style scoped>
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
