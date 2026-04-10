<script setup>
import { ref, computed } from 'vue';

// 상태 및 필터값 수신
const props = defineProps({
  selectedCategories: { type: Array, default: () => [] },
  selectedType: { type: String, default: 'all' },
  isScheduledOnly: { type: Boolean, default: false }
})

// 부모 컴포넌트로 이벤트 전송
const emit = defineEmits(['select-type', 'toggle-category', 'toggle-scheduled', 'select-all'])

// 드롭다운 열림 상태
const isDropdownOpen = ref(false);

// 드롭다운 토글
const toggleDropdown = () => { isDropdownOpen.value = !isDropdownOpen.value; };

// 버튼 표시 텍스트 계산
const typeLabel = computed(() => {
  if (props.selectedType === 'income') return '수입 내역';
  if (props.selectedType === 'expense') return '지출 내역';
  return '수입/지출';
});

// 카테고리 목록 데이터
const categories = [
  { id: 1, name: '식비', emoji: '🍎', colorName: 'red' },
  { id: 2, name: '카페', emoji: '☕', colorName: 'orange' },
  { id: 3, name: '고정지출', emoji: '🏠', colorName: 'green' },
  { id: 4, name: '교통', emoji: '🚌', colorName: 'mint' }
]

// 타입 선택 처리 및 드롭다운 닫기
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

      <ul v-if="isDropdownOpen" class="dropdown-menu shadow">
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
          :style="selectedCategories.includes(cat.id) ? {
            backgroundColor: `var(--category-${cat.colorName})`,
            color: 'var(--color-white)',
            border: 'none'
          } : {}"
          @click="$emit('toggle-category', cat.id)"
      >
        <div class="icon-circle white-bg">{{ cat.emoji }}</div>
        <span class="subtitle-s">{{ cat.name }}</span>
      </button>
    </div>

    <button class="edit-btn">✏️</button>
  </div>
</template>

<style scoped>
.category-filter-container { display: flex; gap: 10px; align-items: center; padding: 10px 0; }

.cat-item {
  display: flex; align-items: center; padding: 6px 14px 6px 6px;
  border-radius: 50px; background: var(--color-white);
  border: 1px solid var(--color-deepgray-10); cursor: pointer;
  transition: 0.2s; white-space: nowrap; font-family: inherit;
}

/* 💡 수입/지출 활성화 시 (초록색 테두리/배경 등 다래님 디자인 시스템에 맞춰 조정 가능) */
.active-type {
  border-color: var(--color-primary);
  background-color: var(--color-primary-10);
  color: var(--color-primary);
}

.active-pill { border-color: var(--color-deepgray-100); background: var(--color-gray-10); }

.active-scheduled {
  border-color: var(--color-primary);
  background-color: var(--color-primary-10);
  color: var(--color-primary);
}

.dropdown-wrapper { position: relative; }
.dropdown-menu {
  position: absolute; top: 48px; left: 0; background: white; border-radius: 16px;
  width: 150px; padding: 8px; z-index: 1000; list-style: none;
  box-shadow: 0px 10px 25px rgba(0,0,0,0.1); border: 1px solid var(--color-gray-10);
}

.dropdown-menu li { padding: 10px 12px; border-radius: 10px; cursor: pointer; font-size: 14px; }
.dropdown-menu li:hover { background: var(--color-gray-10); }
.dropdown-menu li.active { color: var(--color-primary); font-weight: 600; background: var(--color-primary-10); }

.icon-circle {
  width: 28px; height: 28px; border-radius: 50%; margin-right: 8px;
  display: flex; align-items: center; justify-content: center; font-size: 14px;
}

.gray-bg { background: var(--color-gray-10); }
.primary-bg { background: var(--color-primary-10); }
.white-bg { background: var(--color-white); }

.category-list { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
.category-list::-webkit-scrollbar { display: none; }

.divider { width: 1px; height: 18px; background: var(--color-deepgray-10); margin: 0 4px; flex-shrink: 0; }

.edit-btn {
  background: var(--color-gray-10); border: none; width: 34px; height: 34px;
  border-radius: 50%; cursor: pointer; display: flex; align-items: center;
  justify-content: center; flex-shrink: 0;
}

.arrow { margin-left: 6px; font-size: 10px; color: var(--color-deepgray-40); transition: 0.2s; }
.arrow.open { transform: rotate(180deg); }
</style>