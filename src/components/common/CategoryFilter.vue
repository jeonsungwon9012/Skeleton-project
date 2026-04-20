<script setup>
import { computed, ref, onMounted } from 'vue';

const props = defineProps({
  categories: { type: Array, default: () => [] },
  selectedCategories: { type: Array, default: () => [] },
  selectedType: { type: String, default: 'all' },
  isScheduledOnly: { type: Boolean, default: false },
});

const emit = defineEmits([
  'select-type',
  'toggle-category',
  'toggle-scheduled',
  'select-all',
]);

const isDropdownOpen = ref(false);
const isCategoryOpen = ref(false);

const filterRowRef = ref(null);
const categoryListRef = ref(null);

/**
 * 드래그 및 휠 스크롤 로직 초기화
 */
const initDragScroll = (el) => {
  if (!el) return;
  let isDown = false;
  let startX;
  let scrollLeft;

  el.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - el.offsetLeft;
    scrollLeft = el.scrollLeft;
    el.style.cursor = 'grabbing';
  });

  const stopDragging = () => {
    isDown = false;
    el.style.cursor = 'grab';
  };

  el.addEventListener('mouseleave', stopDragging);
  el.addEventListener('mouseup', stopDragging);

  el.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5; // 스크롤 속도 조절
    el.scrollLeft = scrollLeft - walk;
  });

  el.addEventListener(
    'wheel',
    (e) => {
      if (e.deltaY !== 0) {
        el.scrollLeft += e.deltaY;
        e.preventDefault(); // 세로 스크롤 방지
      }
    },
    { passive: false },
  );
};

onMounted(() => {
  initDragScroll(filterRowRef.value);
  initDragScroll(categoryListRef.value);
});

const typeLabel = computed(() => {
  if (props.selectedType === 'income') return '수입';
  if (props.selectedType === 'expense') return '지출';
  if (props.selectedType === 'all') return '전체';
  return '수입/지출';
});

const selectedCategoryCount = computed(() => props.selectedCategories.length);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const toggleCategoryPanel = () => {
  isCategoryOpen.value = !isCategoryOpen.value;
};

const handleTypeSelect = (type) => {
  emit('select-type', type);
  isDropdownOpen.value = false;
};

const handleSelectAll = () => {
  emit('select-all');
};

const handleToggleScheduled = () => {
  emit('toggle-scheduled');
};

const handleToggleCategory = (id) => {
  emit('toggle-category', id);
};
</script>

