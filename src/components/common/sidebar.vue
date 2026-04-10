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
          <div
            v-for="i in 3"
            :key="i"
            class="badge-item"
            :title="getBadgeTitle(row, i)"
          >
            <span v-if="getBadgeEmoji(row, i)" class="badge-emoji">
              {{ getBadgeEmoji(row, i) }}
            </span>
            <img v-else :src="placeholder" alt="뱃지" />
          </div>
        </div>
      </div>
    </div>

    <!-- 네비 -->
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
      <!-- 위에 뜨는 메뉴 -->
      <div v-if="showMenu" class="menu-stack">
        <!-- 자동완성 템플릿 버튼 -->
        <div class="template-wrapper">
          <button class="btn template" @click="showTemplates = !showTemplates">
            <span>자동완성 템플릿</span>
            <span class="arrow">›</span>
          </button>

          <!-- 템플릿 팝업 -->
          <div v-if="showTemplates" class="template-popup">
            <!-- 템플릿이 있으면 목록 표시 -->
            <template v-if="templateStore.templates.length > 0">
              <div
                v-for="tmpl in templateStore.templates"
                :key="tmpl.id"
                class="template-item"
              >
                <!-- 템플릿 정보 — 클릭 시 즉시 거래 추가 -->
                <div class="tmpl-info" @click="handleApplyTemplate(tmpl)">
                  <span class="tmpl-title">{{ tmpl.detail }}</span>
                  <span class="tmpl-desc">
                    {{ tmpl.type === 'expense' ? '-' : '+'
                    }}{{ tmpl.amount.toLocaleString() }}원
                  </span>
                </div>
                <!-- 수정 / 삭제 버튼 -->
                <div class="tmpl-actions">
                  <RouterLink
                    :to="{
                      path: '/addTransaction',
                      query: { templateId: tmpl.id },
                    }"
                    class="tmpl-btn"
                    @click="closeAll"
                  >
                    <img :src="editPencil" />
                  </RouterLink>
                  <img
                    class="tmpl-btn tmpl-delete-img"
                    :src="trash"
                    @click="handleDeleteTemplate(tmpl)"
                  />
                </div>
              </div>
            </template>

            <!-- 템플릿이 3개 미만이면 추가 버튼 표시 -->
            <RouterLink
              v-if="templateStore.templates.length < 3"
              to="/addTransaction"
              class="template-item add"
              @click="closeAll"
            >
              템플릿 추가하기
            </RouterLink>
          </div>
        </div>

        <!-- 새로 작성 버튼 -->
        <RouterLink
          to="/addTransaction"
          class="btn new-write"
          @click="closeAll"
        >
          <span>새로 작성</span>
          <span class="arrow">›</span>
        </RouterLink>
      </div>

      <!-- 추가 완료 토스트 -->
      <div v-if="toast.visible" class="toast">
        <p>{{ toast.message }}</p>
        <RouterLink to="/TransactionList" class="toast-link" @click="closeAll">
          거래내역 리스트로 이동 →
        </RouterLink>
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
import logo from '@/assets/icons/logo-signiture.svg';
import profileIcon from '@/assets/icons/profile.svg';
import placeholder from '@/assets/icons/placeholder.svg';
import coinIcon from '@/assets/icons/money.svg';
import editPencil from '@/assets/icons/edit-pencil.svg';
import trash from '@/assets/icons/trash.svg';
import { ref, computed, onMounted } from 'vue';
import { useCategoryStore } from '@/stores/category';
import { useTemplateStore } from '@/stores/template';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const categoryStore = useCategoryStore();
const templateStore = useTemplateStore();

const userName = computed(() => userStore.user?.nickname || '');
const uid = localStorage.getItem('userId') || '1';

const navItems = [
  { name: '대시보드', icon: '📊', path: '/' },
  { name: '거래내역', icon: '📝', path: '/TransactionList' },
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
        title: `${year.slice(-2)}년 ${parseInt(month)}월 지출 빈도가 높은 카테고리: ${data.category.name} (${data.count}회)`,
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
  if (!categoryStore.chartData.length) await categoryStore.fetchAll(uid);
  await userStore.fetchUser(uid);
  await templateStore.fetchTemplates(uid);
});

// 버튼 상태
const isCollapsed = ref(false); // 버튼 접힘
const showMenu = ref(false); // 위 버튼 표시
const showTemplates = ref(false); // 템플릿 하위 메뉴

const toggleMain = () => {
  isCollapsed.value = !isCollapsed.value;
  showMenu.value = isCollapsed.value;
  if (!isCollapsed.value) {
    showTemplates.value = false;
  }
};

// 메뉴 전체 닫기 (RouterLink 클릭 후 정리)
const closeAll = () => {
  isCollapsed.value = false;
  showMenu.value = false;
  showTemplates.value = false;
};

// 토스트
const toast = ref({ visible: false, message: '' });
let toastTimer = null;

const showToast = (message) => {
  if (toastTimer) clearTimeout(toastTimer);
  toast.value = { visible: true, message };
  toastTimer = setTimeout(() => {
    toast.value.visible = false;
  }, 4000);
};

// 템플릿으로 즉시 거래 추가
const handleApplyTemplate = async (tmpl) => {
  try {
    await templateStore.applyTemplate(tmpl, uid);
    closeAll();
    showToast(`✅ "${tmpl.detail}" 추가되었습니다`);
  } catch {
    showToast('❌ 추가에 실패했어요. 다시 시도해주세요.');
  }
};

// 템플릿 삭제
const handleDeleteTemplate = async (tmpl) => {
  const confirmed = confirm(`"${tmpl.detail}" 템플릿을 삭제하시겠습니까?`);
  if (!confirmed) return;
  try {
    await templateStore.deleteTemplate(tmpl.id, uid);
  } catch {
    alert('삭제에 실패했어요. 다시 시도해주세요.');
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

/* 위에 쌓이는 메뉴 */
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

/* 템플릿 팝업 */
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

/* 템플릿 아이템 */
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

/* 템플릿 정보 영역 (클릭 시 즉시 추가) */
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

/* 수정 / 삭제 버튼 */
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

/* 템플릿 추가하기 버튼 */
.template-item.add {
  justify-content: flex-start;
  color: #aaa;
  font-size: 0.85rem;
  border-top: 1px solid #f0f0f0;
  margin-top: 4px;
  padding-top: 10px;
  text-decoration: none;
  cursor: pointer;
}

/* 토스트 */
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
</style>
