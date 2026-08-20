<template>
  <div class="thermometer-card">
    <h3>{{ label }}</h3>
    <p class="description">
      <slot></slot>
    </p>
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
        <span class="marker-value marker-value--right">{{ high }} ×{{ highCount }}</span>
      </div>
      <template v-else>
        <div
          v-if="high > 0"
          class="range-marker"
          :style="{ bottom: markerPosition(high) + '%' }"
        >
          <span class="marker-value marker-value--right">{{ high }} ×{{ highCount }}</span>
        </div>
        <div
          v-if="low > 0"
          class="range-marker"
          :style="{ bottom: markerPosition(low) + '%' }"
        >
          <span class="marker-value marker-value--left">{{ low }} ×{{ lowCount }}</span>
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
  highCount: {
    type: Number,
    default: 0
  },
  lowCount: {
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
  padding: 1.5rem 1.25rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

h3 {
  margin: 0 0 0.4rem;
  line-height: 1.25;
}

.description {
  margin: 0 0 1.25rem;
  padding: 0 0.25rem;
  font-size: 0.9rem;
  line-height: 1.35;
  color: #444;
  min-height: 2.7em;
}

.meter-outer {
  position: relative;
  width: 40px;
  height: 200px;
  margin-top: 0.35rem;
  padding-left: 2.75rem;
  padding-right: 2.75rem;
  box-sizing: content-box;
}

.meter-container {
  width: 40px;
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
  left: calc(2.75rem - 6px);
  width: calc(40px + 12px);
  height: 2px;
  background: #1a1a1a;
  border-radius: 1px;
  z-index: 2;
  transform: translateY(50%);
}

.marker-value {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.7rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
  white-space: nowrap;
}

.marker-value--right {
  left: calc(100% + 6px);
}

.marker-value--left {
  right: calc(100% + 6px);
}
</style>
