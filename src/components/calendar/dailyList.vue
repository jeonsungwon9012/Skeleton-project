<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useBudgetStore } from "@/stores/budgetStore2.js"; // 💡 스토어 임포트

const props = defineProps({
  items: { type: Array, default: () => [] }, // 스토어의 rangeBudgets
  dates: { type: Array, default: () => [] }, // 선택된 날짜
  total: { type: Object, default: () => ({ income: 0, expense: 0 }) }
});

const router = useRouter();
const budgetStore = useBudgetStore(); // 💡 카테고리 맵을 쓰기 위해 선언

// 1. 날짜 포맷팅 (예: 4월 1일 (수))
const formattedDate = computed(() => {
  if (!props.dates[0]) return '';
  const date = new Date(props.dates[0]);
  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
});

/**
 * 💡 [핵심 로직] 카테고리별로 내역 묶기
 * - item.cid를 사용해 budgetStore.categoryMap에서 카테고리 정보를 찾아옵니다.
 */
const groupedItems = computed(() => {
  return props.items.reduce((acc, cur) => {
    // 💡 cid를 통해 카테고리 이름(name)을 가져옴
    const categoryName = budgetStore.categoryMap[cur.cid]?.name || '기타';
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(cur);
    return acc;
  }, {});
});

// 2. 가장 많이 지출한 카테고리 메시지용
const topCategoryName = computed(() => {
  if (props.items.length === 0) return null;
  const expenseItems = props.items.filter(i => i.type === 'expense');
  if (expenseItems.length === 0) return null;

  const totals = expenseItems.reduce((acc, cur) => {
    const catName = budgetStore.categoryMap[cur.cid]?.name || '기타';
    acc[catName] = (acc[catName] || 0) + cur.amount;
    return acc;
  }, {});

  return Object.keys(totals).reduce((a, b) => totals[a] > totals[b] ? a : b);
});

// 금액 포맷팅
const formatPrice = (price) => price?.toLocaleString() + ' 원';

// 가계부 추가 페이지 이동
const goToAdd = () => {
  router.push({ path: '/addTransaction', query: { date: props.dates[0] } });
};
</script>

<template>
  <div class="daily-list-card">
    <header class="list-header">
      <h2 class="date-title h3">{{ formattedDate }}</h2>
      <p v-if="topCategoryName" class="status-msg body-m">
        {{ topCategoryName }}에 평소보다 많이 썼어요!
      </p>
    </header>

    <div class="summary-chips">
      <div class="chip expense body-m">
        <span>😡 총 지출</span> <span class="amount">{{ formatPrice(total.expense) }}</span>
      </div>
      <div class="chip income body-m">
        <span>😊 총 수입</span> <span class="amount">{{ formatPrice(total.income) }}</span>
      </div>
    </div>

    <hr class="divider" />

    <div class="list-content">
      <h3 class="section-title subtitle-m">카테고리별 내역</h3>

      <div v-for="(list, categoryName) in groupedItems" :key="categoryName" class="category-group">
        <div class="category-badge subtitle-s"
             :style="{ color: budgetStore.categoryMap[list[0].cid]?.color }">
          <span class="emoji">{{ budgetStore.categoryMap[list[0].cid]?.img || '❓' }}</span>
          {{ categoryName }}
        </div>

        <ul class="transaction-items">
          <li v-for="item in list" :key="item.id" class="item-row">
            <span class="item-name body-m">{{ item.detail }}</span>
            <div class="item-right">
              <span class="item-amount body-m" :class="item.type">
                {{ item.type === 'expense' ? '-' : '+' }} {{ formatPrice(item.amount) }}
              </span>
              <button class="more-btn">⋮</button>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <button class="add-btn btn-m" @click="goToAdd">
      이 날짜로 가계부 추가하기
      <span class="plus-circle">+</span>
    </button>
  </div>
</template>

<style scoped>
.daily-list-card {
  background-color: var(--color-gray-10); /* 소연님 변수 적용 */
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 600px;
  box-shadow: var(--drop--shadow);
}

.list-header { margin-bottom: 24px; }
.date-title { color: var(--color-deepgray-100); margin-bottom: 4px; }
.status-msg { color: var(--color-deepgray-60); }

.summary-chips { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
.chip {
  background: var(--color-white);
  padding: 12px 20px;
  border-radius: 99px;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.divider { border: 0; border-top: 1px solid var(--color-deepgray-10); margin-bottom: 24px; }

.list-content { flex: 1; overflow-y: auto; padding-right: 8px; }
.section-title { margin-bottom: 16px; color: var(--color-deepgray-100); }

.category-group { margin-bottom: 28px; }
.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--color-white);
  padding: 6px 16px;
  border-radius: 99px;
  margin-bottom: 12px;
}

.item-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; }
.item-right { display: flex; align-items: center; gap: 14px; }
.item-amount.expense { color: var(--color-deepgray-100); }
.item-amount.income { color: var(--color-primary); font-weight: 600; }

.add-btn {
  margin-top: 16px;
  background-color: var(--color-white);
  border: none;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}
.plus-circle {
  width: 28px; height: 28px;
  background-color: var(--color-deepgray-100);
  color: var(--color-white);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

/* 스크롤바 커스텀 */
.list-content::-webkit-scrollbar { width: 4px; }
.list-content::-webkit-scrollbar-thumb { background: var(--color-deepgray-20); border-radius: 10px; }
</style>