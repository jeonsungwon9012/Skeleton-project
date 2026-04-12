<template>
  <div class="planned-list">
    <h3 class="title">예정된 거래 항목</h3>
    <ul>
      <li v-for="item in upcomingList" :key="item.id" class="item">
        <span class="img">{{ item.categoryImg }}</span>
        <span class="detail">{{ item.detail }}</span>
        <span
          class="amount"
          :class="{
            negative: item.type === 'expense',
            positive: item.type === 'income',
          }"
        >
          {{ item.type === 'expense' ? '-' : '+'
          }}{{ item.amount.toLocaleString() }}
        </span>
        <span class="category">{{ item.category }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useTransactionStore } from '@/stores/budgetStore';
import { useDashboardStore } from '@/stores/dashboard';
import { computed } from 'vue';

const store = useTransactionStore();
const dashboard = useDashboardStore();

onMounted(() => store.loadData());

const upcomingList = computed(() => {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // 오늘 자정 이후부터 체크

  // 💡 오늘 이후의 데이터만 필터링 -> 날짜 오름차순(가까운 순) 정렬 -> 5개 추출
  return store.myBudgets
    .filter((item) => new Date(item.date) > today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);
});
</script>

<style scoped>
.planned-list {
  padding: 16px;
}

.title {
  font-size: 14px;
  color: #888;
  margin-bottom: 12px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail {
  flex: 1;
  font-size: 14px;
}

.amount {
  font-size: 14px;
  font-weight: 500;
}

.amount.negative {
  color: #e74c3c;
}

.category {
  font-size: 13px;
  color: #aaa;
}
</style>
