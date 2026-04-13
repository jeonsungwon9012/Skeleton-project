<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useTransactionStore } from '@/stores/budgetStore';
import { useUserStore } from '@/stores/userStore';
import { useTemplateStore } from '@/stores/template';

const props = defineProps({
  visible: { type: Boolean, default: false },
  item: { type: Object, default: null },
});

const emit = defineEmits(['close']);

const transactionStore = useTransactionStore();
const userStore = useUserStore();
const templateStore = useTemplateStore();

const isSubmitting = ref(false);
const dropdownOpen = ref(false);
const errorMessage = ref('');

const form = reactive({
  type: 'expense',
  detail: '',
  amount: '',
  cid: '',
  memo: '',
});

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      if (props.item) {
        form.type = props.item.type;
        form.detail = props.item.detail;
        form.amount = props.item.amount;
        form.cid = props.item.cid;
        form.memo = props.item.memo || '';
      } else {
        resetForm();
      }
    }
  },
);

const categories = computed(() => transactionStore.categories);
const selectedCategory = computed(
  () => categories.value.find((c) => Number(c.id) === Number(form.cid)) || null,
);

onMounted(async () => {
  if (categories.value.length === 0) {
    await transactionStore.loadData();
  }
});

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const selectCategory = (cat) => {
  form.cid = cat.id;
  dropdownOpen.value = false;
};

const resetForm = () => {
  form.type = 'expense';
  form.detail = '';
  form.amount = '';
  form.cid = '';
  form.memo = '';
  errorMessage.value = '';
};

const handleClose = () => {
  resetForm();
  emit('close');
};

const handleSubmit = async () => {
  if (!form.detail.trim() || !form.amount || !form.cid) {
    errorMessage.value = '필수 항목을 모두 입력해주세요.';
    return;
  }

  isSubmitting.value = true;
  try {
    const uid = Number(userStore.user?.id);
    const payload = {
      uid,
      type: form.type,
      detail: form.detail.trim(),
      amount: Number(form.amount),
      cid: Number(form.cid),
      memo: form.memo.trim(),
    };

    if (props.item?.id) {
      await transactionStore.editTemplate(props.item.id, {
        ...payload,
        id: props.item.id,
      });
    } else {
      await transactionStore.addTemplate(payload);
    }

    await templateStore.fetchTemplates(uid);
    handleClose();
  } catch {
    errorMessage.value = '템플릿 저장에 실패했습니다.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-backdrop" @click="handleClose">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <h3>{{ item ? '템플릿 수정' : '템플릿 등록' }}</h3>
          <button class="close-x" @click="handleClose">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <div class="type-tabs">
              <button
                type="button"
                class="type-tab"
                :class="{ active: form.type === 'income' }"
                @click="form.type = 'income'"
              >
                수입
              </button>
              <button
                type="button"
                class="type-tab expense"
                :class="{ active: form.type === 'expense' }"
                @click="form.type = 'expense'"
              >
                지출
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">내역명</label>
            <input
              v-model="form.detail"
              type="text"
              class="form-input"
              placeholder="예: 점심값, 월급"
            />
          </div>

          <div class="form-group">
            <label class="form-label">카테고리</label>
            <div class="custom-category-select">
              <button
                type="button"
                class="category-selected"
                @click="toggleDropdown"
              >
                <div class="category-selected-left">
                  <div
                    class="category-icon-circle"
                    :style="{ backgroundColor: selectedCategory?.color || '#e9ecef' }"
                  >
                    {{ selectedCategory?.img || '' }}
                  </div>
                  <span class="category-selected-text">
                    {{ selectedCategory?.name || '선택' }}
                  </span>
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
            <label class="form-label">금액</label>
            <input
              v-model="form.amount"
              type="number"
              class="form-input"
              placeholder="금액 입력"
            />
          </div>

          <div class="form-group">
            <label class="form-label">메모</label>
            <textarea
              v-model="form.memo"
              class="form-textarea"
              placeholder="간단한 메모 (선택)"
            ></textarea>
          </div>

          <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
        </div>

        <div class="modal-footer">
          <button
            class="btn-submit"
            :disabled="isSubmitting"
            @click="handleSubmit"
          >
            {{ isSubmitting ? '저장 중...' : item ? '수정 완료' : '템플릿 저장하기' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  padding: 20px;
}

.modal-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 28px;
  padding: 28px;
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

.close-x {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.form-group {
  margin-bottom: 18px;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  color: #666;
  margin-bottom: 8px;
}

.type-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #f0f0f0;
  padding: 4px;
  border-radius: 12px;
}

.type-tab {
  border: none;
  background: transparent;
  height: 40px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  color: #888;
  transition: 0.2s;
}

.type-tab.active {
  background: var(--color-primary);
  color: white;
}

.type-tab.expense.active {
  background: var(--color-sub-100);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1.5px solid #eee;
  background: #fcfcfc;
  outline: none;
  box-sizing: border-box;
  font-size: 1rem;
}

.form-textarea {
  height: 80px;
  resize: none;
}

.custom-category-select {
  position: relative;
}

.category-selected {
  width: 100%;
  height: 48px;
  border: 1.5px solid #eee;
  border-radius: 12px;
  background: #fcfcfc;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.category-selected-left {
  display: flex;
  align-items: center;
  gap: 8px;
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
}

.category-option {
  width: 100%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
}

.category-option:hover {
  background: #f5f5f5;
}

.btn-submit {
  width: 100%;
  height: 54px;
  border-radius: 16px;
  border: none;
  background: var(--color-primary);
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 10px;
}

.btn-submit:disabled {
  opacity: 0.6;
}

.error-msg {
  color: #d13d3d;
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .modal-card {
    max-width: 100%;
    padding: 24px 18px;
    border-radius: 24px;
  }
}
</style>
