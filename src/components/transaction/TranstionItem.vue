<template>
  <div class="container">
    <!-- 상단 헤더 -->
    <div class="header">
      <button @click="prevMonth">
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
      <h2>{{ currentMonth }}월</h2>
      <button @click="nextMonth">
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
      <input
        v-model="search"
        placeholder="메모 검색"
        class="memo_window search-input"
      />
    </div>

    <!-- 카테고리 필터 -->
    <div class="filter_bar">
      <div class="type-dropdown">
        <select v-model="selectedType">
          <option value="전체">수입/지출</option>
          <option value="income">수입</option>
          <option value="expense">지출</option>
        </select>
        <svg
          class="dropdown-arrow"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="#666"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div class="filters" ref="filtersRef">
        <button
          :class="{ active: selectedCategory.includes('전체') }"
          @click="selectedCategory = '전체'"
        >
          전체
        </button>
        <button
          v-for="category in visibleCategories"
          :key="category.id"
          :class="{ active: selectedCategory.includes(category.name) }"
          :style="{
            background: selectedCategory.includes(category.name)
              ? category.color
              : '',
            borderColor: category.color,
          }"
          @click="toggleCategory(category.name)"
        >
          {{ category.img }} {{ category.name }}
        </button>
      </div>
      <button
        v-if="store.categories.length > visibleCount"
        class="toggle-btn"
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
      <button class="upcoming-toggle" @click="showUpcoming = !showUpcoming">
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

    <!-- 테이블 -->
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
          <th>메모</th>
          <th width="100px">
            <button v-if="selectedIds.length > 0" @click="deleteSelected">
              삭제
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in filteredMCT"
          :key="item.id"
          class="btn_hover"
          :class="{
            upcoming: item.isRecurring && new Date(item.date) > new Date(),
          }"
          v-show="
            !(item.isRecurring && new Date(item.date) > new Date()) ||
            showUpcoming
          "
        >
          <td>
            <input
              type="checkbox"
              :value="item.id"
              v-model="selectedIds"
              :disabled="item.isRecurring && new Date(item.date) > new Date()"
            />
          </td>
          <td class="item-index">{{ index + 1 }}</td>
          <td>{{ item.date }}</td>
          <td>{{ item.detail }}</td>
          <td>
            <span :class="item.type === 'expense' ? 'negative' : 'positive'">
              {{ item.type === 'expense' ? '-' : '+'
              }}{{ Number(item.amount).toLocaleString() }}원
            </span>
          </td>
          <td>
            <span
              :style="{ background: item.categoryColor }"
              class="categoryImg"
            >
              {{ item.categoryImg }}
            </span>
            {{ item.categoryName }}
          </td>
          <td>{{ item.memo }}</td>
          <td>
            <div class="button_hover">
              <!-- 수정 아이콘 -->
              <svg
                class="pencil_icon"
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.3632 5.65156L15.8431 4.17157C16.6242 3.39052 17.8905 3.39052 18.6716 4.17157L20.0858 5.58579C20.8668 6.36683 20.8668 7.63316 20.0858 8.41421L18.6058 9.8942M14.3632 5.65156L4.74749 15.2672C4.41542 15.5993 4.21079 16.0376 4.16947 16.5054L3.92738 19.2459C3.87261 19.8659 4.39148 20.3848 5.0115 20.33L7.75191 20.0879C8.21972 20.0466 8.65806 19.8419 8.99013 19.5099L18.6058 9.8942M14.3632 5.65156L18.6058 9.8942"
                  stroke="#000000"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <!-- 삭제 아이콘 -->
              <svg
                class="trash_icon"
                width="24px"
                height="24px"
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

    <!-- 삭제 완료 알림 (기존 등록 성공 모달 재사용) -->
    <SuccessModal
      :visible="successModal.visible"
      icon="✅"
      title="삭제 완료"
      description="내역이 안전하게 삭제되었습니다."
      @close="successModal.visible = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue';
import { useTransactionStore } from '@/stores/budgetStore';
import { useCategoryStore } from '@/stores/category';
import { useBudgetStore } from '@/stores/budgetStore2';
import ConfirmModal from '../common/ConfirmModal.vue';
import SuccessModal from '../common/CompleteModal.vue';

