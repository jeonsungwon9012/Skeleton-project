<template>
  <section class="add-transaction-wrapper">
    <div class="add-transaction-card">
      <h2 class="page-title">가계부 쓰기</h2>

      <div class="form-group">
        <label class="form-label">유형</label>
        <div class="type-tabs">
          <button
            type="button"
            class="type-tab income-tab"
            :class="{ active: form.type === 'income' && !form.isRecurring }"
            @click="selectType('income')"
          >
            수입
          </button>
          <button
            type="button"
            class="type-tab expense-tab"
            :class="{ active: form.type === 'expense' && !form.isRecurring }"
            @click="selectType('expense')"
          >
            지출
          </button>
          <button
            type="button"
            class="type-tab recurring-tab"
            :class="{ active: form.type === 'expense' && form.isRecurring }"
            @click="selectRecurring"
          >
            정기결제
          </button>
        </div>
      </div>

      <div class="form-row triple">
        <div class="form-group">
          <label class="form-label">내역명</label>
          <input
            v-model="form.detail"
            type="text"
            class="form-input"
            placeholder="예: 점심값, 월급, 교통비"
          />
        </div>

        <div class="form-group">
          <label class="form-label">카테고리</label>
          <div class="custom-category-select">
            <button type="button" class="category-selected" @click="toggleDropdown">
              <div class="category-selected-left">
                <div
                  class="category-icon-circle"
                  :style="{
                    backgroundColor: selectedCategory
                      ? getCategoryColor(selectedCategory.id)
                      : '#e9ecef',
                  }"
                >
                  {{ selectedCategory ? selectedCategory.img : '' }}
                </div>
                <span class="category-selected-text">
                  {{ selectedCategory ? selectedCategory.name : '카테고리 선택' }}
                </span>
              </div>
              <span class="category-arrow">{{ dropdownOpen ? '▲' : '▼' }}</span>
            </button>

            <div v-if="dropdownOpen" class="category-dropdown">
              <button
                v-for="category in categories"
                :key="category.id"
                type="button"
                class="category-option"
                @click="selectCategory(category)"
              >
                <div
                  class="category-icon-circle"
                  :style="{ backgroundColor: getCategoryColor(category.id) }"
                >
                  {{ category.img }}
                </div>
                <span class="category-option-text">{{ category.name }}</span>
              </button>
              <button type="button" class="category-add-button" @click="openAddCategoryModal">
                + 카테고리 추가
              </button>
            </div>
          </div>
        </div>

        <div class="form-group template-save-group">
          <label class="form-label">템플릿 등록</label>
          <div class="checkbox-box">
            <input
              id="isTemplate"
              :checked="form.isTemplate"
              type="checkbox"
              class="template-checkbox"
              @change="handleTemplateCheck"
            />
            <label for="isTemplate" class="checkbox-label">자주 쓰는 내역으로 저장</label>
          </div>
          <small class="sub-text">필요할 때 바로 등록해서 다시 사용할 수 있어요.</small>
        </div>
      </div>

      <div class="form-row double">
        <div class="form-group">
          <label class="form-label">금액</label>
          <input
            v-model="form.amount"
            type="number"
            min="0"
            class="form-input"
            placeholder="금액을 입력하세요"
          />
        </div>

        <div v-if="!form.isRecurring" class="form-group">
          <label class="form-label">날짜</label>
          <input v-model="form.date" type="date" class="form-input" />
        </div>

        <div v-else class="form-group recurring-group">
          <label class="form-label">반복 주기</label>
          <div class="recurring-card">
            <div class="recurring-top">
              <span class="recurring-title">반복 주기</span>
              <select v-model="form.cycle" class="cycle-select">
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="monthly">매월</option>
              </select>
            </div>

            <div v-if="form.cycle === 'daily'" class="recurring-detail">
              <span class="detail-label">반복</span>
              <span class="detail-value">매일</span>
            </div>

            <div v-else-if="form.cycle === 'weekly'" class="recurring-detail weekly-box">
              <span class="detail-label">매주</span>
              <div class="weekday-list">
                <button
                  v-for="day in weekdays"
                  :key="day.value"
                  type="button"
                  class="weekday-btn"
                  :class="{ active: form.recurringValue === day.value }"
                  @click="form.recurringValue = day.value"
                >
                  {{ day.label }}
                </button>
              </div>
            </div>

            <div v-else-if="form.cycle === 'monthly'" class="recurring-detail monthly-box">
              <span class="detail-label">매월</span>
              <div class="monthly-input-wrap">
                <input
                  v-model.number="form.recurringValue"
                  type="number"
                  min="1"
                  max="31"
                  class="monthly-input"
                  placeholder="1"
                />
                <span class="monthly-suffix">일</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">메모</label>
        <textarea
          v-model="form.memo"
          class="form-textarea"
          placeholder="메모를 작성해주세요"
        ></textarea>
      </div>

      <p v-if="errorMessage" class="message error-message">
        {{ errorMessage }}
      </p>

      <div class="button-area">
        <button
          type="button"
          class="submit-btn"
          :disabled="isSubmitting"
          @click="submitTransaction"
        >
          {{ isSubmitting ? '등록 중...' : '등록하기' }}
        </button>
      </div>
    </div>

    <RegisterModal
      :visible="showSuccessModal"
      :icon="successModalIcon"
      :description="successModalDescription"
      @close="closeSuccessModal"
    />

    <AddCategory
      :visible="showAddCategoryModal"
      :categories="categories"
      @close="closeAddCategoryModal"
      @created="handleCategoryCreated"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import AddCategory from './addCategory.vue';
