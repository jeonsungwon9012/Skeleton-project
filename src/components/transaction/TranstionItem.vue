<template>
  <div class="container">
    <div class="mobile-page-title mobile-only">거래내역</div>

    <div class="header">
      <div class="month-picker-area">
        <button class="nav-btn" type="button" @click="prevMonth">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <h2 class="month-title">{{ currentMonth }}월</h2>
        <button class="nav-btn" type="button" @click="nextMonth">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 6L15 12L9 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <input
        v-model="search"
        placeholder="메모 검색"
        class="memo_window search-input"
      />

      <button class="mobile-search-btn mobile-only" type="button" aria-label="Search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
          <path d="M20 20L17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <div class="filter-bar">
      <div class="dropdown-wrapper">
        <button
          class="cat-item dropdown-trigger"
          :class="{ 'active-type': selectedType !== 'all' }"
          type="button"
          @click.stop="toggleTypeDropdown"
        >
          <div class="icon-circle gray-bg">⇵</div>
          <span class="subtitle-s">{{ typeLabel }}</span>
          <span class="arrow" :class="{ open: isTypeDropdownOpen }">⌄</span>
        </button>

        <ul v-if="isTypeDropdownOpen" class="dropdown-menu">
          <li @click="handleTypeSelect('all')" :class="{ active: selectedType === 'all' }">
            수입/지출
          </li>
          <li @click="handleTypeSelect('income')" :class="{ active: selectedType === 'income' }">
            수입 내역
          </li>
          <li @click="handleTypeSelect('expense')" :class="{ active: selectedType === 'expense' }">
            지출 내역
          </li>
        </ul>
      </div>

      <div class="filters" ref="filtersRef">
        <button
          :class="{ active: isAllCategorySelected }"
          type="button"
          @click="selectAllCategory"
        >
          전체
        </button>
        <button
          v-for="category in visibleCategories"
          :key="category.id"
          type="button"
          :class="{ active: selectedCategory.includes(Number(category.id)) }"
          :style="{
            background: selectedCategory.includes(Number(category.id)) ? category.color : '',
            borderColor: category.color,
          }"
          @click="toggleCategory(category.id)"
        >
          {{ category.img }} {{ category.name }}
        </button>
      </div>

      <button
        v-if="store.categories.length > visibleCount"
        class="toggle-btn"
        type="button"
        @click="showAllCategories = !showAllCategories"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            :d="showAllCategories ? 'M15 18L9 12L15 6' : 'M9 6L15 12L9 18'"
            stroke="#666"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <button class="upcoming-toggle" type="button" @click="showUpcoming = !showUpcoming">
        <svg
          v-if="showUpcoming"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
            stroke="#444"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle cx="12" cy="12" r="3" stroke="#444" stroke-width="2" />
        </svg>
        <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M17.94 17.94A10.07 10.07 0 0112 20C5 20 2 12 2 12A18.09 18.09 0 015.06 7.06M9.9 4.24A9.12 9.12 0 0112 4C19 4 22 12 22 12A18.09 18.09 0 0119.08 16.08M1 1L23 23"
            stroke="#444"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M10.73 10.73A3 3 0 0013.27 13.27"
            stroke="#444"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>

    <div class="table-container desktop-only">
      <table class="table">
        <thead>
          <tr>
            <th width="40px">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleAll"
              />
            </th>
            <th width="50px" class="item-index">No.</th>
            <th>날짜</th>
            <th>거래 내역</th>
            <th>금액</th>
            <th>카테고리</th>
            <th width="100px">
              <button
                class="bulk-delete-btn"
                :class="{ invisible: selectedIds.length === 0 }"
                type="button"
                @click="deleteSelected"
              >
                삭제
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in filteredMCT"
            :key="item.id"
            class="btn-hover"
            :class="{ upcoming: isUpcoming(item.date) }"
            v-show="!isUpcoming(item.date) || showUpcoming"
            @dblclick="handleShowDetail(item)"
          >
            <td>
              <input type="checkbox" :value="item.id" v-model="selectedIds" />
            </td>
            <td class="item-index">{{ index + 1 }}</td>
            <td>{{ item.date }}</td>
            <td>{{ item.detail }}</td>
            <td>
              <span :class="item.type === 'expense' ? 'negative' : 'positive'">
                {{ item.type === 'expense' ? '-' : '+' }}{{ Number(item.amount).toLocaleString() }}원
              </span>
            </td>
            <td>
              <span :style="{ background: item.categoryColor }" class="category-img">
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
              <span :style="{ background: item.categoryColor }" class="mobile-icon-circle">
                {{ item.categoryImg }}
              </span>
              <div class="mobile-texts">
                <p class="mobile-detail">{{ item.detail }}</p>
                <p v-if="item.memo" class="mobile-memo">{{ item.memo }}</p>
              </div>
            </div>

            <div class="mobile-card-right">
              <span :class="item.type === 'expense' ? 'negative' : 'positive'" class="mobile-amount">
                {{ item.type === 'expense' ? '-' : '+' }}{{ Number(item.amount).toLocaleString() }}
              </span>
              <div class="mobile-inline-actions">
                <button class="icon-action" type="button" @click="handleEdit(item)" aria-label="Edit">
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
                <button class="icon-action" type="button" @click="handleDelete(item.id)" aria-label="Delete">
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
  currentMonthNum: currentMonth,
  selectedCategories: selectedCategory,
  selectedType,
  searchQuery: search,
} = storeToRefs(store);

