<template>
  <aside class="sidebar" :class="{ 'mobile-open': isOpen, 'mobile-sidebar': isMobile }">
    <div class="sidebar-top">
      <div class="sidebar-logo">
        <img :src="logo" alt="로고" />
      </div>
      <button
        v-if="isMobile"
        class="close-button"
        type="button"
        aria-label="Close menu"
        @click="$emit('close')"
      >
        ×
      </button>
    </div>

    <div class="user-profile">
      <img :src="profileIcon" alt="프로필 아이콘" />
      <button class="logout-btn" @click="handleLogout" title="로그아웃">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
    <div class="user-info">
      <p class="user-sub">{{ userName }}님의 가계부</p>
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
            <img v-else :src="placeholder" alt="배지" />
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
        @click="handleNavClick"
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
            <span class="arrow">→</span>
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
                  <button
                    class="tmpl-btn"
                    type="button"
                    @click.stop="handleEditTemplate(tmpl)"
                  >
                    <img :src="editPencil" alt="수정" />
                  </button>
                  <img
                    class="tmpl-btn tmpl-delete-img"
                    :src="trash"
                    alt="삭제"
                    @click="handleDeleteTemplate(tmpl)"
                  />
                </div>
              </div>
            </template>

            <button
              v-if="templateStore.templates.length < 3"
              class="template-item add"
              type="button"
              @click="showAddTemplateModal = true"
            >
              템플릿 추가하기
            </button>
          </div>
        </div>

        <RouterLink
          to="/addTransaction"
          class="btn new-write"
          @click="closeAll"
        >
          <span>새로 작성</span>
          <span class="arrow">→</span>
        </RouterLink>
      </div>

      <div
        class="add-budget"
        :class="{ collapsed: isCollapsed }"
        @click="toggleMain"
      >
        <img :src="coinIcon" alt="가계부" />
        <span class="label">가계부 쓰기</span>
      </div>

      <ConfirmModal
        :visible="confirmModal.visible"
        :title="confirmModal.title"
        :description="confirmModal.description"
        :icon="confirmModal.icon"
        @confirm="confirmModal.action"
        @close="confirmModal.visible = false"
      />

      <SuccessModal
        :visible="modal.visible"
        :icon="modal.icon"
        :title="modal.title"
        :description="modal.description"
        @close="modal.visible = false"
      />

      <AddTemplateModal
        :visible="showAddTemplateModal"
        :item="selectedTemplate"
        @close="showAddTemplateModal = false"
      />
    </div>
  </aside>
</template>

<script setup>
import logo from '@/assets/icons/logo-signiture.svg';
import profileIcon from '@/assets/icons/profile.svg';
import placeholder from '@/assets/icons/badge.svg';
import coinIcon from '@/assets/icons/money.svg';
import editPencil from '@/assets/icons/edit-pencil.svg';
import trash from '@/assets/icons/trash.svg';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCategoryStore } from '@/stores/category';
import { useTransactionStore } from '@/stores/budgetStore';
import { useBudgetStore } from '@/stores/budgetStore2';
import { useTemplateStore } from '@/stores/template';
import { useUserStore } from '@/stores/user';
import { useReactionStore } from '@/stores/reaction';
import SuccessModal from '@/components/common/CompleteModal.vue';
import ConfirmModal from '@/components/common/ConfirmModal.vue';
import AddTemplateModal from '@/components/common/AddTemplateModal.vue';

defineProps({
  isMobile: { type: Boolean, default: false },
  isOpen: { type: Boolean, default: true },
});

const emit = defineEmits(['close']);

const userStore = useUserStore();
const categoryStore = useCategoryStore();
const transactionStore = useTransactionStore();
const budgetStore = useBudgetStore();
const templateStore = useTemplateStore();
const reactionStore = useReactionStore();
const router = useRouter();

const handleLogout = () => {
  confirmModal.value = {
    visible: true,
    title: '로그아웃',
    description: '로그아웃 하시겠습니까?',
    icon: '👋',
    action: () => {
      userStore.logout();
      confirmModal.value.visible = false;
      emit('close');
      router.push({ name: 'onboarding' });
    },
  };
};

const confirmModal = ref({
  visible: false,
  title: '',
  description: '',
  icon: '',
  action: null,
});

const userName = computed(() => userStore.user?.nickname || '');

const navItems = [
  { name: '대시보드', icon: '📊', path: '/' },
  { name: '거래내역', icon: '💳', path: '/transactionList' },
  { name: '캘린더', icon: '📅', path: '/calendar' },
  { name: '프로필', icon: '👤', path: '/profile' },
];

const badges = computed(() => {
  const result = Array(6).fill(null);
  const monthlyData = categoryStore.monthlyTopCountCategories;

  monthlyData.slice(0, 6).forEach((data, index) => {
    if (data.category) {
      const [year, month] = data.month.split('-');
      result[index] = {
        emoji: data.category.img,
        title: `${year.slice(-2)}년 ${parseInt(month, 10)}월 최다 지출 카테고리: ${data.category.name} (${data.count}회)`,
      };
    }
  });

  return result;
});

const getBadgeIndex = (row, col) => (row - 1) * 3 + (col - 1);
const getBadgeEmoji = (row, col) =>
  badges.value[getBadgeIndex(row, col)]?.emoji ?? null;
const getBadgeTitle = (row, col) =>
  badges.value[getBadgeIndex(row, col)]?.title ?? '';