import { useTransactionStore } from '@/stores/budgetStores';
import RegisterModal from './RegisterModal.vue';

const transactionStore = useTransactionStore();

const isSubmitting = ref(false);
const errorMessage = ref('');
const dropdownOpen = ref(false);
const showSuccessModal = ref(false);
const showAddCategoryModal = ref(false);
const successModalIcon = ref('*');
const successModalDescription = ref('');

const weekdays = [
  { label: '일', value: 'sun' },
  { label: '월', value: 'mon' },
  { label: '화', value: 'tue' },
  { label: '수', value: 'wed' },
  { label: '목', value: 'thu' },
  { label: '금', value: 'fri' },
  { label: '토', value: 'sat' },
];

const form = reactive({
  id: null,
  uid: 1,
  type: 'expense',
  detail: '',
  amount: '',
  memo: '',
  date: '',
  cid: '',
  isRecurring: false,
  cycle: null,
  isTemplate: false,
  recurringValue: null,
});

const categories = computed(() => transactionStore.categories);

const categoryColorMap = {
  '1': 'var(--category-red)',
  '2': 'var(--category-orange)',
  '3': 'var(--category-yellow)',
  '4': 'var(--category-green)',
  '5': 'var(--category-mint)',
  '6': 'var(--category-blue)',
  '7': 'var(--category-purple)',
  '8': 'var(--category-pink)',
  '9': 'var(--category-brown)',
  '10': 'var(--category-gray)',
};

const selectedCategory = computed(
  () => categories.value.find((category) => String(category.id) === String(form.cid)) || null,
);

const resetMessages = () => {
  errorMessage.value = '';
};

const closeSuccessModal = () => {
  showSuccessModal.value = false;
};

const openAddCategoryModal = () => {
  dropdownOpen.value = false;
  showAddCategoryModal.value = true;
};

const closeAddCategoryModal = () => {
  showAddCategoryModal.value = false;
};

const openSuccessModal = (description, icon = '*') => {
  successModalDescription.value = description;
  successModalIcon.value = icon;
  showSuccessModal.value = true;
};

const resetForm = () => {
  form.id = null;
  form.uid = 1;
  form.type = 'expense';
  form.detail = '';
  form.amount = '';
  form.memo = '';
  form.date = '';
  form.cid = '';
  form.isRecurring = false;
  form.cycle = null;
  form.isTemplate = false;
  form.recurringValue = null;
  dropdownOpen.value = false;
};

const selectType = (type) => {
  form.type = type;
  form.isRecurring = false;
  form.cycle = null;
  form.recurringValue = null;
};

const selectRecurring = () => {
  form.type = 'expense';
  form.isRecurring = true;
  form.cycle = 'daily';
  form.recurringValue = null;
};

watch(
  () => form.cycle,
  (newValue) => {
    if (!form.isRecurring) {
      return;
    }

    if (newValue === 'daily') {
      form.recurringValue = null;
    } else if (newValue === 'weekly') {
      form.recurringValue = 'sun';
    } else if (newValue === 'monthly') {
      form.recurringValue = 1;
    }
  },
);

onMounted(async () => {
  await transactionStore.loadData();
});

const getCategoryColor = (id) => categoryColorMap[String(id)] || 'var(--category-gray)';

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const selectCategory = (category) => {
  form.cid = category.id;
  dropdownOpen.value = false;
  errorMessage.value = '';
};

const handleCategoryCreated = (createdCategory) => {
  form.cid = createdCategory.id;
  errorMessage.value = '';
  showAddCategoryModal.value = false;
};

const handleTemplateCheck = (event) => {
  const checked = event.target.checked;

  if (!checked) {
    form.isTemplate = false;
    errorMessage.value = '';
    return;
  }

  const templateCount = transactionStore.getTemplateCountByUser(form.uid);

  if (templateCount >= 3) {
    form.isTemplate = false;
    event.target.checked = false;
    errorMessage.value = '템플릿은 최대 3개까지 등록할 수 있습니다.';
    return;
  }

  form.isTemplate = true;
  errorMessage.value = '';
};

