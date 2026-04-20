<template>
  <div class="container">
    <div class="mobile-page-title mobile-only">거래내역</div>

    <div class="header">
      <MonthPicker :current-month="currentMonth" @change="changeMonth" />

      <input
        v-model="search"
        placeholder="메모 검색"
        class="memo_window search-input"
      />

      <button
        class="mobile-search-btn mobile-only"
        type="button"
        aria-label="Search"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle
            cx="11"
            cy="11"
            r="7"
            stroke="currentColor"
            stroke-width="2"
          />
          <path
            d="M20 20L17 17"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>

    <CategoryFilter
      :categories="store.categories"
      :selected-categories="selectedCategory"
      :selected-type="selectedType"
      :is-scheduled-only="showUpcoming"
      @select-type="handleTypeSelect"
      @toggle-category="toggleCategory"
      @toggle-scheduled="showUpcoming = !showUpcoming"
      @select-all="selectAllCategory"
      class="filter-bar"
    />

    <div class="table-container desktop-only">
      <table class="table">
        <thead>
          <tr>
            <th width="65px">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleAll"
              />
            </th>
            <th width="210px">날짜</th>
            <th width="210px">거래 내역</th>
            <th width="210px">금액</th>
            <th width="210px">카테고리</th>
            <th width="180px">
              <div
                class="bulk-action-container"
                v-show="selectedIds.length > 0"
              >
                <span class="selected-count"
                  >{{ selectedIds.length }}건 선택</span
                >
                <button
                  class="bulk-delete-btn"
                  type="button"
                  @click="deleteSelected"
                >
                  삭제
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in filteredMCT"
            :key="item.id"
            class="btn-hover"
            :class="{ upcoming: isUpcoming(item.date) }"
            @dblclick="handleShowDetail(item)"
          >
            <td>
              <input type="checkbox" :value="item.id" v-model="selectedIds" />
            </td>
            <td class="time-cell">{{ formatDateTime(item.date) }}</td>
            <td class="detail-cell">{{ item.detail }}</td>
            <td>
              <span :class="item.type === 'expense' ? 'negative' : 'positive'">
                {{ item.type === 'expense' ? '-' : '+'
                }}{{ Number(item.amount).toLocaleString() }}원
              </span>
            </td>
            <td>
              <span
                :style="{ background: item.categoryColor }"
                class="category-img"
              >
                {{ item.categoryImg }}
              </span>
              {{ item.categoryName }}
            </td>
            <td>
              <div class="button-hover">
                <svg
                  class="pencil-icon"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  @click="handleEdit(item)"
                >
                  <path
                    d="M14.3632 5.65156L15.8431 4.17157C16.6242 3.39052 17.8905 3.39052 18.6716 4.17157L20.0858 5.58579C20.8668 6.36683 20.8668 7.63316 20.0858 8.41421L18.6058 9.8942M14.3632 5.65156L4.74749 15.2672C4.41542 15.5993 4.21079 16.0376 4.16947 16.5054L3.92738 19.2459C3.87261 19.8659 4.39148 20.3848 5.0115 20.33L7.75191 20.0879C8.21972 20.0466 8.65806 19.8419 8.99013 19.5099L18.6058 9.8942M14.3632 5.65156L18.6058 9.8942"
                    stroke="#000000"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <svg
                  class="trash-icon"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke-width="1.5"
                  @click="handleDelete(item.id)"
                >
                  <path
                    d="M20 9L18.005 20.3463C17.8369 21.3026 17.0062 22 16.0353 22H7.96474C6.99379 22 6.1631 21.3026 5.99496 20.3463L4 9H20Z"
                    stroke="#000000"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M21 6H15.375M3 6H8.625M8.625 6V4C8.625 2.89543 9.52043 2 10.625 2H13.375C14.4796 2 15.375 2.89543 15.375 4V6M8.625 6H15.375"
                    stroke="#000000"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mobile-list mobile-only">
      <section
        v-for="group in mobileGroupedItems"
        :key="group.date"
        class="mobile-date-group"
      >
        <h3 class="mobile-group-title">{{ formatMobileDate(group.date) }}</h3>

        <article
          v-for="item in group.items"
          :key="item.id"
          class="mobile-card"
          :class="{ upcoming: isUpcoming(item.date) }"
        >
          <div class="mobile-card-main">
            <div class="mobile-card-left">
              <span
                :style="{ background: item.categoryColor }"
                class="mobile-icon-circle"
              >
                {{ item.categoryImg }}
              </span>
              <div class="mobile-texts">
                <span class="mobile-time">{{ formatOnlyTime(item.date) }}</span>
                <p class="mobile-detail">{{ item.detail }}</p>
                <p v-if="item.memo" class="mobile-memo">{{ item.memo }}</p>
              </div>
            </div>

            <div class="mobile-card-right">
              <span
                :class="item.type === 'expense' ? 'negative' : 'positive'"
                class="mobile-amount"
              >
                {{ item.type === 'expense' ? '-' : '+'
                }}{{ Number(item.amount).toLocaleString() }}
              </span>
              <div class="mobile-inline-actions">
                <button
                  class="icon-action"
                  type="button"
                  @click="handleEdit(item)"
                  aria-label="Edit"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M14.3632 5.65156L15.8431 4.17157C16.6242 3.39052 17.8905 3.39052 18.6716 4.17157L20.0858 5.58579C20.8668 6.36683 20.8668 7.63316 20.0858 8.41421L18.6058 9.8942M14.3632 5.65156L4.74749 15.2672C4.41542 15.5993 4.21079 16.0376 4.16947 16.5054L3.92738 19.2459C3.87261 19.8659 4.39148 20.3848 5.0115 20.33L7.75191 20.0879C8.21972 20.0466 8.65806 19.8419 8.99013 19.5099L18.6058 9.8942M14.3632 5.65156L18.6058 9.8942"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
                <button
                  class="icon-action"
                  type="button"
                  @click="handleDelete(item.id)"
                  aria-label="Delete"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 9L18.005 20.3463C17.8369 21.3026 17.0062 22 16.0353 22H7.96474C6.99379 22 6.1631 21.3026 5.99496 20.3463L4 9H20Z"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M21 6H15.375M3 6H8.625M8.625 6V4C8.625 2.89543 9.52043 2 10.625 2H13.375C14.4796 2 15.375 2.89543 15.375 4V6M8.625 6H15.375"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>

    <EditModal
      :visible="editModal.visible"
      :item="editModal.item"
      :title="editModal.title"
      :read-only="editModal.readOnly"
      :categories="store.categories"
      @save="executeEdit"
      @close="editModal.visible = false"
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

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useTransactionStore } from '@/stores/budgetStore';
import MonthPicker from '@/components/common/MonthPicker.vue';
import CategoryFilter from '@/components/common/CategoryFilter.vue';
import { useCategoryStore } from '@/stores/category';
import { useBudgetStore } from '@/stores/budgetStore2';
import { useUserStore } from '@/stores/userStore';
import ConfirmModal from '../common/ConfirmModal.vue';
import SuccessModal from '../common/CompleteModal.vue';
import EditModal from '../common/EditModal.vue';

