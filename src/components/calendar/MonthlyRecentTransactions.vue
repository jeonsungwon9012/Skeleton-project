
<script setup>
// 부모로부터 사용자 클릭 정보 받아옴
defineProps({
  items: Array, // (이번달 내역 내림차순 데이터) budgetStore.monthlyRecentTransactions를 받음
  categoryId: Number
});
</script>

<template>
  <div class="recent-list">
    <h3>이달의 최신 내역</h3>
    <ul>
      <li v-for="item in items" :key="item.id" class="transaction-item">
        <div class="info">
          <p class="date">{{ item.date }}</p>
          <p class="memo">{{ item.memo }}</p>
        </div>
        <p class="amount" :class="item.type">{{ item.amount.toLocaleString() }}원</p>
      </li>
    </ul>
  </div>
</template>