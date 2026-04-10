<template>
  <div class="sidebar">
    <div class="sidebar-logo">
      <img :src="logo" alt="톨크탁 로고" />
    </div>

    <div class="user-profile">
      <img :src="profileIcon" alt="프로필 아이콘" />
      <div class="user-info">
        <p class="user-sub">{{ userName }}의 가계부</p>
      </div>
    </div>

    <div class="user-badge">
      <p>이번 달 배지</p>
      <div class="badge-grid">
        <div v-for="row in 2" :key="row" class="grid-row">
          <div
            v-for="i in 3"
            :key="i"
            class="badge-item"
            :title="getBadgeTitle(row, i)"
          >
            <span v-if="getBadgeEmoji(row, i)" class="badge-emoji">
              {{ getBadgeEmoji(row, i) }}
            </span>
            <img v-else :src="placeholder" alt="배지 자리" />
          </div>
        </div>
      </div>
    </div>

    <div class="sidebar-nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        class="nav-item"
        active-class="is-active"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        {{ item.name }}
      </RouterLink>
    </div>

    <div class="budget-container">
      <div v-if="showMenu" class="menu-stack">
        <div class="template-wrapper">
          <button class="btn template" @click="showTemplates = !showTemplates">
            <span>자동완성 템플릿</span>
            <span class="arrow">{{ showTemplates ? '▲' : '▼' }}</span>
          </button>

          <div v-if="showTemplates" class="template-popup">
            <template v-if="templateStore.templates.length > 0">
              <div
                v-for="tmpl in templateStore.templates"
                :key="tmpl.id"
                class="template-item"
              >
                <div class="tmpl-info" @click="handleApplyTemplate(tmpl)">
                  <span class="tmpl-title">{{ tmpl.detail }}</span>
                  <span class="tmpl-desc">
                    {{ tmpl.type === 'expense' ? '-' : '+' }}{{ tmpl.amount.toLocaleString() }}원
                  </span>
                </div>

                <div class="tmpl-actions">
                  <RouterLink
                    :to="{ path: '/add-transaction', query: { templateId: tmpl.id } }"
                    class="tmpl-btn"
                    @click="closeAll"
                  >
                    수정
                  </RouterLink>
                  <button type="button" class="tmpl-btn tmpl-delete-btn" @click="handleDeleteTemplate(tmpl)">
                    삭제
                  </button>
                </div>
              </div>
            </template>

            <p v-else class="template-empty">저장된 템플릿이 없습니다.</p>

            <RouterLink
              v-if="templateStore.templates.length < 3"
              to="/add-transaction"
              class="template-item add"
              @click="closeAll"
            >
              템플릿 추가하기
            </RouterLink>
          </div>
        </div>

        <RouterLink to="/add-transaction" class="btn new-write" @click="closeAll">
          <span>바로 작성</span>
          <span class="arrow">→</span>
        </RouterLink>
      </div>

      <div v-if="toast.visible" class="toast">
        <p>{{ toast.message }}</p>
        <RouterLink to="/transactions" class="toast-link" @click="closeAll">
          거래내역 리스트로 이동
        </RouterLink>
      </div>

      <div class="add-budget" :class="{ collapsed: isCollapsed, 'is-route-active': isAddTransactionRoute }" @click="handleAddBudgetClick">
        <img :src="coinIcon" alt="가계부 쓰기" />
        <span class="label">가계부 쓰기</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import logo from '@/assets/icons/TT_logo-signiture.svg';
import profileIcon from '@/assets/icons/profile.svg';
import placeholder from '@/assets/icons/placeholder.svg';
import coinIcon from '@/assets/icons/TT_money.svg';
import { useCategoryStore } from '@/stores/category';
import { useTemplateStore } from '@/stores/template';
import { useTransactionStore } from '@/stores/budgetStores';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const categoryStore = useCategoryStore();
const templateStore = useTemplateStore();
const transactionStore = useTransactionStore();
const route = useRoute();
const router = useRouter();

const uid = '1';
const isAddTransactionRoute = computed(() => route.path === '/add-transaction');
const userName = computed(() => userStore.user?.nickname || '사용자');

const navItems = [
  { name: '대시보드', icon: '◫', path: '/dashboard' },
  { name: '거래내역', icon: '≣', path: '/transactions' },
  { name: '리포트', icon: '*', path: '/gamification' },
  { name: '프로필', icon: '@', path: '/profile' },
];

const badges = computed(() => {
  const ranked = [...categoryStore.chartData].slice(0, 6);
  return Array.from({ length: 6 }, (_, index) => {
    const item = ranked[index];
    if (!item) {
      return null;
    }
    return {
      emoji: item.img,
      title: `${item.name} 지출 ${item.amount?.toLocaleString?.() || 0}원`,
    };
  });
});

const getBadgeIndex = (row, col) => (row - 1) * 3 + (col - 1);
const getBadgeEmoji = (row, col) => badges.value[getBadgeIndex(row, col)]?.emoji ?? null;
const getBadgeTitle = (row, col) => badges.value[getBadgeIndex(row, col)]?.title ?? '';

onMounted(async () => {
  if (!categoryStore.chartData.length) {
    await categoryStore.fetchAll(uid);
  }
  await userStore.fetchUser(uid);
  await templateStore.fetchTemplates(uid);
});

const isCollapsed = ref(false);
const showMenu = ref(false);
const showTemplates = ref(false);
const toast = ref({ visible: false, message: '' });
let toastTimer = null;

