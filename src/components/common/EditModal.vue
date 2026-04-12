<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  item: { type: Object, default: () => ({}) },
  categories: { type: Array, default: () => [] },
});

const emit = defineEmits(['save', 'close']);

const form = reactive({
  type: 'expense',
  detail: '',
  amount: 0,
  cid: '',
  date: '',
  memo: '',
});

// 모달이 열릴 때 선택한 아이템 데이터로 초기화
watch(
  () => props.visible,
  (newVal) => {
    if (newVal && props.item) {
      form.type = props.item.type || 'expense';
      form.detail = props.item.detail || '';
      form.amount = props.item.amount || 0;
      form.cid = props.item.cid || '';
      form.date = props.item.date || '';
      form.memo = props.item.memo || '';
    }
  },
);

const handleSave = () => {
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
        <h3>거래 내역 수정</h3>
        <button class="close-x" @click="emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <div class="type-toggle">
          <button
            :class="{ active: form.type === 'income' }"
            @click="form.type = 'income'"
          >
            수입
          </button>
          <button
            :class="{ active: form.type === 'expense' }"
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
          />
        </div>

        <div class="row">
          <div class="input-group">
            <label>금액</label>
            <input v-model="form.amount" type="number" />
          </div>
          <div class="input-group">
            <label>날짜</label>
            <input v-model="form.date" type="date" />
          </div>
        </div>

        <div class="input-group">
          <label>카테고리</label>
          <select v-model="form.cid">
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
          ></textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-save" @click="handleSave">저장하기</button>
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
</style>
