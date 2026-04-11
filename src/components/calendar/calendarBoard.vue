<script setup>
import { computed } from 'vue';
import { useBudgetStore } from "@/stores/budgetStore2.js";

const props = defineProps({
  dots: Array,
  selectedDates: Array
})
const emit = defineEmits(['click-date'])

const budgetStore = useBudgetStore();

/**
 * 💡 [로직] 현재 월 기준 날짜 계산 (5주/6주 유동적 대응)
 */
const calendarDays = computed(() => {
  const year = budgetStore.currentMonth.getFullYear();
  const month = budgetStore.currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days = [];
  const startDayOfWeek = firstDay.getDay();

  const prevLastDay = new Date(year, month, 0);
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevLastDay.getDate() - i);
    days.push({ date: formatDateObj(d), num: d.getDate(), isCurrent: false });
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    days.push({ date: formatDateObj(d), num: i, isCurrent: true });
  }

  const targetLength = days.length > 35 ? 42 : 35;
  const remaining = targetLength - days.length;

  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    days.push({ date: formatDateObj(d), num: i, isCurrent: false });
  }

  return days;
});

function formatDateObj(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const handleDayClick = (event, date) => emit('click-date', date, event.shiftKey)

/**
 * 🎨 카테고리 컬러 매핑
 */
const getCategoryColor = (cid) => {
  const category = budgetStore.categories.find(c => Number(c.id) === Number(cid));
  // DB에 컬러가 지정되어 있지 않다면 '기타' 카테고리 변수 사용
  return category ? category.color : 'var(--category-gray)';
}
</script>

<template>
  <div class="calendar-card">
    <div class="days-header subtitle-s">
      <span v-for="(d, idx) in ['일','월','화','수','목','금','토']"
            :key="d"
            :class="{ 'sun': idx === 0 }">{{ d }}</span>
    </div>

    <div class="grid">
      <div v-for="(day, index) in calendarDays" :key="index"
           class="cell"
           :class="{
             'other-month': !day.isCurrent,
             'is-selected': selectedDates.includes(day.date)
           }"
           @click="handleDayClick($event, day.date)">

        <span class="date-num body-m">{{ day.num }}</span>

        <div class="dots-container">
          <div v-for="dot in dots.filter(d => d.date === day.date)"
               :key="dot.id"
               class="dot"
               :style="{ backgroundColor: getCategoryColor(dot.cid) }">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-card {
  background-color: var(--color-white);
  border-radius: 16px;
  box-shadow: var(--drop--shadow);
  min-width: 700px;
  overflow: hidden;
  font-family: var(--font-main);
}

.days-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: var(--color-gray-10);
  padding: 14px 0;
  text-align: center;
  color: var(--color-deepgray-100);
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.cell {
  min-height: 120px;
  padding: 12px;
  border-bottom: 1px solid var(--color-gray-10);
  border-right: 1px solid var(--color-gray-10);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: var(--color-white);
  transition: background-color 0.2s ease;
}

.cell:nth-child(7n) { border-right: none; }

/* 💡 [영역 선택] Primary-10 컬러 반영 */
.cell.is-selected {
  background-color: var(--color-primary-10);
}

.date-num {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--color-deepgray-100);
}

/* 💡 [숫자 강조] Primary 컬러와 White 반영 */
.cell.is-selected .date-num {
  background-color: var(--color-primary) !important;
  color: var(--color-white) !important;
  font-weight: 700;
}

/* 다른 달 날짜: Background 및 DeepGray-40 반영 */
.other-month {
  color: var(--color-deepgray-40);
  background-color: var(--color-background);
}

/* 일요일: Category Red 반영 */
.sun { color: var(--category-red); }

.dots-container {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: auto;
  padding-bottom: 4px;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
</style>