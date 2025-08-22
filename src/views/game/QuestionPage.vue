<script lang="ts" setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useGameStore } from "@/modules/game/store";
import {
  AnswerVariant,
  IGameQuestion,
} from "@/modules/game/types/server-client-response-types";

const emit = defineEmits(["answered"]);

defineOptions({
  name: "QuestionPage",
});

const gameStore = useGameStore();

const currentQuestion = computed<IGameQuestion | null>(() => {
  // возможен пустой объект — приведи к null если нет вопроса
  return gameStore.currentQuestion &&
    Object.keys(gameStore.currentQuestion).length > 0
    ? (gameStore.currentQuestion as IGameQuestion)
    : null;
});

// порядок вариантов
const variants = [
  AnswerVariant.ANSWER1,
  AnswerVariant.ANSWER2,
  AnswerVariant.ANSWER3,
  AnswerVariant.ANSWER4,
] as const;

const focusedIndex = ref<number>(0);
const selectedIndex = ref<number | null>(null);

// выбираем вариант
function choose(index: number) {
  if (!currentQuestion.value) {
    return;
  }
  selectedIndex.value = index;
  const variant = variants[index];
  // эмитим событие с выбранным вариантом и текстом
  emit("answered", { variant, text: currentQuestion.value[variant] });
}

// клавиатурная навигация
function onKeyDown(e: KeyboardEvent) {
  if (!currentQuestion.value) {
    return;
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    focusedIndex.value = (focusedIndex.value + 1) % variants.length;
    scrollIntoViewIfNeeded(focusedIndex.value);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    focusedIndex.value =
      (focusedIndex.value - 1 + variants.length) % variants.length;
    scrollIntoViewIfNeeded(focusedIndex.value);
  } else if (e.key === "Enter") {
    e.preventDefault();
    choose(focusedIndex.value);
  } else if (e.key === "Escape") {
    // отмена выбора
    selectedIndex.value = null;
  }
}

function scrollIntoViewIfNeeded(index: number) {
  // плавно проскроллим карточку в видимую область, если нужно
  const el = document.querySelector(
    `.choice[data-index="${index}"]`
  ) as HTMLElement | null;
  if (el) {
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

onMounted(() => {
  window.addEventListener("keydown", onKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeyDown);
});
</script>

<template>
  <div v-if="currentQuestion" class="question-page">
    <div class="parchment">
      <header class="q-header">
        <h1 class="q-title" v-text="currentQuestion.title"></h1>
        <div class="ornament top"></div>
      </header>

      <main class="choices" role="list" aria-label="Answer choices">
        <button
          v-for="(v, idx) in variants"
          :key="v"
          class="choice"
          type="button"
          :class="{
            focused: focusedIndex === idx,
            selected: selectedIndex === idx,
            disabled: selectedIndex !== null && selectedIndex !== idx,
          }"
          :data-index="idx"
          role="listitem"
          :aria-pressed="selectedIndex === idx ? 'true' : 'false'"
          @mouseenter="focusedIndex = idx"
          @focus="focusedIndex = idx"
          @click="choose(idx)"
        >
          <span class="rune left" />

          <span class="choice-body">
            <span class="choice-letter">{{
              String.fromCharCode(65 + idx)
            }}</span>
            <span class="choice-text">{{ currentQuestion[v] }}</span>
          </span>

          <span class="rune right" />
        </button>
      </main>
    </div>
  </div>

  <div v-else class="question-page empty">
    <div class="parchment empty-state">
      <h2>No question</h2>
      <p>Waiting for the next question...</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Uncial+Antiqua&display=swap";

$bg: #061018;
$parchment: linear-gradient(180deg, #f6eedb 0%, #f0e7cf 100%);
$gold: #d9b36a;
$glow: rgb(150 220 255 / 15%);
$accent: #8fe7ff;

.question-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 36px;
  font-family: Cinzel, serif;
  color: #fff;
  background:
    radial-gradient(ellipse at center, #05111a 0%, #02060a 100%),
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><radialGradient id="g" cx="50%" cy="50%"><stop offset="0" stop-color="%23070f1a" stop-opacity="0.6"/><stop offset="1" stop-color="%23020407" stop-opacity="0.9"/></radialGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/></svg>')
      center/cover no-repeat;
}

/* Parchment panel */
.parchment {
  position: relative;
  width: min(920px, 96%);
  padding: 28px;
  overflow: hidden;
  background: $parchment;
  border: 3px solid rgb(16 12 8 / 12%);
  border-radius: 18px;
  box-shadow:
    0 10px 30px rgb(2 6 10 / 70%),
    inset 0 1px 0 rgb(255 255 255 / 35%),
    0 0 30px rgb(137 196 255 / 4%);
  backdrop-filter: blur(2px);

  /* subtle paper texture */
  &::after {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: "";
    background-image:
      radial-gradient(circle at 10% 10%, rgb(0 0 0 / 2%), transparent 10%),
      linear-gradient(180deg, rgb(255 255 255 / 2%), transparent 40%);
    mix-blend-mode: multiply;
  }
}

/* header */
.q-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;

  .q-title {
    margin: 0;
    font-size: 1.9rem;
    font-weight: 700;
    color: #2b1b06;
    letter-spacing: 0.6px;
    text-shadow: 0 2px 0 rgb(255 255 255 / 60%);
  }

  .ornament {
    width: 64px;
    height: 16px;
    background: linear-gradient(90deg, transparent, $gold 50%, transparent);
    opacity: 0.9;

    &.top {
      transform: translateY(-2px);
    }
  }
}

/* choices grid */
.choices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin: 8px 0 12px;
}

