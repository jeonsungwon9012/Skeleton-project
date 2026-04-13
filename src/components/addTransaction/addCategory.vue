<script setup>
import { computed, reactive, ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useTransactionStore } from '@/stores/budgetStore';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  categories: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['close', 'created']);
const transactionStore = useTransactionStore();
const userStore = useUserStore();

const isSubmitting = ref(false);
const errorMessage = ref('');

const presetColors = [
  { name: '빨강', value: '#FF7676' },
  { name: '주황', value: '#FFB347' },
  { name: '노랑', value: '#FDE16D' },
  { name: '초록', value: '#67EA76' },
  { name: '민트', value: '#4DD0E1' },
  { name: '파랑', value: '#64B5F6' },
  { name: '보라', value: '#9575CD' },
  { name: '핑크', value: '#F06292' },
  { name: '브라운', value: '#A1887F' },
  { name: '회색', value: '#90A4AE' },
];

const form = reactive({
  name: '',
  img: '',
  color: presetColors[9].value,
});

const selectedColorName = computed(
  () => presetColors.find((color) => color.value === form.color)?.name || '',
);

const resetForm = () => {
  form.name = '';
  form.img = '';
  form.color = presetColors[9].value;
  errorMessage.value = '';
};

const handleClose = () => {
  if (isSubmitting.value) {
    return;
  }

  resetForm();
  emit('close');
};

const handleSubmit = async () => {
  if (!form.name.trim()) {
    errorMessage.value = '카테고리 이름을 입력해주세요.';
    return;
  }

  if (!form.img.trim()) {
    errorMessage.value = '아이콘을 입력해주세요.';
    return;
  }

  const duplicated = props.categories.some(
    (category) =>
      category.name?.trim().toLowerCase() === form.name.trim().toLowerCase(),
  );

  if (duplicated) {
    errorMessage.value = '같은 이름의 카테고리가 이미 있습니다.';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    const createdCategory = await transactionStore.addCategory({
      name: form.name.trim(),
      img: form.img.trim(),
      color: form.color,
      isBasic: false,
      uid: userStore.user?.id, // 💡 생성한 유저의 ID 추가
    });

    emit('created', createdCategory);
    resetForm();
  } catch (error) {
    errorMessage.value = error?.message || '카테고리 추가에 실패했습니다.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div v-if="visible" class="category-modal-backdrop" @click="handleClose">
    <div class="category-modal" @click.stop>
      <div class="category-modal-header">
        <h3 class="category-modal-title">카테고리 추가</h3>
        <button
          type="button"
          class="category-close-button"
          @click="handleClose"
        >
          닫기
        </button>
      </div>

      <div class="category-preview">
        <div
          class="category-preview-icon"
          :style="{ backgroundColor: form.color }"
        >
          {{ form.img || '+' }}
        </div>
        <div class="category-preview-text">
          <div class="category-preview-name">
            {{ form.name || '새 카테고리' }}
          </div>
          <div class="category-preview-color">{{ selectedColorName }}</div>
        </div>
      </div>

      <label class="category-field">
        <span class="category-label">이름</span>
        <input
          v-model="form.name"
          type="text"
          class="category-input"
          placeholder="예: 운동"
        />
      </label>

      <label class="category-field">
        <span class="category-label">아이콘</span>
        <input
          v-model="form.img"
          type="text"
          class="category-input"
          placeholder="예: 🏃"
        />
      </label>

      <div class="category-field">
        <span class="category-label">색상</span>
        <div class="category-color-grid">
          <button
            v-for="color in presetColors"
            :key="color.value"
            type="button"
            class="category-color-chip"
            :class="{ active: form.color === color.value }"
            :style="{ backgroundColor: color.value }"
            :aria-label="color.name"
            @click="form.color = color.value"
          ></button>
        </div>
      </div>

      <p v-if="errorMessage" class="category-error-message">
        {{ errorMessage }}
      </p>

      <div class="category-actions">
        <button
          type="button"
          class="category-secondary-button"
          @click="handleClose"
        >
          취소
        </button>
        <button
          type="button"
          class="category-primary-button"
          @click="handleSubmit"
        >
          {{ isSubmitting ? '추가 중...' : '추가하기' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: rgba(44, 51, 51, 0.18);
}

.category-modal {
  width: min(100%, 360px);
  border-radius: 24px;
  background-color: var(--color-white);
  padding: 24px;
  box-shadow: 0 20px 40px rgba(44, 51, 51, 0.14);
}

.category-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.category-modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-deepgray-100);
}

.category-close-button {
  border: none;
  background: transparent;
  color: var(--color-deepgray-60);
  cursor: pointer;
}

.category-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  margin-bottom: 18px;
  border-radius: 18px;
  background-color: var(--color-gray-10);
}

.category-preview-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}

.category-preview-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-preview-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-deepgray-100);
}

.category-preview-color {
  font-size: 0.85rem;
  color: var(--color-deepgray-60);
}

.category-field {
  display: block;
  margin-bottom: 14px;
}

.category-label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-deepgray-80);
}

.category-input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border: none;
  border-radius: 14px;
  background-color: var(--color-gray-10);
  box-sizing: border-box;
  font-size: 1rem;
}

.category-color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.category-color-chip {
  width: 100%;
  aspect-ratio: 1;
  border: 3px solid transparent;
  border-radius: 14px;
  cursor: pointer;
}

.category-color-chip.active {
  border-color: var(--color-deepgray-100);
  box-shadow: var(--drop--shadow);
}

.category-error-message {
  margin: 0 0 14px;
  color: #d13d3d;
  font-size: 0.9rem;
  font-weight: 600;
}

.category-actions {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}

.category-secondary-button,
.category-primary-button {
  flex: 1;
  height: 46px;
  border: none;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
}

.category-secondary-button {
  background-color: var(--color-deepgray-10);
  color: var(--color-deepgray-100);
}

.category-primary-button {
  background-color: var(--color-primary);
  color: var(--color-deepgray-100);
}
</style>
