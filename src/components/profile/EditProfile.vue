<template>
  <div class="profile">
    <h1 class="profile-header">프로필 수정</h1>
    <div v-if="!store.user">로딩중...</div>
    <div v-else class="profile-container">
      <div class="user-img">
        <img src="../../assets/icons/profile.svg" alt="프로필 아이콘" />
      </div>
      <table>
        <tr>
          <td>닉네임</td>
          <td>
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
          </td>
        </tr>
        <tr>
          <td>이메일</td>
          <td>
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
          </td>
        </tr>
        <tr>
          <td>연령대</td>
          <td>
            <select v-model="editForm.age">
              <option :value="null" disabled>연령대를 선택하세요</option>
              <option v-for="age in ageOptions" :key="age" :value="age">
                {{ age }}{{ age === 80 ? '대 이상' : '대' }}
              </option>
            </select>
          </td>
        </tr>
        <tr>
          <td>성별</td>
          <td class="radio-group">
            <label
              ><input type="radio" v-model="editForm.gender" value="male" />
              남성</label
            >
            <label
              ><input type="radio" v-model="editForm.gender" value="female" />
              여성</label
            >
            <label
              ><input type="radio" v-model="editForm.gender" value="other" />
              기타</label
            >
          </td>
        </tr>
      </table>

      <div class="edit-button">
        <button type="button" @click="goToProfile">취소</button>
        <button type="submit" :disabled="!isFormValid" @click="handleSave">
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
const userId = localStorage.getItem('userId');

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
  margin: 2rem;
  gap: 0.5rem;
  width: 100%;
  max-width: 60rem;
}

.profile-header {
  padding: 0.5rem;
  font-weight: 500;
}

.profile-container {
  position: relative;
  background-color: var(--color-deepgray-10);
  border: 1px solid var(--color-deepgray-20);
  border-radius: 0.5rem;
  padding: clamp(1.5rem, 4vw, 2.5rem) clamp(1.5rem, 5vw, 4rem);
  width: 100%;
  min-height: clamp(18rem, 40vw, 33rem);
  box-sizing: border-box;
}

input[type='text'],
input[type='email'],
select {
  width: clamp(8rem, 20vw, 15rem);
  padding: 0.6rem;
  border: 1px solid var(--color-deepgray-20);
  border-radius: 0.4rem;
  font-size: clamp(0.85rem, 1.5vw, 1rem);
  box-sizing: border-box;
}

select {
  cursor: pointer;
  background-color: white;
}

.radio-group {
  display: flex;
  gap: clamp(0.8rem, 2vw, 1.5rem);
  font-size: clamp(0.85rem, 1.5vw, 1rem);
  height: 100%;
  padding: clamp(0.5rem, 1vw, 1rem);
  flex-wrap: wrap;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
}

.radio-group input[type='radio'] {
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
}

.edit-button {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  display: flex;
  gap: 0.7rem;
}

.edit-button button {
  font-size: clamp(0.9rem, 1.5vw, 1.2rem);
  padding: 0.5rem clamp(0.8rem, 2vw, 1.3rem);
  border: none;
  border-radius: 1.7rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.edit-button button:disabled {
  background-color: #ccc !important;
  cursor: not-allowed;
}

.edit-button button:nth-child(1) {
  background-color: var(--color-deepgray-30);
}
.edit-button button:nth-child(2) {
  background-color: var(--color-primary-80);
  color: white;
}

.edit-button button:nth-child(1):hover {
  background-color: var(--color-deepgray-40);
}
.edit-button button:nth-child(2):hover:not(:disabled) {
  background-color: var(--color-primary);
}

.user-img img {
  width: clamp(6rem, 12vw, 10rem);
  height: clamp(6rem, 12vw, 10rem);
  margin-bottom: clamp(1rem, 2vw, 1.5rem);
}

table {
  font-size: clamp(1rem, 2vw, 1.5rem);
  width: 100%;
}

table td {
  padding: clamp(0.3rem, 0.5vw, 0.5rem) 0.5rem;
}

tr td:nth-child(2) {
  padding-left: clamp(1.5rem, 4vw, 5rem);
}

.error-msg {
  display: block;
  color: #ff4d4f;
  font-size: 0.8rem;
  margin-top: 0.2rem;
}

@media (max-width: 900px) {
  .edit-button {
    position: static;
    margin-top: 1rem;
    justify-content: flex-end;
  }

  .profile-container {
    display: flex;
    flex-direction: column;
  }
}
</style>
