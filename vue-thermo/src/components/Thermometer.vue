<template>
  <div class="thermometer-card">
    <h3>{{ label }}</h3>
    <slot></slot>
    <div class="meter-container">
      <div class="meter-fill" :style="{ height: fillPercentage + '%' }">
        <span class="score-label">{{ score }}</span>
      </div>
    </div>
    <div class="scale">
      <span>5</span>
      <span>1</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: String,
  score: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    default: 5
  }
});

const fillPercentage = computed(() => {
  return Math.min(100, Math.max(0, (props.score / props.maxScore) * 100));
});
</script>

<style scoped>
.thermometer-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.meter-container {
  width: 40px;
  height: 200px;
  background: #e0e0e0;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column-reverse;
}

.meter-fill {
  width: 100%;
  background: linear-gradient(0deg, #42b883 0%, #35495e 100%);
  transition: height 0.5s ease-in-out;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 4px;
}

.score-label {
  color: white;
  font-weight: bold;
  font-size: 0.85rem;
}
</style>