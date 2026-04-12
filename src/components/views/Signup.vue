<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import SuccessModal from '@/components/common/CompleteModal.vue';

const router = useRouter();
const userStore = useUserStore();

// 회원가입 폼 상태 관리
const form = ref({
  nickname: '',
  email: '',
  age: null,
  gender: '', // 'male' 또는 'female'
});

const modal = reactive({
  visible: false,
  icon: '🎉',
  title: '가입을 축하합니다!',
  description: '',
});

const ageOptions = [10, 20, 30, 40, 50, 60, 70, 80];

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
    modal.icon = '⚠️';
    modal.title = '입력 확인';
    modal.description = '모든 항목을 입력해주세요.';
    modal.visible = true;
    return;
  }

  try {
    // 1. 이메일 중복 체크 (DB 조회를 통해 이미 가입된 이메일인지 확인)
    const isDuplicate = await userStore.isEmailDuplicate(form.value.email);
    if (isDuplicate) {
      modal.icon = '📧';
      modal.title = '중복된 이메일';
      modal.description =
        '이미 가입된 이메일입니다.\n다른 이메일을 사용해주세요.';
      modal.visible = true;
      return;
    }

    // 2. 회원가입 실행 (axios.post를 통해 db.json의 USER 테이블에 실제 저장)
    // signup 액션 내부에서 유저 정보를 저장하고 user 상태를 업데이트합니다.
    await userStore.signup(form.value);

    // 3. 성공 모달 표시
    modal.icon = '🎉';
    modal.title = '가입 완료!';
    modal.description = '똑딱 가계부에 오신 것을 환영합니다!';
    modal.visible = true;
  } catch (error) {
    console.error('Signup Failure:', error);
    modal.icon = '❌';
    modal.title = '가입 오류';
    modal.description =
      '회원가입 중 문제가 발생했습니다.\n서버 상태를 확인해주세요.';
    modal.visible = true;
  }
};

const handleModalClose = () => {
  modal.visible = false;
  if (modal.icon === '🎉') {
    router.push('/dashboard');
  }
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
            <select v-model="form.age" class="form-select" required>
              <option :value="null" disabled>선택</option>
              <option v-for="age in ageOptions" :key="age" :value="age">
                {{ age }}{{ age === 80 ? '대 이상' : '대' }}
              </option>
            </select>
          </div>

          <!-- 성별 선택 -->
          <div class="form-item gender-item">
            <label>성별</label>
            <select v-model="form.gender" class="form-select" required>
              <option value="" disabled>선택</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
              <option value="other">기타</option>
            </select>
          </div>
        </div>

        <button type="submit" class="submit-btn">가입 완료</button>
      </form>
    </div>

    <!-- 가입 완료 모달 -->
    <SuccessModal
      :visible="modal.visible"
      :icon="modal.icon"
      :title="modal.title"
      :description="modal.description"
      @close="handleModalClose"
    />
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
  color: #888;
}

.form-item input,
.form-item .form-select {
  width: 100%;
  padding: 14px;
  border: 1.5px solid #f1f1f1;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  outline: none;
  transition: border-color 0.2s;
  background-color: #fcfcfc;
  box-sizing: border-box;
}

.form-item input:focus,
.form-item .form-select:focus {
  border-color: var(--color-primary);
  background-color: #fff;
}

.form-row {
  width: 100%;
  display: flex;
  gap: 16px;
}

.age-item {
  flex: 1;
}
.gender-item {
  flex: 1;
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