const showUpcoming = ref(false);
const store = useTransactionStore();
const userStore = useUserStore();
const categoryStore = useCategoryStore();
const calendarStore = useBudgetStore();

const {
  currentMonth,
  currentMonthNum,
  selectedCategories: selectedCategory,
  selectedType,
  searchQuery: search,
} = storeToRefs(store);

const { changeMonth } = store;

const selectedIds = ref([]);

const deleteModal = reactive({ visible: false, targetId: null });
const editModal = reactive({
  visible: false,
  item: null,
  readOnly: false,
  title: '거래 내역 수정',
});
const successModal = reactive({ visible: false, title: '', description: '' });

const handleTypeSelect = (type) => {
  selectedType.value = type;
};

const isUpcoming = (dateStr) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return new Date(dateStr) > today;
};

onMounted(async () => {
  await store.loadData();
});

const filteredByCategory = store.filteredByCategory(selectedCategory, search);
const filteredByMonth = store.filteredByMonth(
  filteredByCategory,
  currentMonthNum,
);
const filteredByType = store.filteredByType(filteredByMonth, selectedType);

// 예정 버튼(showUpcoming) 상태에 따라 데이터 리스트 자체를 필터링하여 '전체 선택'과 독립적으로 작동하게 함
const filteredMCT = computed(() => {
  const base = store.filteredByToday(filteredByType).value;
  return showUpcoming.value
    ? base
    : base.filter((item) => !isUpcoming(item.date));
});

