<script setup>
/**
 * [CalendarMain] 달력 페이지의 메인 오케스트레이터
 * - 모든 상태(State)는 Pinia Store에서 관리하고
 * - 하위 컴포넌트들에게 Props로 데이터를 전달하며
 * - 발생한 이벤트들을 스토어 액션으로 연결함
 */
import { onMounted, ref, reactive } from 'vue';
import { storeToRefs } from 'pinia';

// 💡 전역 상태 관리(Pinia) 및 컴포넌트 임포트
import { useBudgetStore } from '@/stores/budgetStore2.js';
import MonthPicker from '@/components/common/MonthPicker.vue';
import CategoryFilter from '@/components/common/CategoryFilter.vue';
import CalendarBoard from '@/components/calendar/calendarBoard.vue';
import DailyList from '@/components/calendar/dailyList.vue';
import MonthlyRecentTransactions from '@/components/calendar/MonthlyRecentTransactions.vue';
import EditModal from '@/components/common/EditModal.vue';
import ConfirmModal from '@/components/common/ConfirmModal.vue';
import SuccessModal from '@/components/common/CompleteModal.vue';

// 1. 스토어 사용 선언
const budgetStore = useBudgetStore();

/**
 * 2. State & Getters 추출 (반응형 유지)
 * - storeToRefs를 사용해야 구조 분해 할당을 해도 UI가 실시간으로 바뀜
 * - [중요] categories: DB에서 가져온 진짜 카테고리 목록
 */
const {
  currentMonth, // 현재 보고 있는 달 (Date 객체)
  categories, // [DB 데이터] 식비, 카페 등 카테고리 배열
  selectedDates, // 사용자가 클릭한 날짜들 (YYYY-MM-DD 형식)
  selectedCategories, // 필터링 선택된 카테고리 ID들
  selectedType, // 전체/수입/지출 필터링 상태
  isScheduledOnly, // 예정 내역만 보기 여부
  calendarDots, // 달력 셀 안에 찍힐 점들 데이터
  rangeBudgets, // 선택한 날짜에 해당하는 상세 내역 리스트
  monthlyRecentTransactions, // 카테고리 클릭 시 보여줄 월간 내역
  selectedTotal, // 선택된 내역의 수입/지출 합계
} = storeToRefs(budgetStore);

/**
 * 3. Actions 추출 (로직 함수들)
 * - 액션은 반응형일 필요가 없으므로 스토어에서 바로 꺼내옴
 */
const {
  changeMonth, // 월 변경 (이전/다음)
  toggleCategory, // 카테고리 필터 토글
  toggleDate, // 날짜 선택 토글
  setTransactionType, // 수입/지출 타입 변경
  toggleScheduled, // 예정 내역 필터 토글
  resetFilters, // 모든 필터 초기화 (전체 버튼)
} = budgetStore;

// 💡 가계부 추가 모달 상태 관리
const isAddModalOpen = ref(false);
const addTargetItem = ref(null);
const modalTitle = ref('가계부 추가');

// 삭제 및 성공 모달 상태
const deleteModal = reactive({ visible: false, targetId: null });
const successModal = reactive({ visible: false, title: '', description: '' });

const openAddModal = (date) => {
  addTargetItem.value = {
    date,
    type: 'expense',
    amount: 0,
    detail: '',
    cid: '',
    memo: '',
  };
  modalTitle.value = '가계부 추가';
  isAddModalOpen.value = true;
};

/**
 * 💡 수정 모달 열기
 */
const openEditModal = (item) => {
  addTargetItem.value = { ...item };
  modalTitle.value = '거래 내역 수정';
  isAddModalOpen.value = true;
};

/**
 * 💡 저장 핸들러 (추가/수정 통합)
 */
