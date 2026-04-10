<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: '*',
  },
  title: {
    type: String,
    default: '가계부 작성 완료!',
  },
  description: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['close']);

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <div v-if="visible" class="success-modal-backdrop" @click="handleClose">
    <div class="success-modal" @click.stop>
      <div class="success-modal-icon">{{ icon }}</div>
      <h3 class="success-modal-title">{{ title }}</h3>
      <p class="success-modal-description">{{ description }}</p>
      <button type="button" class="success-modal-button" @click="handleClose">
        확인
      </button>
    </div>
  </div>
</template>

<style scoped>
.success-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: rgba(44, 51, 51, 0.18);
}

.success-modal {
  width: min(100%, 320px);
  padding: 28px 24px 22px;
  border-radius: 28px;
  background-color: var(--color-white);
  box-shadow: 0 20px 40px rgba(44, 51, 51, 0.14);
  text-align: center;
}

.success-modal-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary-10);
  font-size: 1.8rem;
}

.success-modal-title {
  margin: 0 0 10px;
  color: var(--color-deepgray-100);
  font-size: 1.5rem;
  font-weight: 700;
}

.success-modal-description {
  margin: 0;
  color: var(--color-deepgray-80);
  font-size: 1rem;
  line-height: 1.6;
}

.success-modal-button {
  width: 100%;
  height: 48px;
  margin-top: 22px;
  border: none;
  border-radius: 14px;
  background-color: var(--color-primary);
  color: var(--color-deepgray-100);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
}
</style>
