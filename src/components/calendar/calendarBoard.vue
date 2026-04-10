<script setup>
import { useBudgetStore } from "@/stores/budgetStore.js"; // 💡 스토어 가져오기

const props = defineProps({ dots: Array, selectedDates: Array })
const emit = defineEmits(['click-date'])

const budgetStore = useBudgetStore(); // 💡 스토어 사용 선언

// 날짜 포맷 함수 (YYYY-MM-DD)
const formatDate = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

const handleDayClick = (event, date) => emit('click-date', date, event.shiftKey)

/**
 * 💡 [핵심 함수] 카테고리 ID로 실제 색상 코드를 찾아주는 함수임
 * dot.cid를 받아서 budgetStore.categories 배열에서 일치하는 색상을 찾음
 */
const getCategoryColor = (cid) => {
  // db.json의 CATEGORY 배열에서 id가 일치하는 녀석을 찾음
  const category = budgetStore.categories.find(c => Number(c.id) === Number(cid));

  // 찾으면 그 카테고리의 color(#xxxxxx)를 주고, 못 찾으면 기본 회색을 줌
  return category ? category.color : '#90A4AE';
}

// 2026년 4월 기준 그리드 배열
const prevMonthDays = [29, 30, 31];
const currentMonthDays = Array.from({ length: 30 }, (_, i) => i + 1);
const nextMonthDays = [1, 2, 3, 4];
</script>

<template>
  <div class="calendar-card">
    <div class="days-header subtitle-s">
      <span v-for="d in ['일','월','화','수','목','금','토']" :key="d">{{ d }}</span>
    </div>

    <div class="grid">
      <div v-for="day in prevMonthDays" :key="'p'+day" class="cell other-month"
           :class="{ 'is-selected': selectedDates.includes(formatDate(2026, 3, day)) }"
           @click="handleDayClick($event, formatDate(2026, 3, day))">
        <span class="date-num">{{ day }}</span>
      </div>

      <div v-for="day in currentMonthDays" :key="'c'+day" class="cell"
           :class="{ 'is-selected': selectedDates.includes(formatDate(2026, 4, day)) }"
           @click="handleDayClick($event, formatDate(2026, 4, day))">
        <span class="date-num">{{ day }}</span>

        <div class="dots-container">
          <div v-for="dot in dots.filter(d => d.date === formatDate(2026, 4, day))"
               :key="dot.id"
               class="dot"
               :style="{ backgroundColor: getCategoryColor(dot.cid) }">
          </div>
        </div>
      </div>

      <div v-for="day in nextMonthDays" :key="'n'+day" class="cell other-month"
           :class="{ 'is-selected': selectedDates.includes(formatDate(2026, 5, day)) }"
           @click="handleDayClick($event, formatDate(2026, 5, day))">
        <span class="date-num">{{ day }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-card { background: white; border-radius: 16px; box-shadow: var(--drop--shadow); min-width: 700px; overflow: hidden; }
.days-header { display: grid; grid-template-columns: repeat(7, 1fr); background: var(--color-gray-10); padding: 14px 0; text-align: center; }
.grid { display: grid; grid-template-columns: repeat(7, 1fr); }
.cell { min-height: 120px; padding: 12px; border-bottom: 1px solid var(--color-gray-10); cursor: pointer; display: flex; flex-direction: column; align-items: flex-start; }
.date-num { width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; }
.cell.is-selected .date-num { background: var(--color-primary) !important; color: white !important; font-weight: 700; }
.dots-container { display: flex; gap: 4px; flex-wrap: wrap; margin-top: auto; }
.dot { width: 7px; height: 7px; border-radius: 50%; transition: transform 0.2s; }
</style>