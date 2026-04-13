<template>
  <div class="profile">
    <h1 class="profile-header">프로필 수정</h1>
    <div v-if="!store.user">로딩중...</div>
    <div v-else class="profile-container">
      <div class="user-img">
        <img src="../../assets/icons/profile.svg" alt="프로필 아이콘" />
      </div>
      <div class="info-list">
        <div class="info-item">
          <label>닉네임</label>
          <input
            v-model="editForm.nickname"
            type="text"
            placeholder="2~6글자"
            minlength="2"
            maxlength="6"
            required
          />
          <span
            v-if="
              editForm.nickname.length > 0 &&
              (editForm.nickname.length < 2 || editForm.nickname.length > 6)
            "
            class="error-msg"
          >
            (!) 2~6글자 사이로 입력해주세요
          </span>
        </div>

        <div class="info-item">
          <label>이메일</label>
          <input
            v-model="editForm.email"
            type="email"
            placeholder="example@email.com"
            required
          />
          <span
            v-if="editForm.email && !validateEmail(editForm.email)"
            class="error-msg"
          >
            (!) 올바른 이메일 형식이 아닙니다.
          </span>
        </div>

        <div class="info-row">
          <div class="info-item">
            <label>연령대</label>
            <select v-model="editForm.age" class="form-select">
              <option :value="null" disabled>연령대를 선택하세요</option>
              <option v-for="age in ageOptions" :key="age" :value="age">
                {{ age }}{{ age === 80 ? '대 이상' : '대' }}
              </option>
            </select>
          </div>

          <div class="info-item">
            <label>성별</label>
            <select v-model="editForm.gender" class="form-select">
              <option value="" disabled>선택</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
              <option value="other">기타</option>
            </select>
          </div>
        </div>
      </div>

      <div class="edit-button">
        <button type="button" class="btn-cancel" @click="goToProfile">
          취소
        </button>
        <button
          type="submit"
          class="btn-save"
          :disabled="!isFormValid"
          @click="handleSave"
        >
          저장
        </button>
      </div>
    </div>

    <SuccessModal
      :visible="modal.visible"
      :icon="modal.icon"
      :title="modal.title"
      :description="modal.description"
      @close="handleModalClose"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import SuccessModal from '@/components/common/CompleteModal.vue';

const router = useRouter();
const store = useUserStore();

const editForm = ref({
  nickname: '',
  email: '',
  age: null,
  gender: '',
});

const modal = ref({ visible: false, icon: '', title: '', description: '' });

const goToProfile = () => {
  router.push('/profile'); // 다시 기본 프로필로 이동
};

watch(
  () => store.user,
  (newUser) => {
    if (newUser) {
      editForm.value = {
        ...newUser,
        age:
          typeof newUser.age === 'string' ? parseInt(newUser.age) : newUser.age,
      };
    }
  },
  { immediate: true },
);

const ageOptions = [10, 20, 30, 40, 50, 60, 70, 80];

onMounted(() => {
  const userId = store.user?.id || localStorage.getItem('userId');
  if (userId && !store.user) {
    store.fetchUser(userId);
  }
});

const validateEmail = (email) => {
  const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return EMAIL_PATTERN.test(email);
};

const isFormValid = computed(() => {
  const { nickname, email, age, gender } = editForm.value;
  return (
    nickname &&
    nickname.length >= 2 &&
    nickname.length <= 6 &&
    validateEmail(email) &&
    age !== null &&
    gender !== ''
  );
});

const handleSave = async () => {
  // 💡 스토어에 저장된 유저 ID를 최우선으로 사용
  const userId = store.user?.id || localStorage.getItem('userId');
  if (!userId) {
    modal.value = {
      visible: true,
      icon: '⚠️',
      title: '오류',
      description: '유저 ID를 찾을 수 없습니다.',
    };
    return;
  }

  try {
    await store.updateUser(userId, editForm.value);
    modal.value = {
      visible: true,
      icon: '✅',
      title: '수정 완료!',
      description: `${editForm.value.nickname}님의 정보가\n성공적으로 업데이트되었어요.`,
    };
  } catch {
    modal.value = {
      visible: true,
      icon: '❌',
      title: '수정 실패',
      description: '저장 중 오류가 발생했어요.\n잠시 후 다시 시도해주세요.',
    };
  }
};

// 모달 닫기 — 성공한 경우에만 프로필 페이지로 이동
const handleModalClose = () => {
  modal.value.visible = false;
  if (modal.value.icon === '✅') goToProfile();
};
</script>

<style scoped>
.profile {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 420px;
}

.profile-header {
  font-weight: 700;
  color: var(--color-primary);
  text-align: center;
  font-size: 24px;
  margin-bottom: 8px;
}

.profile-container {
  background-color: var(--color-white);
  padding: 40px;
  border-radius: 24px;
  box-shadow: var(--drop--shadow, 0 10px 30px rgba(0, 0, 0, 0.05));
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-img img {
  width: 100px;
  height: 100px;
  margin-bottom: 32px;
}

.info-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
  flex: 1;
}

.info-item label {
  font-size: 14px;
  font-weight: 600;
  color: #888;
}

.info-item input,
.info-item .form-select {
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

.info-item input:focus,
.info-item .form-select:focus {
  border-color: var(--color-primary);
  background-color: #fff;
}

.info-row {
  width: 100%;
  display: flex;
  gap: 16px;
}

.edit-button {
  width: 100%;
  display: flex;
  gap: 0.7rem;
  margin-top: 32px;
}

.edit-button button {
  flex: 1;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.btn-cancel {
  background-color: var(--color-deepgray-30);
  color: var(--color-deepgray-100);
}
.btn-save {
  background-color: var(--color-primary);
  color: white;
}
.btn-save:disabled {
  background-color: #ccc !important;
  cursor: not-allowed;
}

.error-msg {
  display: block;
  color: #ff4d4f;
  font-size: 0.8rem;
  margin-top: 0.2rem;
}
</style>
