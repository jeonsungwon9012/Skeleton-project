<template>
  <div class="container">
    <!-- 상단 헤더 -->
    <div class="header">
      <button @click="prevMonth">◀</button>
      <h2>{{ currentMonth }}월</h2>
      <button @click="nextMonth">▶</button>
      <input v-model="search" placeholder="메모 검색" />
    </div>

    <!-- 카테고리 필터 -->
    <div class="filter_bar">
      <div class="type-dropdown">
        <select v-model="selectedType">
          <option value="전체">수입/지출</option>
          <option value="income">수입</option>
          <option value="expense">지출</option>
        </select>
      </div>
      <div class="filters" ref="filtersRef">
        <button
          :class="{ active: selectedCategory === '전체' }"
          @click="selectedCategory = '전체'"
        >
          전체
        </button>
        <button
          v-for="category in visibleCategories"
          :key="category.id"
          :class="{ active: selectedCategory === category.name }"
          @click="selectedCategory = category.name"
        >
          {{ category.img }} {{ category.name }}
        </button>
        <button
          v-if="store.categories.length > visibleCount"
          class="toggle-btn"
          @click="showAllCategories = !showAllCategories"
        >
          {{ showAllCategories ? '접기' : '더보기' }}
        </button>
      </div>
    </div>

    <!-- 테이블 -->
    <table class="table">
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="toggleAll"
            />
          </th>
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
        <tr v-for="item in filteredMCT" :key="item.id" class="btn_hover">
          <td>
            <input type="checkbox" :value="item.id" v-model="selectedIds" />
          </td>
          <td>{{ item.date }}</td>
          <td>{{ item.detail }}</td>
          <td>{{ item.amount }}</td>
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useTransactionStore } from '@/stores/budgetStore';

const store = useTransactionStore();

// 필터 상태
const currentMonth = ref(new Date().getMonth() + 1);
const selectedCategory = ref('전체');
const selectedType = ref('전체');
const search = ref('');
const selectedIds = ref([]);
const showAllCategories = ref(false);
const visibleCount = 5;
const filtersRef = ref(null);

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
const filteredMCT = store.filteredByType(filteredByMonth, selectedType);

// 보이는 카테고리
const visibleCategories = computed(() =>
  showAllCategories.value
    ? store.categories
    : store.categories.slice(0, visibleCount),
);

// 전체 선택
const isAllSelected = computed(
  () =>
    filteredMCT.value.length > 0 &&
    selectedIds.value.length === filteredMCT.value.length,
);

const toggleAll = (e) => {
  selectedIds.value = e.target.checked
    ? filteredMCT.value.map((item) => item.id)
    : [];
};

// 필터 변경 시 선택 초기화
watch([currentMonth, selectedCategory, selectedType, search], () => {
  selectedIds.value = [];
});

// 월 이동
const prevMonth = () => {
  currentMonth.value = currentMonth.value === 1 ? 12 : currentMonth.value - 1;
};
const nextMonth = () => {
  currentMonth.value = currentMonth.value === 12 ? 1 : currentMonth.value + 1;
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
  height: 32px; /* ✅ 버튼과 동일 */
  padding: 0 12px;
  border-radius: 18px;
  border: none;
  background: #f1f1f1;
  font-size: 14px;
}
.toggle-btn {
  background-color: #ddd;
  border: none;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
}
</style>