const formatDate = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getNextDailyDate = () => formatDate(new Date());

const getNextWeeklyDate = (targetDay) => {
  const dayMap = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };

  const today = new Date();
  const currentDay = today.getDay();
  const wantedDay = dayMap[targetDay];

  let diff = wantedDay - currentDay;
  if (diff < 0) diff += 7;
  if (diff === 0) diff = 7;

  const result = new Date(today);
  result.setDate(today.getDate() + diff);
  return formatDate(result);
};

const getNextMonthlyDate = (targetDate) => {
  const today = new Date();

  let year = today.getFullYear();
  let month = today.getMonth();
  const currentDate = today.getDate();
  const wantedDate = Number(targetDate);

  if (currentDate >= wantedDate) {
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  const lastDay = new Date(year, month + 1, 0).getDate();
  const safeDate = Math.min(wantedDate, lastDay);
  return formatDate(new Date(year, month, safeDate));
};

const getCalculatedRecurringDate = () => {
  if (form.cycle === 'daily') {
    return getNextDailyDate();
  }

  if (form.cycle === 'weekly') {
    return getNextWeeklyDate(form.recurringValue);
  }

  if (form.cycle === 'monthly') {
    const day = Number(form.recurringValue);
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      errorMessage.value = '매월 날짜는 1일부터 31일 사이로 입력해주세요.';
      return false;
    }
    return getNextMonthlyDate(day);
  }

  return '';
};

const validateForm = () => {
  if (!form.detail.trim()) {
    errorMessage.value = '내역명을 입력해주세요.';
    return false;
  }

  if (!form.amount || Number(form.amount) <= 0) {
    errorMessage.value = '금액을 입력해주세요.';
    return false;
  }

  if (!form.cid) {
    errorMessage.value = '카테고리를 선택해주세요.';
    return false;
  }

  if (!form.isRecurring) {
    if (!form.date) {
      errorMessage.value = '날짜를 선택해주세요.';
      return false;
    }
  } else {
    if (!form.cycle) {
      errorMessage.value = '반복 주기를 선택해주세요.';
      return false;
    }

    if (form.cycle === 'weekly' && !form.recurringValue) {
      errorMessage.value = '반복 요일을 선택해주세요.';
      return false;
    }

    if (form.cycle === 'monthly') {
      const day = Number(form.recurringValue);
      if (!day || day < 1 || day > 31) {
        errorMessage.value = '매월 날짜는 1일부터 31일 사이로 입력해주세요.';
        return false;
      }
    }
  }

  return true;
};

const submitTransaction = async () => {
  resetMessages();

  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    const calculatedDate = form.isRecurring ? getCalculatedRecurringDate() : form.date;
    if (!calculatedDate) {
      return;
    }

    const payload = {
      uid: form.uid,
      date: calculatedDate,
      type: form.type,
      amount: Number(form.amount),
      cid: Number(form.cid),
      detail: form.detail.trim(),
      memo: form.memo.trim(),
      isRecurring: form.isRecurring,
      cycle: form.isRecurring ? form.cycle : null,
      isTemplate: form.isTemplate,
    };

    if (form.id) {
      await transactionStore.editBudget(form.id, payload);
    } else {
      await transactionStore.addBudget(payload);
    }

    if (form.isTemplate) {
      await transactionStore.addTemplate({
        uid: form.uid,
        amount: Number(form.amount),
        type: form.type,
        detail: form.detail.trim(),
        memo: form.memo.trim(),
      });
    }

    const successCategory = selectedCategory.value;
    const modalDescription = successCategory
      ? `${successCategory.img} ${successCategory.name} 항목이 저장되었어요!`
      : '입력한 가계부 내역이 저장되었어요!';

    openSuccessModal(modalDescription, successCategory?.img || '*');
    resetForm();
  } catch (error) {
    console.error('처리 실패:', error);
    errorMessage.value = '처리에 실패했습니다.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.add-transaction-wrapper {
  width: 100%;
  max-width: 1280px;
  min-height: calc(100vh - 48px);
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 24px;
  box-sizing: border-box;
  border-radius: 32px;
}

.add-transaction-card {
  width: 100%;
  max-width: 980px;
  background-color: var(--color-gray-10);
  border-radius: 28px;
  padding: 32px 36px 40px;
  box-sizing: border-box;
}

.page-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 28px;
}

.form-group {
  margin-bottom: 22px;
}

.form-label {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  color: #3c3c3c;
  margin-bottom: 10px;
}