onMounted(async () => {
  const uid = userStore.user?.id;
  if (!uid) return;

  if (!categoryStore.chartData.length) await categoryStore.fetchAll(uid);
  await userStore.fetchUser(uid);
  await templateStore.fetchTemplates(uid);
});

const isCollapsed = ref(false);
const showMenu = ref(false);
const showTemplates = ref(false);
const showAddTemplateModal = ref(false);
const selectedTemplate = ref(null);

const toggleMain = () => {
  isCollapsed.value = !isCollapsed.value;
  showMenu.value = isCollapsed.value;
  if (!isCollapsed.value) {
    showTemplates.value = false;
  }
};

const closeAll = () => {
  isCollapsed.value = false;
  showMenu.value = false;
  showTemplates.value = false;
  selectedTemplate.value = null;
  emit('close');
};

const handleNavClick = () => {
  emit('close');
};

const handleEditTemplate = (tmpl) => {
  selectedTemplate.value = tmpl;
  showAddTemplateModal.value = true;
};

const modal = ref({ visible: false, icon: '', title: '', description: '' });

const handleApplyTemplate = async (tmpl) => {
  const uid = userStore.user?.id;
  if (!uid) return;

  try {
    await templateStore.applyTemplate(tmpl, uid);
    await budgetStore.loadData(uid);
    await categoryStore.fetchAll(uid);
    await reactionStore.fetchReactionMessages();

    const cid = tmpl.cid ?? 10;
    const count = categoryStore.expenseCountByCategory[cid] ?? 1;
    const category = categoryStore.categories.find(
      (c) => Number(c.id) === Number(cid),
    );
    const categoryName = category
      ? `${category.img} ${category.name}`
      : '해당 카테고리';

    const message = reactionStore.resolveMessage(cid, count, categoryName);
    modal.value = {
      visible: true,
      icon: category?.img ?? '✅',
      title: '가계부 작성 완료!',
      description: message,
    };

    router.push('/transactionList');
    closeAll();
  } catch {
    alert('추가에 실패했습니다. 다시 시도해 주세요.');
  }
};

watch(showAddTemplateModal, (val) => {
  if (!val) selectedTemplate.value = null;
});

const handleDeleteTemplate = async (tmpl) => {
  const uid = userStore.user?.id;
  if (!uid) return;

  confirmModal.value = {
    visible: true,
    title: '템플릿 삭제',
    description: `"${tmpl.detail}" 템플릿을 삭제하시겠습니까?`,
    icon: '🗑️',
    action: async () => {
      try {
        await templateStore.deleteTemplate(tmpl.id, uid);
        confirmModal.value.visible = false;
      } catch {
        confirmModal.value.visible = false;
        modal.value = {
          visible: true,
          icon: '⚠️',
          title: '삭제 실패',
          description: '삭제에 실패했습니다. 다시 시도해 주세요.',
        };
      }
    },
  };
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
  z-index: 20;
}

.sidebar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.close-button {
  display: none;
}

.sidebar-logo img {
  width: 6rem;
}

.user-profile {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.6rem;
}

.user-sub {
  font-weight: 700;
}

.user-profile img {
  width: 1.875rem;
}

.logout-btn {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-deepgray-40);
  display: flex;
  align-items: center;
  padding: 4px;
  transition: color 0.2s;
}

.logout-btn:hover {
  color: var(--color-primary);
}

.user-badge {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.badge-grid {
  background-color: var(--color-background, #f7f8fa);
  padding: 16px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: fit-content;
  border: 1px solid var(--color-deepgray-10);
}

.grid-row {
  display: flex;
  gap: 1rem;
}

.badge-item {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: var(--color-white);
  cursor: default;
  transition: transform 0.15s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
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
  padding: 6px;
  border-radius: 6px;
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
  min-width: 200px;
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
  padding: 3px 7px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
  background: transparent;
}

.tmpl-btn > img:first-child {
  width: 1.2rem;
  transition: transform 0.2s ease;
}

.tmpl-delete-img {
  width: 2rem;
  transition: transform 0.2s ease;
}

.tmpl-btn:hover > img:first-child {
  transform: scale(1.1);
}

.tmpl-delete-img:hover {
  transform: scale(1.05);
}

.template-item.add {
  justify-content: flex-start;
  background: none;
  border: none;
  width: 100%;
  color: #aaa;
  font-size: 0.85rem;
  border-top: 1px solid #f0f0f0;
  margin-top: 4px;
  padding-top: 10px;
  text-decoration: none;
  cursor: pointer;
}

.success-modal-description {
  margin: 0;
  color: var(--color-deepgray-80);
  font-size: 1rem;
  line-height: 1.6;
  white-space: pre-line;
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

@media (max-width: 768px) {
  .mobile-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: min(280px, 82vw);
    transform: translateX(-100%);
    transition: transform 0.24s ease;
    box-shadow: 0 18px 40px rgba(44, 51, 51, 0.18);
    overflow-y: auto;
  }

  .mobile-sidebar.mobile-open {
    transform: translateX(0);
  }

  .close-button {
    display: inline-flex;
    width: 36px;
    height: 36px;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 10px;
    background: var(--color-gray-10);
    font-size: 1.4rem;
    cursor: pointer;
    color: var(--color-deepgray-80);
  }

  .budget-container {
    width: 100%;
    padding-top: 16px;
  }

  .menu-stack {
    left: 0;
    right: 0;
    bottom: calc(100% + 8px);
    align-items: stretch;
  }

  .template-popup {
    left: 0;
    top: calc(100% + 8px);
    min-width: 220px;
  }

  .add-budget,
  .template,
  .new-write {
    width: 100%;
  }
}
</style>
