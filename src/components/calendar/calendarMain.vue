<script setup>
/**
 * [CalendarMain] 달력 페이지의 메인 오케스트레이터
 * - 모든 상태(State)는 Pinia Store에서 관리하고
 * - 하위 컴포넌트들에게 Props로 데이터를 전달하며
 * - 발생한 이벤트들을 스토어 액션으로 연결함
 */
import { onMounted } from "vue";
import { storeToRefs } from 'pinia';

// 💡 전역 상태 관리(Pinia) 및 컴포넌트 임포트
import { useBudgetStore } from "@/stores/budgetStore.js";
import MonthPicker from "@/components/common/MonthPicker.vue";
import CategoryFilter from "@/components/common/CategoryFilter.vue";
import CalendarBoard from "@/components/calendar/calendarBoard.vue";
import DailyList from "@/components/calendar/dailyList.vue";
import MonthlyRecentTransactions from "@/components/calendar/MonthlyRecentTransactions.vue";

// 1. 스토어 사용 선언
const budgetStore = useBudgetStore();

/**
 * 2. State & Getters 추출 (반응형 유지)
 * - storeToRefs를 사용해야 구조 분해 할당을 해도 UI가 실시간으로 바뀜
 * - [중요] categories: DB에서 가져온 진짜 카테고리 목록
 */
const {
  currentMonth,         // 현재 보고 있는 달 (Date 객체)
  categories,           // [DB 데이터] 식비, 카페 등 카테고리 배열
  selectedDates,        // 사용자가 클릭한 날짜들 (YYYY-MM-DD 형식)
  selectedCategories,   // 필터링 선택된 카테고리 ID들
  selectedType,         // 전체/수입/지출 필터링 상태
  isScheduledOnly,      // 예정 내역만 보기 여부
  calendarDots,         // 달력 셀 안에 찍힐 점들 데이터
  rangeBudgets,         // 선택한 날짜에 해당하는 상세 내역 리스트
  monthlyRecentTransactions, // 카테고리 클릭 시 보여줄 월간 내역
  selectedTotal         // 선택된 내역의 수입/지출 합계
} = storeToRefs(budgetStore)

/**
 * 3. Actions 추출 (로직 함수들)
 * - 액션은 반응형일 필요가 없으므로 스토어에서 바로 꺼내옴
 */
const {
  changeMonth,          // 월 변경 (이전/다음)
  toggleCategory,       // 카테고리 필터 토글
  toggleDate,           // 날짜 선택 토글
  setTransactionType,   // 수입/지출 타입 변경
  toggleScheduled,      // 예정 내역 필터 토글
  resetFilters          // 모든 필터 초기화 (전체 버튼)
} = budgetStore

/**
 * 4. 라이프사이클 훅
 * - 컴포넌트가 화면에 나타나자마자 DB(json-server)에서 데이터를 긁어옴
 */
onMounted(() => {
  budgetStore.fetchData() // BUDGET, CATEGORY, USER 테이블을 한꺼번에 로드함
})
</script>

<template>
  <div class="calendar-main">
    <header class="header-container">
      <MonthPicker
          :current-month="currentMonth"
          @change="changeMonth"
      />

      <CategoryFilter
          :categories="categories"
          :selected-categories="selectedCategories"
          :selected-type="selectedType"
          :is-scheduled-only="isScheduledOnly"
          @select-type="setTransactionType"
          @toggle-category="toggleCategory"
          @toggle-scheduled="toggleScheduled"
          @select-all="resetFilters"
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

      </section>
    </main>
  </div>
</template>

<style scoped>
/* 메인 배경 및 높이 설정 */
.calendar-main {
  background-color: var(--color-background);
  min-height: 100vh;
  padding: 40px 20px;
}

/* 헤더: 자식들을 왼쪽 정렬(flex-start)하고 수직으로 배치 */
.header-container {
  max-width: 1200px;
  margin: 0 auto 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
}

/* 콘텐츠 영역: 가로 배치(flex) 및 간격 조절 */
.content-wrapper {
  display: flex;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  align-items: flex-start;
}

/* 달력 판: 좀 더 넓은 비중(1.6)을 차지하고 둥근 모서리 적용 */
.calendar-area {
  flex: 1.6;
  background: var(--color-white);
  border-radius: 16px;
  box-shadow: var(--drop--shadow);
  overflow: hidden;
}

/* 리스트 영역: 스크롤 시 상단에 고정되도록 sticky 적용 */
.list-area {
  flex: 1;
  min-width: 380px;
  position: sticky;
  top: 40px;
}
</style>