const isTypeDropdownOpen = ref(false);
const selectedIds = ref([]);
const showAllCategories = ref(false);
const visibleCount = 5;
const filtersRef = ref(null);

const deleteModal = reactive({ visible: false, targetId: null });
const editModal = reactive({
  visible: false,
  item: null,
  readOnly: false,
  title: '거래 내역 수정',
});
const successModal = reactive({ visible: false, title: '', description: '' });

const toggleTypeDropdown = () => {
  isTypeDropdownOpen.value = !isTypeDropdownOpen.value;
};

const typeLabel = computed(() => {
  if (selectedType.value === 'income') return '수입 내역';
  if (selectedType.value === 'expense') return '지출 내역';
  return '수입/지출';
});

const handleTypeSelect = (type) => {
  selectedType.value = type;
  isTypeDropdownOpen.value = false;
};

const isUpcoming = (dateStr) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return new Date(dateStr) > today;
};

onMounted(async () => {
  await store.loadData();

  const slider = filtersRef.value;
  if (slider) {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => {
      isDown = false;
    });
    slider.addEventListener('mouseup', () => {
      isDown = false;
    });
    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      slider.scrollLeft = scrollLeft - (x - startX) * 2;
    });
    slider.addEventListener(
      'wheel',
      (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          slider.scrollLeft += e.deltaY;
        }
      },
      { passive: false },
    );
  }

  window.addEventListener('click', () => {
    isTypeDropdownOpen.value = false;
  });
});

const filteredByCategory = store.filteredByCategory(selectedCategory, search);
const filteredByMonth = store.filteredByMonth(filteredByCategory, currentMonth);
const filteredByType = store.filteredByType(filteredByMonth, selectedType);
const filteredMCT = store.filteredByToday(filteredByType);

const visibleCategories = computed(() =>
  showAllCategories.value
    ? store.categories
    : store.categories.slice(0, visibleCount),
);

const mobileGroupedItems = computed(() => {
  const visible = filteredMCT.value.filter(
    (item) => !isUpcoming(item.date) || showUpcoming.value,
  );

  return visible.reduce((acc, item) => {
    const group = acc.find((entry) => entry.date === item.date);
    if (group) {
      group.items.push(item);
    } else {
      acc.push({ date: item.date, items: [item] });
    }
    return acc;
  }, []);
});

