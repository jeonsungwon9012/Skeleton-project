<script setup>
import { computed } from 'vue';
import { useBudgetStore } from '@/stores/budgetStore2.js';

defineProps({
  dots: Array,
  selectedDates: Array,
});

const emit = defineEmits(['click-date']);
const budgetStore = useBudgetStore();

const calendarDays = computed(() => {
  const year = budgetStore.currentMonth.getFullYear();
  const month = budgetStore.currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  const startDayOfWeek = firstDay.getDay();

  const prevLastDay = new Date(year, month, 0);
  for (let i = startDayOfWeek - 1; i >= 0; i -= 1) {
    const d = new Date(year, month - 1, prevLastDay.getDate() - i);
    days.push({ date: formatDateObj(d), num: d.getDate(), isCurrent: false });
  }

  for (let i = 1; i <= lastDay.getDate(); i += 1) {
    const d = new Date(year, month, i);
    days.push({ date: formatDateObj(d), num: i, isCurrent: true });
  }

  const targetLength = days.length > 35 ? 42 : 35;
  const remaining = targetLength - days.length;

  for (let i = 1; i <= remaining; i += 1) {
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

const handleDayClick = (event, date) => {
  emit('click-date', date, event.ctrlKey || event.metaKey, event.shiftKey);
};

const getCategoryColor = (cid) => {
  const category = budgetStore.categories.find((item) => Number(item.id) === Number(cid));
  return category ? category.color : 'var(--category-gray)';
};
</script>

<template>
  <div class="calendar-card">
    <div class="days-header subtitle-s">
      <span
        v-for="(day, index) in ['일', '월', '화', '수', '목', '금', '토']"
        :key="day"
        :class="{ sun: index === 0 }"
      >
        {{ day }}
      </span>
    </div>

    <div class="grid">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="cell"
        :class="{
          'other-month': !day.isCurrent,
          'is-selected': selectedDates.includes(day.date),
        }"
        @click="handleDayClick($event, day.date)"
      >
        <span class="date-num body-m">{{ day.num }}</span>

        <div class="dots-container">
          <div
            v-for="dot in dots.filter((item) => item.date === day.date)"
            :key="dot.id"
            class="dot"
            :style="{ backgroundColor: getCategoryColor(dot.cid) }"
          ></div>
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

.cell:nth-child(7n) {
  border-right: none;
}

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

.cell.is-selected .date-num {
  background-color: var(--color-primary) !important;
  color: var(--color-white) !important;
  font-weight: 700;
}

.other-month {
  color: var(--color-deepgray-40);
  background-color: var(--color-background);
}

.sun {
  color: var(--category-red);
}

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

@media (max-width: 768px) {
  .calendar-card {
    min-width: 0;
    width: 100%;
    border-radius: 24px;
  }

  .days-header {
    padding: 12px 0;
    font-size: 0.75rem;
    background: transparent;
  }

  .cell {
    min-height: 64px;
    padding: 8px 6px;
    align-items: center;
  }

  .date-num {
    width: 30px;
    height: 30px;
    font-size: 0.92rem;
  }

  .dots-container {
    margin-top: 6px;
    justify-content: center;
    min-height: 12px;
    padding-bottom: 0;
  }

  .dot {
    width: 5px;
    height: 5px;
  }
}
</style>
