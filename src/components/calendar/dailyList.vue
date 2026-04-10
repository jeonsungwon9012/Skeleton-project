<script setup>
import { computed } from "vue";
import { useBudgetStore } from "@/stores/budgetStore.js";

const props = defineProps({ items: Array, total: Object, dates: Array })
const budgetStore = useBudgetStore();

// 💡 '2026-04-03' -> '04월 03일'로 변환하는 함수
const formatDateLabel = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${month}월 ${day}일`; // 문자열 그대로 사용하여 04월 형식 유지함
}

// 가계부 작성 로직 (선택된 모든 날짜 반복)
const handleWrite = () => {
  if (props.dates.length === 0) return;

  props.dates.forEach(date => {
    console.log(`${date} 날짜 내역 추가 시도 🚀`);
    // budgetStore.addTransaction({...}) 호출부
  });

  alert(`${props.dates.length}개 날짜 가계부 작성 시작`);
}

// 버튼 텍스트 고정
const buttonText = computed(() => '선택한 날짜로 가계부 쓰기 ✏️');
</script>

<template>
  <div class="daily-list">
    <header class="list-header">
      <h3 class="h5 date-title">
        {{ dates.length > 1
          ? `${formatDateLabel(dates[0])} 외 ${dates.length - 1}일`
          : formatDateLabel(dates[0])
        }} 내역
      </h3>
      <div class="summary subtitle-s">
        <span class="income-text">+{{ total.income.toLocaleString() }}</span>
        <span class="expense-text"> -{{ total.expense.toLocaleString() }}</span>
      </div>
    </header>

    <ul class="list-body">
      <li v-for="item in items" :key="item.id" class="body-s item">
        <div class="item-info">
          <span class="memo">{{ item.memo }}</span>
        </div>
        <span :class="['amount', item.type]">
          {{ item.amount.toLocaleString() }}원
        </span>
      </li>

      <li v-if="items.length === 0" class="empty-list body-s">
        선택한 날짜에 내역이 없어요 🍐
      </li>
    </ul>

    <button class="write-btn btn-m" @click="handleWrite">
      {{ buttonText }}
    </button>
  </div>
</template>

<style scoped>
/* 이전 스타일과 동일 */
.daily-list {
  background: var(--color-white);
  padding: 24px;
  border-radius: 16px;
  box-shadow: var(--drop--shadow);
  display: flex;
  flex-direction: column;
  height: 500px;
}
.list-header { margin-bottom: 20px; border-bottom: 2px solid var(--color-gray-10); padding-bottom: 12px; }
.date-title { color: var(--color-deepgray-100); margin-bottom: 8px; }
.summary { display: flex; gap: 12px; }
.income-text { color: var(--color-primary); font-weight: 600; }
.expense-text { color: var(--color-sub-100); font-weight: 600; }
.list-body { flex: 1; overflow-y: auto; margin-bottom: 16px; padding: 0; list-style: none; }
.list-body::-webkit-scrollbar { width: 4px; }
.list-body::-webkit-scrollbar-thumb { background: var(--color-deepgray-10); border-radius: 10px; }
.item { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--color-gray-10); }
.amount.income { color: var(--color-primary); }
.amount.expense { color: var(--color-sub-100); }
.empty-list { text-align: center; color: var(--color-deepgray-40); padding: 40px 0; }
.write-btn { background: var(--color-primary); color: var(--color-white); border: none; padding: 16px; border-radius: 12px; cursor: pointer; width: 100%; transition: 0.2s; font-weight: 600; }
.write-btn:hover { filter: brightness(0.9); }
</style>