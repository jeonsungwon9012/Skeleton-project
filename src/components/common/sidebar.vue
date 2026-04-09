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
          <img v-for="i in 3" :key="i" :src="placeholder" alt="뱃지" />
        </div>
      </div>
    </div>

    <div class="sidebar-nav">
      <div v-for="item in navItems" :key="item.name" class="nav-item">
        <span class="nav-icon">{{ item.icon }}</span>
        {{ item.name }}
      </div>
    </div>

    <div class="budget-container">
      <!-- 위에 뜨는 메뉴 -->
      <div v-if="showMenu" class="menu-stack">
        <div class="template-wrapper">
          <!-- 버튼 2개 -->
          <button class="btn template" @click="showTemplates = !showTemplates">
            <span>자동완성 템플릿</span>
            <span class="arrow">></span>
          </button>

          <!-- 템플릿 리스트 -->
          <div v-if="showTemplates" class="template-popup">
            <button class="template-item">템플릿 추가하기</button>
            <button class="template-item">템플릿 추가하기</button>
            <button class="template-item">템플릿 추가하기</button>
          </div>
        </div>

        <button class="btn new-write">
          <span>새로 작성</span>
          <span class="arrow">></span>
        </button>
      </div>

      <!-- 메인 버튼 -->
      <div
        class="add-budget"
        :class="{ collapsed: isCollapsed }"
        @click="toggleMain"
      >
        <img :src="coinIcon" />
        <span class="label">가계부 쓰기</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import logo from '@/assets/icons/TT_logo-signiture.svg';
import profileIcon from '@/assets/icons/profile.svg';
import placeholder from '@/assets/icons/placeholder.svg';
import coinIcon from '@/assets/icons/TT_money.svg';
import { ref } from 'vue';

const userName = '김똑딱';

const navItems = [
  { name: '대시보드', icon: '📊' },
  { name: '거래내역', icon: '📝' },
  { name: '캘린더', icon: '📅' },
  { name: '프로필', icon: '👤' },
];

const isCollapsed = ref(false); // 버튼 접힘
const showMenu = ref(false); // 위 버튼 표시
const showTemplates = ref(false); // 템플릿 하위 메뉴

const toggleMain = () => {
  isCollapsed.value = !isCollapsed.value;
  showMenu.value = isCollapsed.value;

  // 접히면 하위 메뉴 초기화
  if (!isCollapsed.value) {
    showTemplates.value = false;
  }
};
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

.budget-container {
  position: relative;
  margin-top: auto;
}

/* 메인 버튼 */
.add-budget {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 20px;
  width: 150px;
  padding: 12px;
  background-color: var(--color-primary);
  cursor: pointer;

  transition: all 0.3s ease;
}

.add-budget .label {
  white-space: nowrap;
  transition: opacity 0.2s;
}

/* 접힘 상태 */
.add-budget.collapsed {
  width: 48px;
  background-color: var(--color-deepgray-20);
}

.add-budget.collapsed .label {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

/* 위에 쌓이는 메뉴 */
.menu-stack {
  position: absolute;
  bottom: 60px;
  left: 0;

  display: flex;
  flex-direction: column;
  gap: 8px;

  animation: slideUp 0.25s ease;
}

/* 버튼 공통 */
.btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 20px;
  border: none;
  font-weight: 700;
  cursor: pointer;
}

/* 자동완성 버튼 */
.template {
  width: 180px;
  background-color: #63f57c;
}

/* 새로 작성 */
.new-write {
  width: 130px;
  background: white;
  border: 1px solid #eee;
}

/* 화살표 */
.arrow {
  margin-left: auto;
}

/* wrapper 기준 */
.template-wrapper {
  position: relative;
}

/* 템플릿 팝업 */
.template-popup {
  position: absolute;
  left: 190px;
  top: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  background: white;
  padding: 10px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  width: 100%;

  animation: fadeIn 0.2s ease;
}

/* 템플릿 버튼 */
.template-item {
  padding: 8px 12px;
  border: none;
  background-color: var(--color-white);
  cursor: pointer;
  text-align: left;
  color: var(--color-deepgray-40);
}

hr {
  background-color: var(--color-deepgray-10);
}

/* 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(5px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
