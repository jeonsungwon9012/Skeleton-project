import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDashboardStore = defineStore('dashboard', () => {
  const currentMonth = ref(new Date().getMonth() + 1)
  const currentYear = ref(new Date().getFullYear())

  const prevMonth = () => {
    if (currentMonth.value === 1) {
      currentMonth.value = 12
      currentYear.value -= 1
    } else {
      currentMonth.value -= 1
    }
  }

  const nextMonth = () => {
    if (currentMonth.value === 12) {
      currentMonth.value = 1
      currentYear.value += 1
    } else {
      currentMonth.value += 1
    }
  }

  return { currentMonth, currentYear, prevMonth, nextMonth }
})