const isAllCategorySelected = computed(
  () =>
    Array.isArray(selectedCategory.value) &&
    selectedCategory.value.includes('전체'),
);

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

watch([currentMonth, selectedType, search], () => {
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
  selectedCategory.value = ['전체'];
};

const toggleCategory = (name) => {
  if (!Array.isArray(selectedCategory.value)) {
    selectedCategory.value = ['전체'];
  }

  if (name === '전체') {
    selectedCategory.value = ['전체'];
    return;
  }

  let current = selectedCategory.value.filter((c) => c !== '전체');

  const targetId = Number(name);

  if (current.includes(targetId)) {
    current = current.filter((c) => c !== targetId);
    selectedCategory.value = current.length === 0 ? ['전체'] : current;
  } else {
    selectedCategory.value = [...current, targetId];
  }
};

const prevMonth = () => {
  currentMonth.value = currentMonth.value === 1 ? 12 : currentMonth.value - 1;
};

const nextMonth = () => {
  currentMonth.value = currentMonth.value === 12 ? 1 : currentMonth.value + 1;
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

.month-picker-area {
  display: flex;
  align-items: center;
  gap: 24px;
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
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
  min-width: 0;
}

.dropdown-wrapper {
  position: relative;
}

.cat-item {
  display: flex;
  align-items: center;
  padding: 6px 14px 6px 6px;
  border-radius: 50px;
  background-color: var(--color-white);
  border: 1px solid var(--color-deepgray-10);
  cursor: pointer;
  transition: 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.subtitle-s {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-deepgray-100);
}

.icon-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.gray-bg {
  background-color: var(--color-gray-10);
}

.active-type {
  border-color: var(--color-primary);
  background-color: var(--color-primary-10);
}

.active-type span {
  color: var(--color-primary);
}

.dropdown-menu {
  position: absolute;
  top: 42px;
  left: 0;
  background-color: var(--color-white);
  border-radius: 16px;
  width: 140px;
  padding: 8px;
  z-index: 1000;
  box-shadow: var(--drop--shadow);
  border: 1px solid var(--color-gray-10);
  list-style: none;
  margin: 0;
}

.dropdown-menu li {
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  color: #444;
}

.dropdown-menu li:hover {
  background-color: var(--color-gray-10);
}

.dropdown-menu li.active {
  color: var(--color-primary);
  background-color: var(--color-primary-10);
  font-weight: 600;
}

.filters {
  height: 34px;
  line-height: 1;
  padding: 0 12px;
  width: 800px;
  margin: 15px 0;
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
  overflow: hidden;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  cursor: grab;
}

.filters::-webkit-scrollbar {
  display: none;
}

.filters button {
  flex-shrink: 0;
  white-space: nowrap;
  margin-right: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid #ddd;
  background: #f5f5f5;
}

.filters .active {
  background: #4caf50;
  color: white;
}

.toggle-btn,
.upcoming-toggle {
  height: 34px;
  min-width: unset;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border-radius: 20px;
  border: 1.5px solid #ccc;
  background: #fff;
  cursor: pointer;
  color: #444;
}

.upcoming {
  opacity: 0.4;
}

.arrow {
  margin-left: 6px;
  font-size: 10px;
  color: var(--color-deepgray-40);
  transition: 0.2s;
}

.arrow.open {
  transform: rotate(180deg);
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
  text-align: left;
}

.table th:first-child,
.table td:first-child {
  text-align: center;
}

.table thead th {
  position: sticky;
  top: 0;
  z-index: 0;
  background-color: #fff;
  box-shadow: inset 0 -1px 0 #eee;
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

.bulk-delete-btn.invisible {
  visibility: hidden;
  pointer-events: none;
}

.item-index {
  padding-left: 45px !important;
  padding-right: 70px !important;
  color: #888;
  font-size: 0.85rem;
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
