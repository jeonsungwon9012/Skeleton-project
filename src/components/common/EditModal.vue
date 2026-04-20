<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  item: { type: Object, default: () => ({}) },
  categories: { type: Array, default: () => [] },
  title: { type: String, default: '거래 내역 수정' }, // 💡 제목 Prop 추가
  readOnly: { type: Boolean, default: false }, // 💡 읽기 전용 모드 추가
});

const emit = defineEmits(['save', 'close']);

const form = reactive({
  id: null, // 💡 id 필드 추가
  type: 'expense',
  detail: '',
  amount: 0,
  cid: '',
  date: '',
  memo: '',
});

// 모달이 열릴 때 선택한 아이템 데이터로 초기화
watch(
  [() => props.visible, () => props.item],
  ([newVisible, newItem]) => {
    if (newVisible && newItem) {
      form.id = newItem.id || null;
      form.type = props.item.type || 'expense';
      form.detail = props.item.detail || '';
      form.amount = props.item.amount || 0;
      form.cid = props.item.cid || '';
      form.date = props.item.date || '';
      form.memo = props.item.memo || '';
    }
  },
  { immediate: true },
);

const handleSave = () => {
  if (props.readOnly) {
    emit('close');
    return;
  }

  if (!form.detail || !form.amount || !form.cid || !form.date) {
    alert('모든 필수 항목을 입력해주세요.');
    return;
  }
  emit('save', { ...form, amount: Number(form.amount), cid: Number(form.cid) });
};
</script>

<template>
  <div v-if="visible" class="modal-backdrop" @click="emit('close')">
    <div class="modal-card" @click.stop>
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-x" @click="emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <div class="type-toggle">
          <button
            :class="{ active: form.type === 'income' }"
            :disabled="readOnly"
            @click="form.type = 'income'"
          >
            수입
          </button>
          <button
            :class="{ active: form.type === 'expense' }"
            :disabled="readOnly"
            @click="form.type = 'expense'"
          >
            지출
          </button>
        </div>

        <div class="input-group">
          <label>내역명</label>
          <input
            v-model="form.detail"
            type="text"
            placeholder="내역을 입력하세요"
            :disabled="readOnly"
          />
        </div>

        <div class="row">
          <div class="input-group">
            <label>금액</label>
            <input v-model="form.amount" type="number" :disabled="readOnly" />
          </div>
          <div class="input-group">
            <label>날짜</label>
            <input v-model="form.date" type="date" :disabled="readOnly" />
          </div>
        </div>

        <div class="input-group">
          <label>카테고리</label>
          <select v-model="form.cid" :disabled="readOnly">
            <option value="" disabled>선택하세요</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.img }} {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="input-group">
          <label>메모</label>
          <textarea
            v-model="form.memo"
            placeholder="메모를 입력하세요"
            :disabled="readOnly"
          ></textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-save" @click="handleSave">
          {{ readOnly ? '확인' : '저장하기' }}
        </button>
      </div>
    </div>
  </div>
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
  width: min(90%, 400px);
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

.type-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.type-toggle button {
  flex: 1;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #eee;
  background: #f9f9f9;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}
.type-toggle button.active {
  background: var(--color-primary);
  color: var(--color-deepgray-100);
  border-color: var(--color-primary);
}

.input-group {
  margin-bottom: 14px;
  text-align: left;
}
.input-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: #666;
  margin-bottom: 4px;
}
.input-group input,
.input-group select,
.input-group textarea {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #eee;
  background: #fcfcfc;
  font-size: 0.95rem;
  outline: none;
  box-sizing: border-box;
}
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
textarea {
  height: 60px;
  resize: none;
}

.btn-save {
  width: 100%;
  height: 50px;
  border-radius: 14px;
  border: none;
  background: var(--color-primary);
  color: var(--color-deepgray-100);
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 10px;
}
.btn-save:hover {
  opacity: 0.9;
}

/* 모바일 최적화 스타일 추가 */
@media (max-width: 480px) {
  .modal-backdrop {
    align-items: flex-end; /* 모달을 하단에 배치 */
  }

  .modal-card {
    width: 100%;
    max-width: 100%;
    height: 50vh; /* 화면 높이의 정확히 절반 */
    padding: 20px 16px;
    border-radius: 24px 24px 0 0; /* 상단 모서리만 둥글게 */
    overflow-y: auto; /* 내용이 많을 경우 내부 스크롤 */
    margin-bottom: 0;
  }

  .modal-header {
    margin-bottom: 16px;
  }

  .modal-header h3 {
    font-size: 1rem;
  }

  .type-toggle {
    margin-bottom: 10px;
  }

  .type-toggle button {
    height: 32px;
    font-size: 0.85rem;
  }

  .input-group {
    margin-bottom: 8px;
  }

  .input-group label {
    font-size: 0.75rem;
  }

  .input-group input,
  .input-group select,
  .input-group textarea {
    padding: 8px;
    font-size: 0.85rem;
  }

  .btn-save {
    height: 40px;
    font-size: 0.9rem;
    margin-top: 5px;
  }
}
</style>