const mobileGroupedItems = computed(() => {
  return filteredMCT.value.reduce((acc, item) => {
    const group = acc.find((entry) => entry.date === item.date);
    if (group) {
      group.items.push(item);
    } else {
      acc.push({ date: item.date, items: [item] });
    }
    return acc;
  }, []);
});

const isAllSelected = computed(() => {
  const selectableItems = filteredMCT.value;
  return (
    selectableItems.length > 0 &&
    selectedIds.value.length === selectableItems.length
  );
});

const toggleAll = (e) => {
  selectedIds.value = e.target.checked
    ? filteredMCT.value.map((item) => item.id)
    : [];
};

// 예정 필터나 검색어 등이 변경될 때 선택된 체크박스 상태를 초기화하여 꼬임 방지
watch([currentMonth, selectedType, search, showUpcoming], () => {
  selectedIds.value = [];
});

watch(
  selectedCategory,
  () => {
    selectedIds.value = [];
  },
  { deep: true },
);

const selectAllCategory = () => {
  selectedCategory.value = [];
  showUpcoming.value = false;
};

const toggleCategory = (id) => {
  if (!Array.isArray(selectedCategory.value)) {
    selectedCategory.value = [];
  }

  let current = [...selectedCategory.value];
  const targetId = Number(id);

  if (current.includes(targetId)) {
    current = current.filter((c) => c !== targetId);
  } else {
    current.push(targetId);
  }

  selectedCategory.value = current;
};

