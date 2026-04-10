<template>
  <div>
    <h1>Home</h1>
    <button @click="goToList">거래 내역 보기</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToList = () => {
  router.push('/api/data'); // /transactions 경로로 이동
};
</script>
