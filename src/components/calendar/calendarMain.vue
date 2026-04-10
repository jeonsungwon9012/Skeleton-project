<script setup>
import {onMounted} from "vue";
import { storeToRefs } from 'pinia'
//피니아 store import
import { useBudgetStore } from "@/stores/budgetStore.js";
import MonthPicker from "@/components/common/MonthPicker.vue";
import CategoryFilter from "@/components/common/CategoryFilter.vue";
import CalendarBoard from "@/components/calendar/calendarBoard.vue";
import DailyList from "@/components/calendar/dailyList.vue";
import MonthlyRecentTransactions from "@/components/calendar/MonthlyRecentTransactions.vue";

//store 사용 선언
const budgetStore = useBudgetStore();

//Stete & Getters 반응형으로 가져오기
const {
  currentMonth, selectedDates, selectedCategories, selectedType, isScheduledOnly,
  calendarDots, rangeBudgets, monthlyRecentTransactions, selectedTotal
} = storeToRefs(budgetStore)

//Actions 가져오기
const {
  changeMonth, toggleCategory, toggleDate,
  setTransactionType, toggleScheduled, resetFilters
} = budgetStore


onMounted(()=>{
  budgetStore.fetchData()
})

//날짜 클릭 시 스토어 selectedDate 업데이트

// const handleMonthUpdate = (newMonth) => {
//   currentMonth.value = newMonth;
//   selectedDate.value = null; // 달이 바뀌면 상세 내역 닫기
// };
//
// const handleDateClick = (date) => {
//   selectedDate.value = date;
// };
</script>

<template>
  <div class="calendar-main" style="background-color: var(--color-background); min-height: 100vh;">
    <header class="p-4">
      <MonthPicker
          :current-month="currentMonth"
          @change="changeMonth"
      />
      <CategoryFilter
          :selected-categories="selectedCategories"
          :selected-type="selectedType"
          :is-scheduled-only="isScheduledOnly"
          @select-type="budgetStore.setTransactionType"
          @toggle-category="budgetStore.toggleCategory"
          @toggle-scheduled="budgetStore.toggleScheduled"
          @select-all="budgetStore.resetFilters"
      />

    </header>

    <main class="content-wrapper">
      <section class="calendar-area">
        <CalendarBoard
            :dots="calendarDots"
            :selected-dates="selectedDates"
            @click-date="toggleDate"
        />
      </section>

      <section class="list-area">
        <DailyList
            v-if="selectedDates.length > 0"
            :items="rangeBudgets"
            :total="selectedTotal"
            :dates="selectedDates"
        />
        <MonthlyRecentTransactions
            v-else-if="selectedCategories.length > 0"
            :items="monthlyRecentTransactions"
        />
        <div v-else class="empty-guide h5 caption">
          날짜나 카테고리를 선택해 보세요 🍐
        </div>
      </section>
    </main>
  </div>
</template>


<style scoped>
.calendar-main {
  background-color: var(--color-background);
  min-height: 100vh;
  padding: 20px;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto 20px;
}

.content-wrapper {
  display: flex;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  align-items: flex-start; /* 💡 높이가 달라도 위쪽 정렬 */
}

.calendar-area {
  flex: 1.5; /* 달력을 좀 더 넓게 */
  background: var(--color-white);
  border-radius: 16px;
  box-shadow: var(--drop--shadow);
}

.list-area {
  flex: 1;
  min-width: 380px;
}

.empty-guide {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  background: var(--color-white);
  border-radius: 16px;
  box-shadow: var(--drop--shadow);
  text-align: center;
}
</style>
