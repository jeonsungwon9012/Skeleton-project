<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const startApp = () => {
  // 실제 서비스라면 여기서 로그인 처리를 하겠지만,
  // 지금은 바로 대시보드로 이동하는 기능을 연결합니다.
  // 🚩 주의: router/index.js에서 isLoggedIn을 true로 바꿔야 통과됩니다!
  router.push('/');
};
</script>

<template>
  <div class="onboarding-container">
    <div class="content-box">
      <h1 class="h1 color-primary">TTokTTak</h1>
      <p class="body-m color-gray">똑똑하게 관리하는 나만의 가계부</p>

      <div class="visual-placeholder">
        ✨
      </div>

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