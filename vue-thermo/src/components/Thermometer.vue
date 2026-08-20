<template>
  <div class="thermometer-card">
    <h3>{{ label }}</h3>
    <slot></slot>
    <div class="meter-outer">
      <div class="meter-container">
        <div class="meter-fill" :style="{ height: fillPercentage + '%' }">
          <span class="score-label">{{ score }}</span>
        </div>
      </div>
      <div
        v-if="sameRange"
        class="range-marker"
        :style="{ bottom: markerPosition(high) + '%' }"
      >
        <span class="marker-value">{{ high }}</span>
      </div>
      <template v-else>
        <div
          v-if="high > 0"
          class="range-marker"
          :style="{ bottom: markerPosition(high) + '%' }"
        >
          <span class="marker-value">{{ high }}</span>
        </div>
        <div
          v-if="low > 0"
          class="range-marker"
          :style="{ bottom: markerPosition(low) + '%' }"
        >
          <span class="marker-value">{{ low }}</span>
        </div>
      </template>
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
  high: {
    type: Number,
    default: 0
  },
  low: {
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

const sameRange = computed(() => props.high > 0 && props.high === props.low);

const markerPosition = (value) => {
  return Math.min(100, Math.max(0, (value / props.maxScore) * 100));
};
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

.meter-outer {
  position: relative;
  width: 40px;
  height: 200px;
}

.meter-container {
  width: 100%;
  height: 100%;
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

.range-marker {
  position: absolute;
  left: -6px;
  width: calc(100% + 12px);
  height: 2px;
  background: #1a1a1a;
  border-radius: 1px;
  z-index: 2;
  transform: translateY(50%);
}

.marker-value {
  position: absolute;
  left: calc(100% + 4px);
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.7rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
  white-space: nowrap;
}
</style>