.type-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  background-color: #dcd9d9;
  border-radius: 16px;
  padding: 4px;
}

.type-tab {
  --tab-active-bg: var(--color-primary);
  --tab-active-text: var(--color-deepgray-100);
  border: none;
  background: transparent;
  height: 54px;
  border-radius: 14px;
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--color-deepgray-80);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.type-tab.active {
  background-color: var(--tab-active-bg);
  color: var(--tab-active-text);
  font-weight: 700;
  box-shadow: var(--drop--shadow);
}

.income-tab {
  --tab-active-bg: var(--color-primary);
  --tab-active-text: var(--color-deepgray-100);
}

.expense-tab {
  --tab-active-bg: var(--color-sub-100);
  --tab-active-text: var(--color-white);
}

.recurring-tab {
  --tab-active-bg: var(--category-blue);
  --tab-active-text: var(--color-white);
}

.form-row {
  display: grid;
  gap: 18px;
}

.form-row.double {
  grid-template-columns: 1fr 1fr;
  align-items: start;
}

.form-row.triple {
  grid-template-columns: 1.4fr 1fr 1fr;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  border: none;
  border-radius: 14px;
  background-color: #ffffff;
  padding: 14px 16px;
  font-size: 1rem;
  box-sizing: border-box;
  outline: none;
}

.form-input,
.form-select {
  height: 56px;
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
}

.template-save-group {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.checkbox-box {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 56px;
}

.template-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.checkbox-label {
  font-size: 0.98rem;
  color: #333;
  cursor: pointer;
}

.sub-text {
  color: #8a8a8a;
  font-size: 0.85rem;
  margin-top: 4px;
}

.message {
  margin-top: 8px;
  margin-bottom: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.error-message {
  color: #d13d3d;
}

.button-area {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.submit-btn {
  width: 100%;
  max-width: 520px;
  height: 62px;
  border: none;
  border-radius: 16px;
  background-color: #5b667a;
  color: #fff;
  font-size: 1.25rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.submit-btn:hover {
  opacity: 0.92;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.recurring-group {
  width: 100%;
}

.recurring-card {
  width: 100%;
  background-color: #ffffff;
  border-radius: 14px;
  padding: 14px 16px;
  box-sizing: border-box;
  border: none;
}

.recurring-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 14px;
  border-bottom: 1px solid #ddd;
}

.recurring-title,
.cycle-select,
.detail-label,
.detail-value,
.monthly-suffix {
  font-size: 1rem;
  font-weight: 700;
  color: #596174;
}

.cycle-select {
  border: none;
  background: transparent;
  outline: none;
  cursor: pointer;
}

.recurring-detail {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 18px;
  gap: 16px;
}

.weekly-box {
  align-items: flex-start;
}

.weekday-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.weekday-btn {
  width: 35px;
  height: 35px;
  border: none;
  border-radius: 12px;
  background-color: #ececec;
  color: #888;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
}

.weekday-btn.active {
  background-color: #5b667a;
  color: white;
}

.monthly-box {
  align-items: center;
}

.monthly-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.monthly-input {
  width: 90px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background-color: #e9e9e9;
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
  outline: none;
}

.custom-category-select {
  position: relative;
  width: 100%;
}

.category-selected {
  width: 100%;
  height: 56px;
  border: none;
  border-radius: 14px;
  background-color: #ffffff;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  box-sizing: border-box;
}

.category-selected-left {
  display: flex;
  align-items: center;
  gap: 1px;
}

.category-icon-circle {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.category-selected-text,
.category-option-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
}

.category-arrow {
  font-size: 20px;
  color: #666;
  transition: all 0.2s ease;
}

.category-dropdown {
  position: absolute;
  top: calc(100%);
  left: 0;
  width: 100%;
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  padding: 10px;
  z-index: 100;
  box-sizing: border-box;
}

.category-option {
  width: 100%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  box-sizing: border-box;
}

.category-option:hover {
  background-color: #f5f5f5;
}

.category-add-button {
  width: 100%;
  margin-top: 8px;
  border: none;
  border-radius: 12px;
  background-color: var(--color-primary-10);
  color: var(--color-deepgray-100);
  padding: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 992px) {
  .form-row.triple {
    grid-template-columns: 1fr 1fr;
  }

  .template-save-group {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .add-transaction-wrapper {
    padding: 16px;
  }

  .add-transaction-card {
    padding: 24px 18px 28px;
    border-radius: 20px;
  }

  .page-title {
    font-size: 1.6rem;
  }

  .form-row.double,
  .form-row.triple {
    grid-template-columns: 1fr;
  }

  .type-tab {
    font-size: 1.05rem;
  }

  .submit-btn {
    max-width: 100%;
  }
}
</style>
