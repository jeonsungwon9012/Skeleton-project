<template>
  <div class="profile">
    <h1 class="profile-header">프로필</h1>

    <div v-if="!user">로딩중...</div>

    <div v-else class="profile-container">
      <div class="user-img">
        <img :src="profileIcon" alt="프로필 아이콘" />
      </div>

      <table class="profile-table">
        <tr v-for="item in userInfo" :key="item.label">
          <td class="label">{{ item.label }}</td>
          <td class="value">{{ item.value }}</td>
        </tr>
      </table>

      <div class="setting-button" @click="goToEdit">
        <img :src="settingIcon" alt="설정 아이콘" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

import profileIcon from '@/assets/icons/profile.svg';
import settingIcon from '@/assets/icons/setting.svg';

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
    { label: '연령대', value: `${user.value.age}대` },
    { label: '성별', value: user.value.gender },
  ];
});

const fetchUser = () => {
  const userId = localStorage.getItem('userId');
  if (userId) store.fetchUser(userId);
};

onMounted(fetchUser);
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

/* 컨테이너 */
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

/* 설정 버튼 */
.setting-button {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  width: clamp(2rem, 4vw, 3rem);
  height: clamp(2rem, 4vw, 3rem);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.setting-button:hover {
  transform: rotate(90deg);
}

.setting-button img {
  width: 100%;
  height: 100%;
}

/* 이미지 */
.user-img img {
  width: clamp(6rem, 12vw, 10rem);
  height: clamp(6rem, 12vw, 10rem);
  margin-bottom: clamp(1rem, 2vw, 1.5rem);
}

/* 테이블 */
.profile-table {
  font-size: clamp(1rem, 2vw, 1.5rem);
  width: 100%;
}

.profile-table td {
  padding: clamp(0.3rem, 0.5vw, 0.5rem) 0.5rem;
}

.label {
  font-weight: 600;
  white-space: nowrap;
}

.value {
  padding-left: clamp(1.5rem, 4vw, 5rem);
  word-break: break-all;
}
</style>
