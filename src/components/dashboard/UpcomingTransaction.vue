<template>
  <div class="planned-list">
    <h3 class="title">예정된 거래 내역</h3>
    <ul>
      <li v-for="item in upcomingList" :key="item.id" class="item">
        <span class="img">{{ item.categoryImg }}</span>
        <div class="detail-wrap">
          <span class="detail">{{ item.detail }}</span>
          <span class="category">{{ item.category }}</span>
        </div>
        <span
          class="amount"
          :class="{
            negative: item.type === 'expense',
            positive: item.type === 'income',
          }"
        >
          {{ item.type === 'expense' ? '-' : '+' }}{{ item.amount.toLocaleString() }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useTransactionStore } from '@/stores/budgetStore';

const store = useTransactionStore();

onMounted(() => store.loadData());

const upcomingList = computed(() => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  return [...store.myBudgets]
    .filter((item) => new Date(item.date) > today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);
});
</script>

<style scoped>
.planned-list {
  padding: 0;
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

.img {
  flex-shrink: 0;
}

.detail-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail {
  font-size: 14px;
  word-break: keep-all;
}

.amount {
  font-size: 14px;
  font-weight: 500;
  flex-shrink: 0;
}

.amount.negative {
  color: #e74c3c;
}

.amount.positive {
  color: #4caf50;
}

.category {
  font-size: 13px;
  color: #aaa;
}

@media (max-width: 768px) {
  .title {
    font-size: 12px;
    margin-bottom: 10px;
  }

  .item {
    gap: 10px;
    padding: 12px 0;
  }

  .detail {
    font-size: 13px;
  }

  .amount {
    font-size: 13px;
  }

  .category {
    font-size: 11px;
  }
}
</style>
