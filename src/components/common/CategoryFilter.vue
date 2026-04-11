<script setup>
import { ref, computed } from 'vue';

// 💡 부모(CalendarMain)로부터 진짜 DB 데이터를 받음
const props = defineProps({
  categories: { type: Array, default: () => [] },          // 스토어의 categories.value
  selectedCategories: { type: Array, default: () => [] }, // 선택된 ID 배열
  selectedType: { type: String, default: 'all' },
  isScheduledOnly: { type: Boolean, default: false }
})

const emit = defineEmits(['select-type', 'toggle-category', 'toggle-scheduled', 'select-all'])

// 수입/지출 드롭다운 상태
const isDropdownOpen = ref(false);
const toggleDropdown = () => { isDropdownOpen.value = !isDropdownOpen.value; };

// 버튼 표시 텍스트 계산
const typeLabel = computed(() => {
  if (props.selectedType === 'income') return '수입 내역';
  if (props.selectedType === 'expense') return '지출 내역';
  return '수입/지출';
});

const handleTypeSelect = (type) => {
  emit('select-type', type);
  isDropdownOpen.value = false;
};
</script>

<template>
  <div class="category-filter-container">

    <div class="dropdown-wrapper">
      <button class="cat-item dropdown-trigger"
              :class="{ 'active-type': selectedType !== 'all' }"
              @click.stop="toggleDropdown">
        <div class="icon-circle gray-bg">⇅</div>
        <span class="subtitle-s">{{ typeLabel }}</span>
        <span class="arrow" :class="{ open: isDropdownOpen }">▾</span>
      </button>

      <ul v-if="isDropdownOpen" class="dropdown-menu">
        <li @click="handleTypeSelect('all')" :class="{ active: selectedType === 'all' }">전체 내역</li>
        <li @click="handleTypeSelect('income')" :class="{ active: selectedType === 'income' }">수입 내역</li>
        <li @click="handleTypeSelect('expense')" :class="{ active: selectedType === 'expense' }">지출 내역</li>
      </ul>
    </div>

    <div class="divider"></div>

    <button
        class="cat-item"
        :class="{ 'active-pill': selectedType === 'all' && !isScheduledOnly && selectedCategories.length === 0 }"
        @click="$emit('select-all')"
    >
      <div class="icon-circle gray-bg">📄</div>
      <span class="subtitle-s">전체</span>
    </button>

    <button
        class="cat-item"
        :class="{ 'active-scheduled': isScheduledOnly }"
        @click="$emit('toggle-scheduled')"
    >
      <div class="icon-circle primary-bg">⏰</div>
      <span class="subtitle-s">예정</span>
    </button>

    <div class="divider"></div>

    <div class="category-list">
      <button
          v-for="cat in categories" :key="cat.id"
          class="cat-item"
      :style="selectedCategories.includes(Number(cat.id)) ? {
      backgroundColor: cat.color,
      color: 'var(--color-white)',
      border: 'none'
      } : {}"
      @click="$emit('toggle-category', cat.id)"
      >
      <div class="icon-circle white-bg">{{ cat.img }}</div>
      <span class="subtitle-s">{{ cat.name }}</span>
      </button>
    </div>

    <button class="edit-btn">✏️</button>
  </div>
</template>

<style scoped>
/* 소연님의 디자인 시스템(CSS 변수) 철저히 반영 */
.category-filter-container {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 0;
  font-family: var(--font-main);
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
}

/* 텍스트 스타일 */
.subtitle-s {
  font-size: var(--subtitle--s);
  font-weight: 500;
  color: var(--color-deepgray-100);
}

/* 활성화 상태 */
.active-type, .active-scheduled {
  border-color: var(--color-primary);
  background-color: var(--color-primary-10);
}
.active-type span, .active-scheduled span { color: var(--color-primary); }

.active-pill { border-color: var(--color-deepgray-100); background: var(--color-gray-10); }

/* 드롭다운 */
.dropdown-wrapper { position: relative; }
.dropdown-menu {
  position: absolute; top: 48px; left: 0;
  background-color: var(--color-white);
  border-radius: 16px;
  width: 150px; padding: 8px; z-index: 1000;
  box-shadow: var(--drop--shadow);
  border: 1px solid var(--color-gray-10);
}

.dropdown-menu li {
  padding: 10px 12px; border-radius: 10px; cursor: pointer;
  font-size: var(--subtitle--s);
}
.dropdown-menu li:hover { background-color: var(--color-gray-10); }
.dropdown-menu li.active {
  color: var(--color-primary);
  background-color: var(--color-primary-10);
  font-weight: 600;
}

/* 아이콘 원형 데코 */
.icon-circle {
  width: 28px; height: 28px; border-radius: 50%; margin-right: 8px;
  display: flex; align-items: center; justify-content: center; font-size: 14px;
}
.gray-bg { background-color: var(--color-gray-10); }
.primary-bg { background-color: var(--color-primary-10); }
.white-bg { background-color: var(--color-white); }

.category-list { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
.category-list::-webkit-scrollbar { display: none; }

.divider { width: 1px; height: 18px; background-color: var(--color-deepgray-10); margin: 0 4px; flex-shrink: 0; }

.edit-btn {
  background-color: var(--color-gray-10); border: none; width: 34px; height: 34px;
  border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;
}

.arrow { margin-left: 6px; font-size: 10px; color: var(--color-deepgray-40); transition: 0.2s; }
.arrow.open { transform: rotate(180deg); }
</style>