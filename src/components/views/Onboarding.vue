<script setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();
const router = useRouter();

const startApp = async () => {
  // 실제 서비스라면 여기서 로그인 처리를 하겠지만,
  // 사용자의 요청에 따라 로그인 페이지로 먼저 이동합니다.
  router.push('/login');
};

const handleLogin = async () => {
  const success = await userStore.login('user1@example.com'); // db.json에 있는 이메일
  if (success) {
    router.push('/dashboard');
  } else {
    alert('로그인에 실패했어요!');
  }
};
</script>

<template>
  <div class="onboarding-container">
    <div class="content-box">
      <h1 class="h1 color-primary">TTokTTak</h1>
      <p class="body-m color-gray">똑똑하게 관리하는 나만의 가계부</p>

      <div class="visual-placeholder">✨</div>

      <button @click="startApp" class="btn-main">시작하기</button>
    </div>
  </div>
</template>

<style scoped>
.onboarding-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-white);
}

.content-box {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.color-primary {
  color: var(--color-primary);
}

.color-gray {
  color: var(--color-deepgray-40);
}

.visual-placeholder {
  font-size: 80px;
  margin: 40px 0;
}

.btn-main {
  width: 280px;
  padding: 16px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-main:hover {
  transform: translateY(-2px);
  background-color: var(--color-primary); /* 디자인 시스템에 맞춰 조절 */
}
</style>