/* choice button */
.choice {
  position: relative;
  display: flex;
  gap: 14px;
  align-items: center;
  width: 100%;
  padding: 14px;
  cursor: pointer;
  outline: none;
  background: linear-gradient(180deg, rgb(12 8 6 / 2%), rgb(255 255 255 / 0%));
  border: none;
  border-radius: 12px;
  box-shadow:
    0 6px 18px rgb(6 10 16 / 40%),
    inset 0 -2px 0 rgb(0 0 0 / 6%);
  transition:
    transform 0.18s cubic-bezier(0.2, 0.9, 0.2, 1),
    box-shadow 0.18s,
    background 0.18s;
  -webkit-tap-highlight-color: transparent;

  &:hover,
  &.focused {
    box-shadow:
      0 18px 36px rgb(11 20 30 / 55%),
      0 0 18px rgb(143 231 255 / 6%);
    transform: translateY(-6px) scale(1.01);
  }

  &:active,
  &.selected {
    background: linear-gradient(
      180deg,
      rgb(255 255 255 / 2%),
      rgb(255 255 255 / 1%)
    );
    box-shadow: 0 8px 22px rgb(6 12 18 / 55%);
    transform: translateY(-2px) scale(0.995);
  }

  &.disabled {
    pointer-events: none;
    box-shadow: none;
    opacity: 0.55;
    transform: none;
  }
}

/* decorative rune bars */
.rune {
  position: relative;
  width: 10px;
  height: 64px;
  background: linear-gradient(180deg, rgb(12 8 6 / 6%), rgb(255 255 255 / 2%));
  border-radius: 6px;
  box-shadow: inset 0 0 10px rgb(160 220 255 / 5%);

  &.left {
    margin-left: 6px;
  }

  &.right {
    margin-right: 6px;
  }

  &::before {
    position: absolute;
    inset: 6px;
    content: "";
    background: linear-gradient(
      180deg,
      rgb(140 200 255 / 4%),
      rgb(200 240 255 / 1%)
    );
    border-radius: 4px;
    transform: rotate(6deg);
  }
}

/* choice body */
.choice-body {
  display: flex;
  flex: 1;
  gap: 14px;
  align-items: center;
}

.choice-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 44px;
  font-size: 1.05rem;
  font-weight: 900;
  color: #ffdca3;
  text-shadow: 0 2px 0 rgb(0 0 0 / 60%);
  background: linear-gradient(180deg, #2a1b08, #3c2710);
  border: 1px solid rgb(255 230 180 / 6%);
  border-radius: 10px;
  box-shadow:
    0 6px 18px rgb(0 0 0 / 60%),
    inset 0 -2px 0 rgb(255 255 255 / 3%);
}

/* text */
.choice-text {
  flex: 1;
  padding-right: 8px;
  font-family: "Uncial Antiqua", Cinzel, serif;
  font-size: 1rem;
  line-height: 1.25;
  color: #2b1b06;
  letter-spacing: 0.2px;
}

/* focused outline (for keyboard) */
.choice.focused {
  border: 1px solid rgb(143 231 255 / 18%);
  box-shadow:
    0 20px 40px rgb(11 20 30 / 60%),
    0 0 20px rgb(140 220 255 / 12%);
}

/* selected look */
.choice.selected .choice-letter {
  color: #fff3d9;
  background: linear-gradient(180deg, #6a3816, #793f18);
  box-shadow: 0 10px 24px rgb(110 45 12 / 40%);
}

/* footer */
.q-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18px;

  .hint {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 6px 10px;
    font-size: 0.85rem;
    color: rgb(43 27 6 / 90%);
    background: rgb(255 255 255 / 2%);
    border-radius: 8px;

    kbd {
      padding: 2px 6px;
      font-family:
        ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;
      color: #2b1b06;
      background: #fde6b2;
      border-radius: 4px;
      box-shadow: inset 0 -1px 0 rgb(0 0 0 / 20%);
    }
  }
}

/* empty state */
.empty-state {
  padding: 40px;
  text-align: center;

  h2 {
    margin-bottom: 8px;
    font-size: 1.5rem;
    color: #3b2a10;
  }

  p {
    margin: 0;
    color: #5a4b2f;
  }
}

/* responsive */
@media (width <= 640px) {
  .choices {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .rune {
    display: none;
  }

  .q-title {
    font-size: 1.4rem;
  }

  .parchment {
    padding: 18px;
    border-radius: 12px;
  }
}
</style>
