<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const userStore = useUserStore();

const form = ref({
  email: '',
});

/**
 * 로그인 처리
 */
const handleLogin = async () => {
  if (!form.value.email) {
    alert('이메일을 입력해주세요.');
    return;
  }

  try {
    const success = await userStore.login(form.value.email);
    if (success) {
      router.push('/dashboard');
    } else {
      alert('없는 email입니다 확인해주세요');
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error(
        'API 경로를 찾을 수 없습니다(404). db.json의 키(USER)를 확인하세요.',
      );
      alert('서버 설정 오류가 발생했습니다(404).');
    } else {
      console.error('네트워크 에러 또는 서버 응답 없음:', error);
      alert(
        '서버와 통신 중 에러가 발생했습니다. 서버 실행 상태를 확인해주세요.',
      );
    }
  }
};

/**
 * 회원가입 페이지로 이동
 */
const goToSignup = () => {
  router.push('/signup');
};
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="title">로그인</h1>
      <p class="subtitle">다시 만나서 반가워요!</p>

      <form @submit.prevent="handleLogin" class="form">
        <div class="form-item">
          <label>이메일</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="email@example.com"
            required
          />
        </div>

        <div class="button-group">
          <button type="submit" class="btn-login">로그인</button>
          <button type="button" class="btn-signup" @click="goToSignup">
            회원가입
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-background, #f7f8fa);
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--color-white);
  padding: 40px;
  border-radius: 24px;
  box-shadow: var(--drop--shadow, 0 10px 30px rgba(0, 0, 0, 0.05));
  text-align: center;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 8px;
}

.subtitle {
  color: var(--color-deepgray-40);
  font-size: 15px;
  margin-bottom: 32px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 24px;
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

.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.btn-login {
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

.btn-signup {
  padding: 16px;
  background-color: white;
  color: var(--color-primary);
  border: 1.5px solid var(--color-primary);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-signup:hover {
  background-color: var(--color-primary-10, #f0fdf4);
}

.btn-login:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
}
</style>
