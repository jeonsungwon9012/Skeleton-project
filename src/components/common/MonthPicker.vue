<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentMonth: Date,
});

defineEmits(['change']);

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
  max-width: 100%;
  box-sizing: border-box;
}

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

.nav-btn:hover {
  background-color: var(--color-primary-80);
}

@media (max-width: 768px) {
  .month-picker {
    width: 100%;
    justify-content: center;
    gap: 14px;
    padding: 0;
  }

  .month-picker h2 {
    font-size: 1.25rem;
  }

  .nav-btn {
    width: 34px;
    height: 34px;
    font-size: 1rem;
    flex-shrink: 0;
  }
}
</style>
