<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import MonthPicker from '../common/MonthPicker.vue';
import CalendarBoard from './calendarBoard.vue';
import DailyList from './dailyList.vue';
//pinia store
import { useCounterStore} from "@/stores/useDateStore.js";
// import CalendarSummary from './calendarSummary.vue';

//store 사용 선언
const store = useCounterStore();

//페이지 열리자마자 fetchAllData함수 실행 (db.json 데이터 가져오기)
onMounted(()=>{
  store.fetchAllData();
})

//날짜 클릭 시 스토어 selectedDate 업데이트


const handleMonthUpdate = (newMonth) => {
  currentMonth.value = newMonth;
  selectedDate.value = null; // 달이 바뀌면 상세 내역 닫기
};

const handleDateClick = (date) => {
  selectedDate.value = date;
};
</script>

<template>
  <div class="calendar-main-container">
    <section class="calendar-section">
      <MonthPicker
          :currentMonth="currentMonth"
          @updateMonth="handleMonthUpdate"
      />
      <CalendarBoard
          :currentMonth="currentMonth"
          :selectedDate="selectedDate"
          @dateClick="handleDateClick"
      />
    </section>

    <aside class="info-section">
      <transition name="fade" mode="out-in">
        <DailyList
            v-if="selectedDate"
            :key="selectedDate.toISOString()"
            :date="selectedDate"
        />
        <CalendarSummary
            v-else
            :month="currentMonth"
        />
      </transition>
    </aside>
  </div>
</template>

<style scoped>
.calendar-main-container {
  display: flex;
  gap: 32px;
  width: 100%;
  align-items: flex-start;
}

.calendar-section {
  flex: 2.5; /* 달력을 더 넓게 */
  min-width: 0;
}

.info-section {
  flex: 1;
  min-width: 320px;
  position: sticky;
  top: 24px;
}

/* 애니메이션 효과 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 1200px) {
  .calendar-main-container { flex-direction: column; }
  .info-section { width: 100%; min-width: 0; position: static; }
}
</style>