<script setup>
import { computed } from 'vue';
const props = defineProps(['currentMonth', 'selectedDate']);
const emit = defineEmits(['dateClick']);

const calendarDays = computed(() => {
  const days = [];
  const year = props.currentMonth.getFullYear();
  const month = props.currentMonth.getMonth();
  const firstDayIdx = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const prevLastDate = new Date(year, month, 0).getDate();

  for (let i = firstDayIdx - 1; i >= 0; i--) {
    days.push({ day: prevLastDate - i, type: 'prev' });
  }
  for (let d = 1; d <= lastDate; d++) {
    days.push({ day: d, type: 'current', fullDate: new Date(year, month, d) });
  }
  const nextFill = 42 - days.length;
  for (let i = 1; i <= nextFill; i++) {
    days.push({ day: i, type: 'next' });
  }
  return days;
});

const isSelected = (date) => props.selectedDate?.toDateString() === date?.toDateString();
</script>

<template>
  <div class="board-container">
    <div class="grid">
      <div v-for="lb in ['일','월','화','수','목','금','토']" :key="lb" class="label subtitle-m">
        {{ lb }}
      </div>
      <div
          v-for="(item, idx) in calendarDays" :key="idx"
          class="cell"
          :class="[item.type, { active: item.fullDate && isSelected(item.fullDate) }]"
          @click="item.fullDate && emit('dateClick', item.fullDate)"
      >
        <span class="num body-m">{{ item.day }}</span>
        <div class="dot-group" v-if="item.type === 'current'">
          <div v-if="item.day % 5 === 0" class="dot bg-red"></div>
          <div v-if="item.day % 3 === 0" class="dot bg-blue"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board-container {
  background: var(--color-white);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--drop--shadow);
}
.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: var(--color-deepgray-10);
}
.label {
  padding: 16px;
  text-align: center;
  background-color: var(--color-white);
  color: var(--color-deepgray-60);
}
.cell {
  min-height: clamp(100px, 15vh, 160px);
  padding: 12px;
  background-color: var(--color-white);
  cursor: pointer;
}
.prev, .next {
  background-color: var(--color-gray-10);
  color: var(--color-deepgray-40);
  cursor: default;
}
.active .num {
  background-color: var(--color-primary);
  color: var(--color-white);
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
}
.dot-group { display: flex; gap: 4px; margin-top: 8px; }
.dot { width: 6px; height: 6px; border-radius: 50%; }
.bg-red { background-color: var(--category-red); }
.bg-blue { background-color: var(--category-blue); }
</style>