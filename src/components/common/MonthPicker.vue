<script setup>
const props = defineProps(['currentMonth']);
const emit = defineEmits(['updateMonth']);

const changeMonth = (diff) => {
  const newDate = new Date(props.currentMonth.getFullYear(), props.currentMonth.getMonth() + diff, 1);
  emit('updateMonth', newDate);
};
</script>

<template>
  <div class="month-picker">
    <button @click="changeMonth(-1)" class="nav-btn">◀</button>
    <h2 class="h2 color-title">{{ currentMonth.getFullYear() }}년 {{ currentMonth.getMonth() + 1 }}월</h2>
    <button @click="changeMonth(1)" class="nav-btn">▶</button>
  </div>
</template>

<style scoped>
.month-picker {
  display: flex;
  align-items: center;
  gap: 24px;
  justify-content: center;
  margin-bottom: 32px;
}
.color-title { color: var(--color-deepgray-100); }
.nav-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  cursor: pointer;s
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--button--m);
  transition: background 0.2s;
}
.nav-btn:hover { background-color: var(--color-primary-80); }
</style>