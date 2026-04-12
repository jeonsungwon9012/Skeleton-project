<script setup>
import { useRouter } from 'vue-router';
import logoSignature from '@/assets/icons/TT_logo-signiture.svg';
import logoIcon from '@/assets/icons/logo-icon.svg';

const router = useRouter();

const startApp = () => {
  router.push('/login');
};
</script>

<template>
  <div class="onboarding-container">
    <div class="glow glow-left"></div>
    <div class="glow glow-right"></div>

    <section class="content-box">
      <img class="brand-logo" :src="logoSignature" alt="똑딱 로고" />

      <div class="hero-visual" aria-hidden="true">
        <span class="spark spark-top">✦</span>
        <span class="spark spark-bottom">✦</span>
        <span class="coin coin-left">₩</span>
        <span class="coin coin-right">₩</span>
        <img class="hero-logo" :src="logoIcon" alt="" />
      </div>

      <p class="tagline">똑딱하게 딱 기록하는 가계부</p>

      <button type="button" class="start-button" @click="startApp">
        시작하기
      </button>
    </section>
  </div>
</template>

<style scoped>
.onboarding-container {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background:
    radial-gradient(
      circle at 50% 30%,
      rgba(255, 255, 255, 0.72),
      transparent 22%
    ),
    linear-gradient(180deg, #98f09e 0%, #c9f7cb 42%, #f7fff7 84%, #ffffff 100%);
}

.glow {
  position: absolute;
  width: 28rem;
  height: 28rem;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.55;
  pointer-events: none;
}

.glow-left {
  left: -10rem;
  top: -4rem;
  background: rgba(125, 242, 139, 0.6);
}

.glow-right {
  right: -10rem;
  top: 4rem;
  background: rgba(170, 250, 184, 0.58);
}

.content-box {
  position: relative;
  z-index: 1;
  width: min(100%, 26rem);
  padding: 3rem 1.5rem 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.brand-logo {
  width: min(100%, 8.5rem);
  margin-bottom: 2.5rem;
}

.hero-visual {
  position: relative;
  width: 12rem;
  height: 12rem;
  margin-bottom: 2rem;
}

.hero-logo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 1rem 1.8rem rgba(71, 199, 93, 0.16));
}

.spark,
.coin {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.spark {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.2rem;
}

.spark-top {
  top: 1.55rem;
  right: 1.3rem;
}

.spark-bottom {
  left: 1.35rem;
  bottom: 1.7rem;
}

.coin {
  width: 1.45rem;
  height: 1.45rem;
  border-radius: 50%;
  background: #ffd254;
  color: #33353b;
  font-size: 0.75rem;
  font-weight: 900;
  box-shadow: 0 0.45rem 0.8rem rgba(255, 210, 84, 0.35);
}

.coin-left {
  left: 0.15rem;
  top: 5rem;
}

.coin-right {
  right: 0.3rem;
  top: 2.8rem;
}

.tagline {
  margin-bottom: 1rem;
  font-size: 0.92rem;
  font-weight: 600;
  color: rgba(51, 53, 59, 0.48);
}

.start-button {
  width: min(100%, 10rem);
  height: 3.4rem;
  border: none;
  border-radius: 0.95rem;
  background: linear-gradient(180deg, #5be36a 0%, #63e26f 100%);
  color: #17311d;
  font-size: 1.15rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 0.85rem 1.6rem rgba(91, 227, 106, 0.22);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease;
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 1rem 1.8rem rgba(91, 227, 106, 0.26);
  filter: saturate(1.02);
}

.start-button:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .content-box {
    width: min(100%, 20rem);
    padding: 2.25rem 1.25rem 3rem;
  }

  .brand-logo {
    width: min(100%, 7rem);
    margin-bottom: 2rem;
  }

  .hero-visual {
    width: 9.75rem;
    height: 9.75rem;
    margin-bottom: 1.7rem;
  }

  .spark {
    font-size: 1rem;
  }

  .coin {
    width: 1.3rem;
    height: 1.3rem;
    font-size: 0.7rem;
  }

  .tagline {
    font-size: 0.78rem;
    margin-bottom: 0.9rem;
  }

  .start-button {
    width: min(100%, 9rem);
    height: 3rem;
    font-size: 1rem;
    border-radius: 0.85rem;
  }
}
</style>