<template>
  <div class="category-filter-container">
    <div class="filter-row" ref="filterRowRef">
      <div class="dropdown-wrapper">
        <button
          class="cat-item dropdown-trigger"
          :class="{ 'active-type': selectedType !== 'all' }"
          type="button"
          @click.stop="toggleDropdown"
        >
          <div class="icon-circle gray-bg">⇵</div>
          <span class="subtitle-s">{{ typeLabel }}</span>
          <span class="arrow" :class="{ open: isDropdownOpen }">⌄</span>
        </button>

        <ul v-if="isDropdownOpen" class="dropdown-menu">
          <li
            :class="{ active: selectedType === 'all' }"
            @click="handleTypeSelect('all')"
          >
            전체
          </li>
          <li
            :class="{ active: selectedType === 'income' }"
            @click="handleTypeSelect('income')"
          >
            수입
          </li>
          <li
            :class="{ active: selectedType === 'expense' }"
            @click="handleTypeSelect('expense')"
          >
            지출
          </li>
        </ul>
      </div>

      <div class="divider"></div>

      <button
        class="cat-item"
        :class="{
          'active-pill': !isScheduledOnly && selectedCategories.length === 0,
        }"
        type="button"
        @click="handleSelectAll"
      >
        <div
          class="icon-circle"
          :class="
            !isScheduledOnly && selectedCategories.length === 0
              ? 'primary-bg'
              : 'gray-bg'
          "
        >
          ✓
        </div>
        <span class="subtitle-s">전체</span>
      </button>

      <button
        class="cat-item"
        :class="{ 'active-scheduled': isScheduledOnly }"
        type="button"
        @click="handleToggleScheduled"
      >
        <div class="icon-circle primary-bg">⏰</div>
        <span class="subtitle-s">예정</span>
      </button>

      <div class="divider mobile-hidden"></div>

      <button
        class="category-toggle"
        :class="{ open: isCategoryOpen, active: selectedCategoryCount > 0 }"
        type="button"
        @click="toggleCategoryPanel"
      >
        <span class="toggle-text subtitle-s">
          카테고리
          <span v-if="selectedCategoryCount > 0" class="toggle-count">{{
            selectedCategoryCount
          }}</span>
        </span>
        <span class="arrow" :class="{ open: isCategoryOpen }">⌄</span>
      </button>
    </div>

    <div
      class="category-list"
      :class="{ open: isCategoryOpen }"
      ref="categoryListRef"
    >
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="cat-item"
        type="button"
        :style="
          selectedCategories.includes(Number(cat.id))
            ? {
                backgroundColor: cat.color,
                color: 'var(--color-white)',
                border: 'none',
              }
            : {}
        "
        @click="handleToggleCategory(cat.id)"
      >
        <div class="icon-circle white-bg">{{ cat.img }}</div>
        <span class="subtitle-s">{{ cat.name }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.category-filter-container {
  display: flex;
  flex-direction: column;
  gap: 6px; /* 두 줄 사이의 간격을 좁혀서 '아래로 밀림' 해결 */
  width: 100%;
  max-width: 100%;
  min-width: 0;
  font-family: var(--font-main);
  box-sizing: border-box;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 100%;
  justify-content: flex-start; /* 중앙 정렬 해제: 왼쪽부터 정렬 */
  min-width: 0;
  box-sizing: border-box;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox 스크롤바 숨김 */
  cursor: grab;
}

.filter-row::-webkit-scrollbar {
  display: none; /* Chrome 스크롤바 숨김 */
}

.cat-item,
.category-toggle {
  display: inline-flex;
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
  font-size: var(--subtitle--s);
  font-weight: 500;
  color: var(--color-deepgray-100);
}

.active-type,
.active-scheduled,
.active-pill,
.category-toggle.active,
.category-toggle.open {
  border-color: var(--color-primary);
  background-color: var(--color-primary-10);
}

.active-type span,
.active-scheduled span,
.active-pill span {
  color: var(--color-primary);
}

.dropdown-wrapper {
  position: relative;
  flex-shrink: 0;
}

.dropdown-menu {
  position: absolute;
  top: 48px;
  left: 0;
  background-color: var(--color-white);
  border-radius: 16px;
  width: 150px;
  padding: 8px;
  z-index: 1000;
  box-shadow: var(--drop--shadow);
  border: 1px solid var(--color-gray-10);
}

.dropdown-menu li {
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-size: var(--subtitle--s);
}

.dropdown-menu li:hover {
  background-color: var(--color-gray-10);
}

.dropdown-menu li.active {
  color: var(--color-primary);
  background-color: var(--color-primary-10);
  font-weight: 600;
}

.icon-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.gray-bg {
  background-color: var(--color-gray-10);
}

.primary-bg {
  background-color: var(--color-primary-10);
}

.white-bg {
  background-color: var(--color-white);
}

.category-toggle {
  margin-left: auto;
  padding-right: 12px;
}

.toggle-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.toggle-count {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 0.72rem;
  line-height: 18px;
  text-align: center;
}

.category-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  justify-content: flex-start;
  width: 100%;
  min-width: 0;
  cursor: grab;
  /* 슬라이드 효과를 위한 설정 */
  max-height: 0;
  opacity: 0;
  overflow-y: hidden;
  transition:
    max-height 0.3s ease-in-out,
    opacity 0.2s ease-in-out,
    padding 0.3s ease-in-out;
  padding: 0;
}

.category-list.open {
  max-height: 200px; /* 카테고리 리스트의 최대 높이 (내용에 맞게 조절 가능) */
  opacity: 1;
  padding: 8px 0;
}

.category-list::-webkit-scrollbar {
  display: none;
}

.divider {
  width: 1px;
  height: 18px;
  background-color: var(--color-deepgray-10);
  margin: 0 4px;
  flex-shrink: 0;
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

@media (max-width: 768px) {
  .category-filter-container {
    gap: 8px;
    padding: 0;
  }

  .filter-row {
  }
  .mobile-hidden {
    display: none;
  }

  .dropdown-menu {
    top: calc(100% + 6px);
  }

  .category-toggle {
    margin-left: 0;
  }

  .category-list {
    display: none;
    overflow-x: visible;
    flex-wrap: wrap;
    max-width: 100%;
  }

  .category-list.open {
    display: flex;
  }

  .category-list .cat-item {
    flex: 0 1 auto;
    max-width: 100%;
  }
}
</style>