// 데스크톱용: 월-일 시간 (04-11 12시 45분)
const formatDateTime = (dateStr) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${m}/${d} \u00A0\u00A0 ${hours}시 ${minutes}분`;
};

// 모바일용: 시간만 (날짜 그룹이 별도로 있으므로)
const formatOnlyTime = (dateStr) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return `${date.getHours()}시 ${date.getMinutes()}분`;
};

const formatMobileDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
  });
};

const deleteSelected = () => {
  deleteModal.targetId = null;
  deleteModal.visible = true;
};

const handleEdit = (item) => {
  editModal.item = { ...item };
  editModal.readOnly = false;
  editModal.title = '거래 내역 수정';
  editModal.visible = true;
};

const handleShowDetail = (item) => {
  editModal.item = { ...item };
  editModal.readOnly = true;
  editModal.title = '거래 상세 내역';
  editModal.visible = true;
};

const executeEdit = async (updatedData) => {
  try {
    const uid = store.myBudgets[0]?.uid;
    const payload = { ...editModal.item, ...updatedData };
    await store.editBudget(editModal.item.id, payload);

    if (uid) await categoryStore.fetchAll(uid);
    await calendarStore.fetchData();

    editModal.visible = false;
    successModal.title = '수정 완료';
    successModal.description = '내역이 성공적으로 수정되었습니다.';
    successModal.visible = true;
  } catch {
    alert('수정 중 오류가 발생했습니다.');
  }
};

const handleDelete = (id) => {
  deleteModal.targetId = id;
  deleteModal.visible = true;
};

const executeDelete = async () => {
  try {
    const uid = userStore.user?.id;

    if (deleteModal.targetId) {
      await store.deleteBudget(deleteModal.targetId);
    } else {
      await Promise.all(selectedIds.value.map((id) => store.deleteBudget(id)));
      selectedIds.value = [];
    }

    if (uid) await categoryStore.fetchAll(uid);
    await calendarStore.fetchData();

    deleteModal.visible = false;
    successModal.title = '삭제 완료';
    successModal.description = '내역이 안전하게 삭제되었습니다.';
    successModal.visible = true;
  } catch {
    alert('삭제 중 오류가 발생했습니다.');
  }
};
</script>

<style scoped>
.container {
  padding: 20px;
  font-family: sans-serif;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow-x: hidden;
}

.header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
  min-width: 0;
}

.month-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  min-width: 60px;
  text-align: center;
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
  font-size: 1.1rem;
  transition: background 0.2s;
}

.nav-btn:hover {
  background-color: var(--color-primary-80);
}

.filter-bar {
  margin-bottom: 12px;
  min-width: 0;
}

.subtitle-s {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-deepgray-100);
}

.upcoming {
  opacity: 0.4;
}

.memo_window {
  margin-left: auto;
}

.search-input {
  height: 34px;
  padding: 0 14px 0 36px;
  border-radius: 18px;
  border: 1.5px solid #e0e0e0;
  font-size: 13px;
  outline: none;
  width: 180px;
  background-color: #f7f8fa;
  color: #333;
  transition: all 0.2s ease;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23aaa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='M21 21l-4.35-4.35'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 12px center;
}

.search-input::placeholder {
  color: #bbb;
}

.search-input:focus {
  border-color: #4caf50;
  background-color: #fff;
  width: 220px;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.table-container {
  height: 550px;
  overflow-y: auto;
  border-radius: 12px;
  background-color: #fff;
  margin-top: 10px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.table th,
.table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
  text-align: center;
}

.table thead th {
  position: sticky;
  top: 0;
  z-index: 0;
  background-color: #fff;
  box-shadow: inset 0 -1px 0 #eee;
  height: 64px;
  vertical-align: middle;
}

input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-primary);
  vertical-align: middle;
}

.category-img {
  padding: 3px;
  border-radius: 50%;
}

.button-hover {
  visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.btn-hover:hover .button-hover {
  visibility: visible;
  opacity: 1;
}

.pencil-icon {
  margin-right: 10px;
}

.pencil-icon:hover,
.trash-icon:hover {
  transform: scale(1.2);
}

.negative {
  color: #e74c3c;
  font-weight: 500;
}

.positive {
  color: #2ecc71;
  font-weight: 500;
}

.bulk-delete-btn {
  background-color: #ff5252;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bulk-action-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .container {
    padding: 0 12px 20px;
  }

  .mobile-page-title {
    display: block;
    font-size: 14px;
    font-weight: 700;
    color: #5f6368;
    margin-bottom: 10px;
  }

  .header {
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .month-picker-area {
    justify-content: flex-start;
    gap: 16px;
    flex: 1;
  }

  .month-title {
    font-size: 2rem;
    min-width: auto;
  }

  .memo_window {
    display: none;
  }

  .mobile-search-btn {
    width: 42px;
    height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #ececec;
    border-radius: 50%;
    background: #fff;
    color: #b4b4b4;
    flex-shrink: 0;
  }

  .filter-bar {
    gap: 8px;
    flex-wrap: nowrap;
    align-items: center;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .filters {
    margin: 0;
    padding: 0;
    width: auto;
    order: unset;
    flex: 0 0 auto;
  }

  .toggle-btn,
  .upcoming-toggle,
  .dropdown-wrapper {
    flex-shrink: 0;
  }

  .toggle-btn {
    display: none;
  }

  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }

  .mobile-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-top: 12px;
    width: 100%;
    min-width: 0;
  }

  .mobile-date-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    min-width: 0;
  }

  .mobile-group-title {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: #9b9b9b;
  }

  .mobile-card {
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 10px 26px rgba(44, 51, 51, 0.08);
    padding: 16px 18px;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .mobile-card-main {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px;
    align-items: center;
    min-width: 0;
  }

  .mobile-card-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .mobile-icon-circle {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .mobile-texts {
    min-width: 0;
  }

  .mobile-card-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .mobile-amount {
    font-size: 15px;
    font-weight: 700;
    white-space: nowrap;
  }

  .mobile-detail {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #1f1f1f;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mobile-memo {
    margin: 4px 0 0;
    font-size: 13px;
    color: #8a8a8a;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mobile-time {
    font-size: 11px;
    color: #999;
    display: block;
    margin-bottom: 2px;
  }

  .mobile-inline-actions {
    display: flex;
    gap: 6px;
  }

  .icon-action {
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: #b5b5b5;
    padding: 0;
  }
}
</style>
