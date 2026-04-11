<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const userStore = useUserStore();

// 회원가입 폼 상태 관리
const form = ref({
  nickname: '',
  email: '',
  age: null,
  gender: '', // 'male' 또는 'female'
});

/**
 * 가입 버튼 클릭 핸들러
 */
const handleSignup = async () => {
  if (
    !form.value.nickname ||
    !form.value.email ||
    !form.value.age ||
    !form.value.gender
  ) {
    alert('모든 항목을 입력해주세요.');
    return;
  }

  // 가입 로직 (실제 API 연동 시 userStore에서 처리)
  console.log('Signup Data:', form.value);

  // 성공 시 로그인 처리 후 캘린더 화면으로 이동
  await userStore.login(form.value.email);
  router.push('/dashboard');
};

const goBack = () => {
  router.push('/login');
};
</script>

<template>
  <div class="signup-container">
    <div class="signup-card">
      <div class="header">
        <button class="back-btn" @click="goBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <h1 class="title">회원가입</h1>
      </div>

      <p class="subtitle">TTokTTak에 오신 것을 환영합니다!</p>

      <form @submit.prevent="handleSignup" class="form">
        <!-- 별명 입력 -->
        <div class="form-item">
          <label>별명</label>
          <input
            v-model="form.nickname"
            type="text"
            placeholder="별명을 입력해주세요"
            required
          />
        </div>

        <!-- 이메일 입력 -->
        <div class="form-item">
          <label>이메일</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="email@example.com"
            required
          />
        </div>

        <div class="form-row">
          <!-- 나이 입력 -->
          <div class="form-item age-item">
            <label>나이</label>
            <input
              v-model.number="form.age"
              type="number"
              placeholder="나이"
              required
              min="1"
            />
          </div>

          <!-- 성별 선택 -->
          <div class="form-item gender-item">
            <label>성별</label>
            <div class="gender-group">
              <label :class="{ active: form.gender === 'male' }">
                <input type="radio" v-model="form.gender" value="male" /> 남
              </label>
              <label :class="{ active: form.gender === 'female' }">
                <input type="radio" v-model="form.gender" value="female" /> 여
              </label>
            </div>
          </div>
        </div>

        <button type="submit" class="submit-btn">가입 완료</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.signup-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-background, #f7f8fa);
}

.signup-card {
  width: 100%;
  max-width: 420px;
  background: var(--color-white);
  padding: 40px;
  border-radius: 24px;
  box-shadow: var(--drop--shadow, 0 10px 30px rgba(0, 0, 0, 0.05));
  text-align: center;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-deepgray-100, #666);
  padding: 0;
  display: flex;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
}

.subtitle {
  color: var(--color-deepgray-40);
  font-size: 14px;
  margin-bottom: 32px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.form-item label {
  font-size: 14px;
  font-weight: 600;
  color: #444;
}

.form-item input {
  padding: 14px;
  border: 1.5px solid #eee;
  border-radius: 12px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.form-item input:focus {
  border-color: var(--color-primary);
}

.form-row {
  display: flex;
  gap: 16px;
}

.age-item {
  flex: 1;
}
.gender-item {
  flex: 1.5;
}

.gender-group {
  display: flex;
  gap: 8px;
}

.gender-group label {
  flex: 1;
  padding: 12px;
  border: 1.5px solid #eee;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: #888;
  transition: all 0.2s;
}

.gender-group input {
  display: none;
}

.gender-group label.active {
  background-color: var(--color-primary-10, #e8f5e9);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.submit-btn {
  margin-top: 12px;
  padding: 16px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
}
</style>
