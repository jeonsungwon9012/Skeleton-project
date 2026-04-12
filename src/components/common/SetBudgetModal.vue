<script setup>
import { ref, reactive, computed, watch } from 'vue';
import SuccessModal from './CompleteModal.vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  categories: { type: Array, default: () => [] },
  currentMonthDisplay: { type: String, default: '' }, // 💡 현재 월 표시 Prop
});

const emit = defineEmits(['close', 'save']);

const dropdownOpen = ref(false);
const form = reactive({
  cid: '',
  amount: '',
});
const errorModal = ref({ visible: false, msg: '' });

const selectedCategory = computed(
  () => props.categories.find((c) => Number(c.id) === Number(form.cid)) || null,
);

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const selectCategory = (cat) => {
  form.cid = cat.id;
  dropdownOpen.value = false;
};

const handleSave = () => {
  if (!form.cid || !form.amount) {
    errorModal.value = {
      visible: true,
      msg: '카테고리와 목표 금액을 모두 입력해주세요.',
    };
    return;
  }
  emit('save', { cid: Number(form.cid), amount: Number(form.amount) });
  resetForm();
};

const resetForm = () => {
  form.cid = '';
  form.amount = '';
  dropdownOpen.value = false;
};

const handleClose = () => {
  resetForm();
  emit('close');
};

// 모달이 닫혀있을 때 상태 초기화
watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) resetForm();
  },
);
</script>

<template>
  <div v-if="visible" class="modal-backdrop" @click="handleClose">
    <div class="modal-card" @click.stop>
      <div class="modal-header">
        <h3>카테고리 예산 설정</h3>
        <p class="modal-month">{{ currentMonthDisplay }}</p>
        <button class="close-x" @click="handleClose">&times;</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">카테고리 선택</label>
          <div class="custom-category-select">
            <button
              type="button"
              class="category-selected"
              @click="toggleDropdown"
            >
              <div class="category-selected-left">
                <div
                  class="category-icon-circle"
                  :style="{
                    backgroundColor: selectedCategory?.color || '#e9ecef',
                  }"
                >
                  {{ selectedCategory?.img || '' }}
                </div>
                <span class="category-selected-text">{{
                  selectedCategory?.name || '카테고리를 선택하세요'
                }}</span>
              </div>
              <span class="category-arrow">{{ dropdownOpen ? '▲' : '▼' }}</span>
            </button>

            <div v-if="dropdownOpen" class="category-dropdown">
              <button
                v-for="cat in categories"
                :key="cat.id"
                type="button"
                class="category-option"
                @click="selectCategory(cat)"
              >
                <div
                  class="category-icon-circle"
                  :style="{ backgroundColor: cat.color }"
                >
                  {{ cat.img }}
                </div>
                <span class="category-option-text">{{ cat.name }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">목표 예산 금액</label>
          <input
            v-model="form.amount"
            type="number"
            class="form-input"
            placeholder="금액을 입력하세요 (원)"
          />
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-save" @click="handleSave">설정 완료</button>
      </div>
    </div>
  </div>

  <SuccessModal
    :visible="errorModal.visible"
    icon="⚠️"
    title="입력 오류"
    :description="errorModal.msg"
    @close="errorModal.visible = false"
  />
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
}
.modal-card {
  width: min(90%, 380px);
  background: white;
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
}
.modal-month {
  margin: 0;
  font-size: 0.9rem;
  color: #888;
  font-weight: 500;
}
.close-x {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.form-group {
  margin-bottom: 20px;
}
.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  color: #666;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  height: 52px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1.5px solid #f1f1f1;
  background-color: #fcfcfc;
  font-size: 1rem;
  outline: none;
  box-sizing: border-box;
}
.form-input:focus {
  border-color: var(--color-primary);
  background-color: #fff;
}

/* 카테고리 드롭다운 스타일 (addTransaction 계승) */
.custom-category-select {
  position: relative;
}
.category-selected {
  width: 100%;
  height: 52px;
  border: 1.5px solid #f1f1f1;
  border-radius: 14px;
  background-color: #fcfcfc;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}
.category-selected-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.category-icon-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
.category-selected-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
}
.category-arrow {
  font-size: 14px;
  color: #aaa;
}

.category-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1);
  padding: 8px;
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
  border: 1px solid #f1f1f1;
}
.category-option {
  width: 100%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
}
.category-option:hover {
  background: #f5f5f5;
}
.category-option-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #444;
}

.btn-save {
  width: 100%;
  height: 54px;
  border-radius: 16px;
  border: none;
  background: var(--color-primary);
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
}
.btn-save:hover {
  filter: brightness(1.05);
}
</style>
