<template>
  <div class="profile-container">
    <RouterView />
  </div>
</template>

<style scoped>
.profile-container {
  width: 100%;
  min-height: calc(100vh - 48px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 24px;
  background-color: var(--color-background, #f7f8fa);
}
</style>