const showUpcoming = ref(false); // 기본값 false (안보임)
const store = useTransactionStore();
const categoryStore = useCategoryStore();
const calendarStore = useBudgetStore();

// 필터 상태
const currentMonth = ref(new Date().getMonth() + 1);
const selectedCategory = ref(['전체']);
const selectedType = ref('전체');
const search = ref('');
const selectedIds = ref([]);
const showAllCategories = ref(false);
const visibleCount = 5;
const filtersRef = ref(null);

// 모달 제어 상태
const deleteModal = reactive({ visible: false, targetId: null });
const successModal = reactive({ visible: false });

// 데이터 로드
onMounted(async () => {
  await store.loadData();

  // 마우스 드래그 스크롤
  const slider = filtersRef.value;
  let isDown = false,
    startX,
    scrollLeft;

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
});

// 필터링 (store의 헬퍼 활용)
const filteredByCategory = store.filteredByCategory(selectedCategory, search);
const filteredByMonth = store.filteredByMonth(filteredByCategory, currentMonth);
const filteredByType = store.filteredByType(filteredByMonth, selectedType);
const filteredMCT = store.filteredByToday(filteredByType); // ✅ 마지막에 연결
// 보이는 카테고리
const visibleCategories = computed(() =>
  showAllCategories.value
    ? store.categories
    : store.categories.slice(0, visibleCount),
);

// 전체 선택 체크박스도 filteredMCT 기준이라 문제없지만
// filteredMCT 안에서 selectedCategory 비교 부분 확인
const isAllSelected = computed(() => {
  const selectableItems = filteredMCT.value.filter(
    (item) => !(item.isRecurring && new Date(item.date) > new Date()),
  );
  return (
    selectableItems.length > 0 &&
    selectedIds.value.length === selectableItems.length
  );
});

const toggleAll = (e) => {
  selectedIds.value = e.target.checked
    ? filteredMCT.value
        .filter(
          (item) => !(item.isRecurring && new Date(item.date) > new Date()),
        )
        .map((item) => item.id)
    : [];
};

// 필터 변경 시 선택 초기화
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

const toggleCategory = (name) => {
  // 혹시라도 배열이 아니면 강제로 배열로 변환
  if (!Array.isArray(selectedCategory.value)) {
    selectedCategory.value = ['전체'];
  }

  if (name === '전체') {
    selectedCategory.value = ['전체'];
    return;
  }

  // '전체' 해제
  let current = selectedCategory.value.filter((c) => c !== '전체');

  if (current.includes(name)) {
    current = current.filter((c) => c !== name);
    selectedCategory.value = current.length === 0 ? ['전체'] : current;
  } else {
    selectedCategory.value = [...current, name];
  }
};

// 월 이동
const prevMonth = () => {
  currentMonth.value = currentMonth.value === 1 ? 12 : currentMonth.value - 1;
};
const nextMonth = () => {
  currentMonth.value = currentMonth.value === 12 ? 1 : currentMonth.value + 1;
};

// 💡 개별 삭제 로직
const handleDelete = (id) => {
  deleteModal.targetId = id;
  deleteModal.visible = true;
};

const executeDelete = async () => {
  try {
    const uid = store.myBudgets[0]?.uid; // 현재 유저 ID 확보
    await store.deleteBudget(deleteModal.targetId);

    // 관련된 다른 스토어들도 즉시 동기화
    if (uid) await categoryStore.fetchAll(uid); // 뱃지용 횟수 갱신
    await calendarStore.fetchData(); // 캘린더 점 갱신

    deleteModal.visible = false;
    successModal.visible = true; // 삭제 완료 모달 표시
  } catch (err) {
    alert('삭제 중 오류가 발생했습니다.');
  }
};
</script>

<!-- 기존 <style scoped> 그대로 유지 -->
<style scoped>
.container {
  padding: 20px;
  font-family: sans-serif;
}

