<template>
  <div class="sidebar">
    <!-- 로고 -->
    <div class="sidebar-logo">
      <img :src="logo" alt="똑딱 로고" />
    </div>

    <!-- 유저 -->
    <div class="user-profile">
      <img :src="profileIcon" alt="프로필 아이콘" />
      <div class="user-info">
        <p class="user-sub">{{ userName }}님의 가계부</p>
      </div>
    </div>

    <!-- 뱃지 -->
    <div class="user-badge">
      <p>획득한 뱃지</p>
      <div class="badge-grid">
        <div v-for="row in 2" :key="row" class="grid-row">
          <img
            v-for="i in 3"
            :key="i"
            :src="placeholder"
            alt="뱃지"
          />
        </div>
      </div>
    </div>

    <div class="sidebar-nav">
      <div
        v-for="item in navItems"
        :key="item.name"
        class="nav-item"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        {{ item.name }}
      </div>
    </div>

    <div class="add-budget">
      <img :src="coinIcon" alt="동전 아이콘" />
      가계부 쓰기
    </div>
  </div>
</template>

<script setup>
import logo from '@/assets/icons/TT_logo-signiture.svg';
import profileIcon from '@/assets/icons/profile.svg';
import placeholder from '@/assets/icons/placeholder.svg';
import coinIcon from '@/assets/icons/TT_money.svg';

const userName = '김똑딱';

const navItems = [
  { name: '대시보드', icon: '📊' },
  { name: '거래내역', icon: '📝' },
  { name: '캘린더', icon: '📅' },
  { name: '프로필', icon: '👤' },
];
</script>

<style scoped>
.sidebar {
  width: 240px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: var(--color-white);
}

/* 로고 */
.sidebar-logo img {
  width: 6rem;
}

/* 유저 */
.user-profile {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  font-weight: 700;
}

.user-profile img {
  width: 1.875rem;
}

/* 뱃지 */
.user-badge {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.badge-grid {
  background-color: var(--color-gray-10);
  padding: 1.125rem;
  border-radius: 0.375rem;
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
  width: fit-content;
}

.grid-row {
  display: flex;
  gap: 1rem;
}

/* 네비 */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--color-deepgray-80);
}

/* 버튼 */
.add-budget {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  width: 150px;
  border-radius: 12px;
  background-color: var(--color-primary);
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--drop--shadow);
}
</style>