const handleSave = async (submittedData) => {
  try {
    if (submittedData.id) {
      // 💡 [수정] 기존 데이터(uid 등)와 수정한 데이터를 합쳐서 보냅니다 (유실 방지)
      const payload = { ...addTargetItem.value, ...submittedData };
      await budgetStore.editBudget(submittedData.id, payload);
    } else {
      // 💡 [추가] ID가 없는 경우에만 신규 생성
      await handleBulkSave(submittedData);
    }
    isAddModalOpen.value = false;

    // 성공 모달 표시
    successModal.title = submittedData.id ? '수정 완료' : '추가 완료';
    successModal.description = '내역이 성공적으로 반영되었습니다.';
    successModal.visible = true;

    // 데이터 갱신
    await budgetStore.fetchData();
  } catch (error) {
    console.error('저장 실패:', error);
  }
};

/**
 * 💡 [추가] 다중 선택된 모든 날짜에 가계부 내역 저장
 */
const handleBulkSave = async (formData) => {
  const savePromises = selectedDates.value.map((date) => {
    return budgetStore.addBudget({ ...formData, date });
  });
  await Promise.all(savePromises);
};

/**
 * 💡 삭제 로직
 */
const handleDelete = (id) => {
  deleteModal.targetId = id;
  deleteModal.visible = true;
};

const executeDelete = async () => {
  try {
    await budgetStore.deleteBudget(deleteModal.targetId);
    deleteModal.visible = false;

    successModal.title = '삭제 완료';
    successModal.description = '내역이 안전하게 삭제되었습니다.';
    successModal.visible = true;

    await budgetStore.fetchData();
  } catch (error) {
    console.error('삭제 실패:', error);
  }
};

/**
 * 4. 라이프사이클 훅
 * - 컴포넌트가 화면에 나타나자마자 DB(json-server)에서 데이터를 긁어옴
 */
onMounted(() => {
  budgetStore.fetchData(); // BUDGET, CATEGORY, USER 테이블을 한꺼번에 로드함
});
</script>

<template>
  <div class="calendar-main">
    <header class="header-container">
      <MonthPicker :current-month="currentMonth" @change="changeMonth" />

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
          @add-click="openAddModal"
          @edit-click="openEditModal"
          @delete-click="handleDelete"
        />

        <MonthlyRecentTransactions
          v-else-if="selectedCategories.length > 0"
          :items="monthlyRecentTransactions"
        />
      </section>
    </main>

    <!-- 💡 가계부 추가 모달 연결 -->
    <EditModal
      :visible="isAddModalOpen"
      :item="addTargetItem"
      :categories="categories"
      :title="modalTitle"
      @save="handleSave"
      @close="isAddModalOpen = false"
    />

    <!-- 삭제 확인 모달 -->
    <ConfirmModal
      :visible="deleteModal.visible"
      icon="🗑️"
      title="내역 삭제"
      description="이 거래 내역을 정말 삭제하시겠습니까?"
      confirmText="삭제하기"
      @confirm="executeDelete"
      @close="deleteModal.visible = false"
    />

    <!-- 알림 모달 -->
    <SuccessModal
      :visible="successModal.visible"
      icon="✅"
      :title="successModal.title"
      :description="successModal.description"
      @close="successModal.visible = false"
    />
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
  width: 100%;
  position: relative;
  z-index: 10; /* 캘린더 보드나 리스트보다 위에 오도록 설정 */
}

/* 💡 CategoryFilter 내부의 .filters 영역 가로 스크롤 처리 */
:deep(.category-list) {
  display: flex;
  flex-wrap: nowrap !important; /* 줄바꿈 방지 */
  overflow-x: auto !important; /* 가로 스크롤 활성화 */
  scrollbar-width: none; /* Firefox 스크롤바 숨김 */
  -ms-overflow-style: none; /* IE/Edge 스크롤바 숨김 */
  max-width: 100%;
}

:deep(.category-list::-webkit-scrollbar) {
  display: none; /* Chrome, Safari, 브라우저 스크롤바 숨김 */
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