.header {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filters {
  height: 34px; /* 추가 */
  line-height: 1; /* 추가 */
  padding: 0 12px; /* 상하 padding 제거하고 height로 통일 */
  width: 800px;
  margin: 15px 0;
  display: flex;
  gap: 8px;
  flex-wrap: nowrap; /* ❗ 줄바꿈 금지 */
  overflow: hidden; /* ❗ 넘치는 것 숨김 */
  overflow-x: auto; /* 넘치면 가로 스크롤 */
  -webkit-overflow-scrolling: touch; /* 부드러운 스크롤 (iOS) */
  padding-bottom: 4px; /* 스크롤바 공간 확보 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  cursor: grab; /* 마우스로 잡을 느낌 */
}
.filters::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.filters button {
  flex-shrink: 0; /* ❗ 줄어들지 않게 */
  white-space: nowrap; /* ❗ 텍스트 줄바꿈 방지 */
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

.table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* ✅ 핵심 */
}

.table th,
.table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
  text-align: left;
}

.categoryImg {
  padding: 3px;
  border-radius: 50%;
}

.button_hover {
  display: none; /* 기본 숨김 */
}
.btn_hover:hover .button_hover {
  display: block;
}

.pencil_icon {
  margin-right: 10px;
}
.pencil_icon:hover {
  transform: scale(1.2);
}

.trash_icon:hover {
  transform: scale(1.2);
}
td {
  height: 30px;
}

.filter_bar {
  display: flex;
  align-items: center; /* 🔥 세로 정렬 핵심 */
  gap: 10px;
}
.type-dropdown select {
  /* appearance: auto; /* 드롭다운 화살표 유지 */
  /* height: 34px; /* ✅ 버튼과 동일 */
  /* padding: 0 12px;
  border-radius: 18px;
  border: none;
  background: #f1f1f1;
  font-size: 14px; */
  /* line-height: 34px; 추가 */
  height: 34px;
  padding: 0 32px 0 14px; /* 오른쪽 padding 줄임 */
  border-radius: 18px;
  border: 1.5px solid #ccc;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  color: #444;
  appearance: none; /* 기본 화살표 제거 */
  -webkit-appearance: none;
}
.toggle-btn {
  height: 34px; /* 추가 */
  line-height: 1; /* 추가 */
  min-width: unset; /* 기존 min-width 제거 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #ddd;
  border: none;
  padding: 0 12px;
  border-radius: 20px;
  cursor: pointer;
}
.upcoming {
  opacity: 0.4;
}
.upcoming-toggle {
  width: 50px; /* 아이콘 커진 만큼 버튼도 키움 */
  height: 50px;
  line-height: 1; /* 추가 */
  min-width: unset; /* 기존 min-width 제거 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  padding: 0 12px;
  border-radius: 20px;
  border: 1px solid #ddd;
  background: #f5f5f5;
  cursor: pointer;
}
.upcoming-toggle:hover {
  background: #e0e0e0;
}
.toggle-btn,
.upcoming-toggle {
  margin-bottom: 5px;
}

.type-dropdown select,
.toggle-btn,
.upcoming-toggle {
  height: 34px;
  padding: 0 14px;
  border-radius: 18px;
  border: 1.5px solid #ccc;
  background: #fff;
  font-size: 13px;
  font-family: sans-serif;
  cursor: pointer;
  color: #444;
  transition:
    background 0.2s,
    border-color 0.2s;
  white-space: nowrap;
  line-height: 1;
}
.type-dropdown {
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-bottom: 5px;
}

.type-dropdown select:hover,
.toggle-btn:hover,
.upcoming-toggle:hover {
  background: #f0f0f0;
  border-color: #aaa;
}
.dropdown-arrow {
  position: absolute;
  right: 4px; /* 화살표 위치 왼쪽으로 당김 */
  pointer-events: none; /* 클릭 통과 */
}
.memo_window {
  margin-left: auto; /* 오른쪽 끝으로 */
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  height: 34px;
  padding: 0 14px 0 36px; /* 왼쪽에 아이콘 공간 */
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
  width: 220px; /* 포커스 시 살짝 늘어남 */
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.header button {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1.5px solid #e0e0e0;
  background: #f7f8fa;
  cursor: pointer;
  color: #555;
  font-size: 12px;
  transition: all 0.2s ease;
}

.header button:hover {
  background: #4caf50;
  border-color: #4caf50;
  color: white;
  transform: scale(1.1);
}

.header button:active {
  transform: scale(0.95);
}
.negative {
  color: #e74c3c;
  font-weight: 500;
}
.positive {
  color: #2ecc71;
  font-weight: 500;
}

.item-index {
  padding-left: 45px !important;
  padding-right: 70px !important;
  color: #888;
  font-size: 0.85rem;
}
</style>
