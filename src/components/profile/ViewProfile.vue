<template>
  <div class="profile">
    <h1 class="profile-header">내 프로필</h1>

    <div v-if="!user" class="loading">정보를 불러오는 중입니다...</div>

    <div v-else class="profile-container">
      <!-- 프로필 이미지 -->
      <div class="user-img">
        <img :src="profileIcon" alt="프로필 아이콘" />
      </div>

      <!-- 정보 리스트 -->
      <div class="info-list">
        <div
          v-for="item in userInfo"
          :key="item.label"
          :class="['info-item', item.class]"
        >
          <label>{{ item.label }}</label>
          <div class="info-value">{{ item.value }}</div>
        </div>
      </div>

      <!-- 성별/연령대 행 (가로 배치) -->
      <div class="info-row">
        <div class="info-item">
          <label>연령대</label>
          <div class="info-value">
            {{ user.age }}{{ user.age === 80 ? '대 이상' : '대' }}
          </div>
        </div>
        <div class="info-item">
          <label>성별</label>
          <div class="info-value">
            {{
              user.gender === 'male'
                ? '남'
                : user.gender === 'female'
                  ? '여'
                  : '기타'
            }}
          </div>
        </div>
      </div>

      <!-- 하단 수정 버튼 -->
      <div class="action-button">
        <button type="button" class="btn-edit" @click="goToEdit">
          프로필 수정하기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';

import profileIcon from '@/assets/icons/profile.svg';

const router = useRouter();
const store = useUserStore();

const goToEdit = () => {
  router.push('/profile/edit');
};

const user = computed(() => store.user);

const userInfo = computed(() => {
  if (!user.value) return [];
  return [
    { label: '닉네임', value: user.value.nickname },
    { label: '이메일', value: user.value.email },
  ];
});

onMounted(() => {
  const userId = store.user?.id || localStorage.getItem('userId');
  if (userId && !store.user) {
    store.fetchUser(userId);
  }
});
</script>

<style scoped>
.profile {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 420px;
  gap: 8px;
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

.info-value {
  padding: 14px;
  border: 1.5px solid #f1f1f1;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  background-color: #fcfcfc;
  box-sizing: border-box;
}

.info-row {
  width: 100%;
  display: flex;
  gap: 16px;
}

.action-button {
  width: 100%;
  margin-top: 32px;
}

.btn-edit {
  width: 100%;
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

.btn-edit:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
}

.loading {
  text-align: center;
  padding: 40px;
  color: #888;
}
</style>