const toggleMain = () => {
  isCollapsed.value = !isCollapsed.value;
  showMenu.value = isCollapsed.value;
  if (!isCollapsed.value) {
    showTemplates.value = false;
  }
};

const handleAddBudgetClick = async () => {
  if (!isAddTransactionRoute.value) {
    closeAll();
    await router.push('/add-transaction');
    return;
  }

  toggleMain();
};

const closeAll = () => {
  isCollapsed.value = false;
  showMenu.value = false;
  showTemplates.value = false;
};

const showToast = (message) => {
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toast.value = { visible: true, message };
  toastTimer = setTimeout(() => {
    toast.value.visible = false;
  }, 3000);
};

const handleApplyTemplate = async (tmpl) => {
  try {
    await transactionStore.addBudget({
      uid: Number(uid),
      date: new Date().toISOString().slice(0, 10),
      type: tmpl.type,
      amount: Number(tmpl.amount),
      cid: null,
      detail: tmpl.detail,
      memo: tmpl.memo || '',
      isRecurring: false,
      cycle: null,
      isTemplate: false,
    });
    closeAll();
    showToast(`"${tmpl.detail}" 내역을 추가했습니다.`);
  } catch {
    showToast('내역 추가에 실패했습니다. 다시 시도해주세요.');
  }
};

const handleDeleteTemplate = async (tmpl) => {
  const confirmed = confirm(`"${tmpl.detail}" 템플릿을 삭제할까요?`);
  if (!confirmed) {
    return;
  }
  try {
    await templateStore.deleteTemplate(tmpl.id, uid);
    showToast('템플릿을 삭제했습니다.');
  } catch {
    showToast('템플릿 삭제에 실패했습니다.');
  }
};
</script>

<style scoped>
.sidebar {
  width: 240px;
  min-width: 240px;
  min-height: 100vh;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
  background-color: var(--color-white);
  border-right: 1px solid var(--color-deepgray-10);
}

.sidebar-logo img {
  width: 6rem;
}

.user-profile {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  font-weight: 700;
}

.user-profile img {
  width: 1.875rem;
}

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

.badge-item {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  background-color: var(--color-white);
  cursor: default;
  transition: transform 0.15s ease;
}

.badge-item:hover {
  transform: scale(1.15);
}

.badge-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.badge-emoji {
  font-size: 1.2rem;
  line-height: 1;
  animation: badgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-item {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--color-deepgray-80);
}

.nav-item.is-active {
  background-color: var(--color-gray-10);
  font-weight: 600;
}

.budget-container {
  position: relative;
  margin-top: auto;
}

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
  font-weight: 700;
}

.add-budget img {
  width: 1.2rem;
  height: 1.2rem;
}

.add-budget .label {
  white-space: nowrap;
  transition: opacity 0.2s;
}

.add-budget.collapsed {
  width: 48px;
  background-color: var(--color-deepgray-20);
}

.add-budget.collapsed .label {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.add-budget.is-route-active {
  box-shadow: 0 0 0 3px rgba(103, 234, 118, 0.28);
}

.menu-stack {
  position: absolute;
  bottom: 60px;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: slideUp 0.25s ease;
  z-index: 999;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 20px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  font-size: 1rem;
}

.template {
  width: 180px;
  background-color: #63f57c;
  color: #1a1a1a;
}

.new-write {
  width: 130px;
  background: white;
  border: 1px solid #eee;
  color: #1a1a1a;
}

.arrow {
  margin-left: auto;
}

.template-wrapper {
  position: relative;
}

.template-popup {
  position: absolute;
  left: 190px;
  top: 0;
  display: flex;
  flex-direction: column;
  background: white;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  min-width: 220px;
  animation: fadeIn 0.2s ease;
  z-index: 1000;
  overflow: visible;
}

.template-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  border-radius: 8px;
  gap: 6px;
  transition: background 0.15s;
}

.template-item:hover {
  background-color: var(--color-gray-10, #f5f5f5);
}

.tmpl-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  cursor: pointer;
}

.tmpl-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #222;
}

.tmpl-desc {
  font-size: 0.75rem;
  color: #888;
}

.tmpl-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.tmpl-btn {
  font-size: 0.7rem;
  padding: 5px 8px;
  border-radius: 6px;
  border: 1px solid var(--color-deepgray-20);
  background-color: var(--color-white);
  cursor: pointer;
  text-decoration: none;
  color: var(--color-deepgray-100);
  font-weight: 500;
}

.tmpl-delete-btn {
  color: #c53d3d;
}

.template-item.add {
  justify-content: flex-start;
  color: #666;
  font-size: 0.85rem;
  border-top: 1px solid #f0f0f0;
  margin-top: 4px;
  padding-top: 10px;
  text-decoration: none;
  cursor: pointer;
}

.template-empty {
  margin: 0;
  padding: 8px;
  font-size: 0.85rem;
  color: var(--color-deepgray-60);
}

.toast {
  position: absolute;
  bottom: 70px;
  left: 0;
  background: #222;
  color: white;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 0.82rem;
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: fadeIn 0.2s ease;
  z-index: 100;
}

.toast p {
  margin: 0;
}

.toast-link {
  color: #7dd3fc;
  text-decoration: none;
  font-size: 0.78rem;
}

.toast-link:hover {
  text-decoration: underline;
}

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

@keyframes badgePop {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 900px) {
  .sidebar {
    width: 100%;
    min-width: 0;
    min-height: auto;
    border-right: none;
    border-bottom: 1px solid var(--color-deepgray-10);
  }

  .template-popup {
    left: 0;
    top: auto;
    bottom: 52px;
  }
}
</style>
