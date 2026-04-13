<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  icon: { type: String, default: '?' },
  title: { type: String, default: '확인' },
  description: { type: String, default: '' },
  confirmText: { type: String, default: '확인' },
  cancelText: { type: String, default: '취소' },
});

const emit = defineEmits(['confirm', 'close']);
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-backdrop" @click="emit('close')">
      <div class="modal-card" @click.stop>
        <div class="modal-icon">{{ icon }}</div>
        <h3 class="modal-title">{{ title }}</h3>
        <p class="modal-description">{{ description }}</p>
        <div class="button-group">
          <button type="button" class="btn-cancel" @click="emit('close')">
            {{ cancelText }}
          </button>
          <button type="button" class="btn-confirm" @click="emit('confirm')">
            {{ confirmText }}
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
  padding: 24px;
  background-color: rgba(44, 51, 51, 0.3);
  backdrop-filter: blur(2px);
}

.modal-card {
  width: min(100%, 320px);
  padding: 28px 24px 22px;
  border-radius: 28px;
  background-color: var(--color-white);
  box-shadow: 0 20px 40px rgba(44, 51, 51, 0.14);
  text-align: center;
}

.modal-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff0f0;
  font-size: 1.8rem;
}

.modal-title {
  margin: 0 0 10px;
  color: var(--color-deepgray-100);
  font-size: 1.4rem;
  font-weight: 700;
}

.modal-description {
  margin: 0 0 24px;
  color: var(--color-deepgray-80);
  font-size: 1rem;
  line-height: 1.6;
}

.button-group {
  display: flex;
  gap: 12px;
}

.btn-confirm,
.btn-cancel {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-cancel {
  background-color: var(--color-gray-10);
  color: var(--color-deepgray-60);
}

.btn-confirm {
  background-color: #ff5252;
  color: white;
}
</style>
