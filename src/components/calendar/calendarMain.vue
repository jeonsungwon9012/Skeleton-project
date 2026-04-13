<script setup>
import { onMounted, reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useBudgetStore } from '@/stores/budgetStore2.js';
import MonthPicker from '@/components/common/MonthPicker.vue';
import CategoryFilter from '@/components/common/CategoryFilter.vue';
import CalendarBoard from '@/components/calendar/calendarBoard.vue';
import DailyList from '@/components/calendar/dailyList.vue';
import MonthlyRecentTransactions from '@/components/calendar/MonthlyRecentTransactions.vue';
import EditModal from '@/components/common/EditModal.vue';
import ConfirmModal from '@/components/common/ConfirmModal.vue';
import SuccessModal from '@/components/common/CompleteModal.vue';

const budgetStore = useBudgetStore();

const {
  currentMonth,
  categories,
  selectedDates,
  selectedCategories,
  selectedType,
  isScheduledOnly,
  calendarDots,
  rangeBudgets,
  monthlyRecentTransactions,
  selectedTotal,
} = storeToRefs(budgetStore);

const {
  changeMonth,
  toggleCategory,
  toggleDate,
  setTransactionType,
  toggleScheduled,
  resetFilters,
} = budgetStore;

const isAddModalOpen = ref(false);
const addTargetItem = ref(null);
const modalTitle = ref('가계부 추가');

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

const openEditModal = (item) => {
  addTargetItem.value = { ...item };
  modalTitle.value = '거래 내역 수정';
  isAddModalOpen.value = true;
};

const handleBulkSave = async (formData) => {
  const savePromises = selectedDates.value.map((date) =>
    budgetStore.addBudget({ ...formData, date }),
  );
  await Promise.all(savePromises);
};

const handleSave = async (submittedData) => {
  try {
    if (submittedData.id) {
      const payload = { ...addTargetItem.value, ...submittedData };
      await budgetStore.editBudget(submittedData.id, payload);
    } else {
      await handleBulkSave(submittedData);
    }

    isAddModalOpen.value = false;
    successModal.title = submittedData.id ? '수정 완료' : '추가 완료';
    successModal.description = '내역이 성공적으로 반영되었습니다.';
    successModal.visible = true;
    await budgetStore.fetchData();
  } catch (error) {
    console.error('저장 실패:', error);
  }
};

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

onMounted(() => {
  budgetStore.fetchData();
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

    <EditModal
      :visible="isAddModalOpen"
      :item="addTargetItem"
      :categories="categories"
      :title="modalTitle"
      @save="handleSave"
      @close="isAddModalOpen = false"
    />

    <ConfirmModal
      :visible="deleteModal.visible"
      icon="🗑️"
      title="내역 삭제"
      description="이 거래 내역을 정말 삭제하시겠습니까?"
      confirmText="삭제하기"
      @confirm="executeDelete"
      @close="deleteModal.visible = false"
    />

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
.calendar-main {
  background-color: var(--color-background);
  min-height: 100vh;
  padding: 40px 20px;
  position: relative;
  overflow-x: clip;
  box-sizing: border-box;
}

.header-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  box-sizing: border-box;
}

.content-wrapper {
  display: flex;
  gap: 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  align-items: flex-start;
  box-sizing: border-box;
}

.calendar-area {
  flex: 1.6;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  background: var(--color-white);
  border-radius: 16px;
  box-shadow: var(--drop--shadow);
  overflow: hidden;
}

.list-area {
  flex: 1;
  min-width: 380px;
  position: sticky;
  top: 40px;
}

@media (max-width: 1280px) {
  .content-wrapper {
    flex-direction: column;
    gap: 20px;
  }

  .calendar-area,
  .list-area {
    width: 100%;
  }

  .list-area {
    min-width: 0;
    position: static;
  }
}

@media (max-width: 768px) {
  .calendar-main {
    min-height: auto;
    padding: 0 12px 20px;
  }

  .header-container {
    gap: 14px;
    margin-bottom: 18px;
    padding: 0;
  }

  .content-wrapper {
    gap: 16px;
  }

  .calendar-area,
  .list-area {
    min-width: 0;
  }

  .calendar-area {
    border-radius: 24px;
    box-shadow: 0 10px 26px rgba(44, 51, 51, 0.08);
  }
}
</style>
