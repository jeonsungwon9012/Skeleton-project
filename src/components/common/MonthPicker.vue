<!--MonthPicker.vue-->
<script setup>
import { computed } from 'vue';

const props = defineProps({
  //부모로부터 현재 선택한 날짜 데이터 받아옴
  currentMonth: Date
});

//사용자가 버튼 클릭시 월 변경  요청
const emit = defineEmits(['change']);

const formattedDate = computed(() => {
  const now = new Date();
  const d = props.currentMonth;
  const isCurrentYear = now.getFullYear() === d.getFullYear();

  return isCurrentYear
      ? `${d.getMonth() + 1}월`
      : `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
});
</script>

<template>
  <div class="month-picker">
    <button class="nav-btn h4" @click="$emit('change', -1)">◀</button>
    <h2 class="h3">{{ formattedDate }}</h2>
    <button class="nav-btn h4" @click="$emit('change', 1)">▶</button>
  </div>
</template>

<style scoped>
.month-picker {
  display: flex;
  align-items: center;
  gap: 24px;
}
.color-title { color: var(--color-deepgray-100); }
.nav-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--button--m);
  transition: background 0.2s;
}
.nav-btn:hover { background-color: var(--color-primary-80); }
</style>