<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue";

const props = defineProps({
  duration: {
    type: Number,
    default: 10,
  },

  autoStart: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["finishTimer"]);

defineOptions({
  name: "GameTimer",
});

const timeLeft = ref(0);
const isRunning = ref(false);
let intervalId: ReturnType<typeof setInterval> | null = null;

const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60);
  const seconds = timeLeft.value % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
});

const start = () => {
  if (isRunning.value) {
    return;
  }
  isRunning.value = true;
  intervalId = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      stop();
      emit("finishTimer");
    }
  }, 1000);
};

const stop = () => {
  isRunning.value = false;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

const reset = () => {
  stop();
  timeLeft.value = props.duration;
};

watch(
  () => props.duration,
  (newVal) => {
    timeLeft.value = newVal;
    if (props.autoStart) {
      start();
    }
  }
);

onMounted(() => {
  timeLeft.value = props.duration;

  if (props.autoStart) {
    start();
  }
});

onUnmounted(() => {
  stop();
});

defineExpose({ start, stop, reset });
</script>

<template>
  <div class="timer" :class="{ 'timer--low': timeLeft <= 10 }">
    <span class="time">{{ formattedTime }}</span>
  </div>
</template>

<style lang="scss" scoped>
.timer {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  padding: 8px 16px;
  font-size: 24px;
  font-weight: bold;
  color: #4caf50;
  background: #1f1f2e;
  border: 2px solid #555;
  border-radius: 12px;
  box-shadow: 0 0 8px rgb(76 175 80 / 60%);
  transition: all 0.3s ease;

  &--low {
    color: #ff5252;
    border-color: #ff5252;
    box-shadow: 0 0 12px rgb(255 82 82 / 80%);
    animation: pulse 1s infinite;
  }

  .time {
    font-family: monospace;
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.08);
  }
}
</style>
