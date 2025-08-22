<script lang="ts" setup>
import {
  computed,
  onMounted,
  onBeforeUnmount,
  reactive,
  ref,
  watch,
} from "vue";
import { ElNotification } from "element-plus";
import { useGameStore } from "@/modules/game/store";
import type { IPlayer } from "@/modules/game/types/game-types";
import type {
  IAbilitiesResolved,
  IActionsReceived,
  ISpellInfo,
} from "@/modules/game/types/server-client-response-types";
import socket from "@/package/config/socket";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/modules/game/types/socket-types";
import { IUseAbilityParams } from "@/modules/game/types/client-server-response-types";
import { useRouter } from "vue-router";
import { RouteNames } from "@/router/routes";

defineOptions({ name: "ChoosingVictimPage" });

const gameStore = useGameStore();
const router = useRouter();

const allPlayers = computed<IPlayer[]>(() => gameStore.players || []);
const spells = computed<ISpellInfo[]>(() => gameStore.spells || []);
const me = computed(() => gameStore.name);
const roomId = computed(() => (gameStore.room as string) || "");

const selection = reactive<Record<number, { use: boolean; target?: string }>>(
  {}
);

function initSelection() {
  for (const s of spells.value) {
    if (!(s.id in selection)) {
      selection[s.id] = { use: false, target: undefined };
    }
  }
  for (const key of Object.keys(selection)) {
    const id = Number(key);
    if (!spells.value.some((s) => s.id === id)) {
      delete selection[id];
    }
  }
}

initSelection();
watch(spells, () => initSelection(), { immediate: true });

const sending = ref(false);
const waiting = ref(false);
const submittedCount = ref(0);
const totalCount = ref(0);

const remainingCount = computed(() =>
  Math.max(0, (totalCount.value || 0) - (submittedCount.value || 0))
);

const isValidSubmission = computed(() => {
  for (const s of spells.value) {
    const sel = selection[s.id];
    if (sel?.use) {
      if (!sel.target || sel.target === "") {
        return false;
      }
    }
  }
  return true;
});

const hasAnySelection = computed(() => {
  return spells.value.some((s) => selection[s.id]?.use);
});

function onUseChange(abilityId: number) {
  if (!selection[abilityId].use) {
    selection[abilityId].target = undefined;
  } else {
    if (!selection[abilityId].target) {
      const first = allPlayers.value[0];
      if (first) {
        selection[abilityId].target = first.username;
      }
    }
  }
}

async function submitSelection() {
  if (!isValidSubmission.value) {
    ElNotification({
      title: "Невалидно",
      message: "Для каждой выбранной способности нужно указать цель.",
      type: "warning",
      position: "bottom-right",
    });
    return;
  }

  if (!roomId.value) {
    ElNotification({
      title: "Ошибка",
      message: "RoomId не найден в сторе",
      type: "error",
      position: "bottom-right",
    });
    return;
  }

  const actions = spells.value
    .filter((s) => selection[s.id]?.use)
    .map((s) => ({
      abilityId: s.id,
      targetUsername: selection[s.id].target!,
    }));

  sending.value = true;
  try {
    const payload: IUseAbilityParams = {
      roomId: roomId.value,
      username: me.value as string,
      actions,
    };

    socket.emit(ClientToServerEvents.USE_ABILITIES, payload);

    ElNotification({
      title: "Отправлено",
      message: actions.length
        ? "Ваши действия отправлены"
        : "Вы пропустили ход",
      type: "success",
      position: "bottom-right",
    });

    for (const a of actions) {
      selection[a.abilityId].use = false;
      selection[a.abilityId].target = undefined;
    }
  } catch (err) {
    console.error(err);
    ElNotification({
      title: "Ошибка",
      message: "Не удалось отправить действия",
      type: "error",
      position: "bottom-right",
    });
  } finally {
    sending.value = false;
  }
}

function cooldownText(spell: ISpellInfo) {
  if (spell.available) {
    return "Доступно";
  }
  if (spell.remaining === 1) {
    return "Появится через 1 ход";
  }
  return `Появится через ${spell.remaining} ход(а)`;
}

function onActionsReceived(params: IActionsReceived) {
  submittedCount.value = params.submittedCount;
  totalCount.value = params.total;
  waiting.value = true;
}

function onAbilitiesResolved(params: IAbilitiesResolved) {
  gameStore.setVictimAbilities(params);

  router.replace({
    name: RouteNames.SPELL_PAGE,
  });
}

onMounted(() => {
  socket.on(ServerToClientEvents.ACTIONS_RECEIVED, onActionsReceived);
  socket.on(ServerToClientEvents.ABILITIES_RESOLVED, onAbilitiesResolved);
});

onBeforeUnmount(() => {
  socket.off(ServerToClientEvents.ACTIONS_RECEIVED, onActionsReceived);
  socket.off(ServerToClientEvents.ABILITIES_RESOLVED, onAbilitiesResolved);
});
</script>

<template>
  <div class="choosing-victim-page">
    <div class="header">
      <h2>Выбор способностей</h2>
      <p class="subtitle">
        Выберите способности, которые хотите использовать, и назначьте цель.
      </p>
    </div>

    <div v-if="waiting" class="waiting-banner">
      <div class="banner-inner">
        <div class="spinner" aria-hidden></div>
        <div class="text">
          <div class="title">Ожидаем решения других игроков</div>
          <div class="sub">
            Ждём ещё {{ remainingCount }} игрок(а/ов) ({{ submittedCount }}/
            {{ totalCount }})
          </div>
        </div>
      </div>
    </div>

    <div class="content">
      <section v-if="!waiting" class="spells">
        <div v-if="!spells.length" class="empty">
          У вас нет доступных способностей
        </div>

        <div class="spells-grid">
          <article
            v-for="spell in spells"
            :key="spell.id"
            class="spell-card"
            :class="{
              'spell-card--unavailable': !spell.available,
              'spell-card--selected': selection[spell.id]?.use,
            }"
          >
            <div class="spell-row">
              <div class="spell-meta">
                <h3 class="spell-title">{{ spell.title }}</h3>
                <div class="spell-slug">{{ spell.slug }}</div>
              </div>

              <div class="spell-right">
                <div class="spell-cd" :title="cooldownText(spell)">
                  {{ cooldownText(spell) }}
                </div>

                <label class="use-toggle">
                  <input
                    v-model="selection[spell.id].use"
                    type="checkbox"
                    :disabled="!spell.available || sending"
                    @change="() => onUseChange(spell.id)"
                  />
                  <span>Использовать</span>
                </label>
              </div>
            </div>

            <p class="spell-desc">{{ spell.description }}</p>

            <div class="spell-footer">
              <div class="base-cd">
                Базовый CD: {{ spell.baseCooldown }} ход(ов)
              </div>

              <div v-if="selection[spell.id].use" class="target-block">
                <label>Цель:</label>
                <select
                  v-model="selection[spell.id].target"
                  :disabled="sending"
                >
                  <option value="" disabled>Выберите игрока</option>
                  <option
                    v-for="p in allPlayers"
                    :key="p.username"
                    :value="p.username"
                  >
                    {{ p.username }} <span v-if="p.isAdmin"> (👑)</span>
                  </option>
                </select>
              </div>
            </div>
          </article>
        </div>
      </section>

      <aside class="players">
        <h4>Игроки</h4>
        <ul class="players-list">
          <li
            v-for="p in allPlayers"
            :key="p.username"
            :class="{ me: p.username === me }"
          >
            <div class="player-line">
              <div class="player-name">
                <span class="username">{{ p.username }}</span>
                <span v-if="p.isAdmin" class="admin">👑</span>
                <span v-if="p.username === me" class="you">⭐ Вы</span>
              </div>
              <div class="player-meta">Класс: {{ p.characterId }}</div>
            </div>
          </li>
        </ul>
        <div class="actions">
          <button
            type="button"
            class="btn btn-ghost"
            :disabled="sending || waiting"
            @click="
              () => {
                for (const s of spells) {
                  selection[s.id].use = false;
                  selection[s.id].target = undefined;
                }
              }
            "
          >
            Сбросить
          </button>

          <button
            class="btn btn-primary"
            type="button"
            :disabled="
              sending || waiting || !isValidSubmission || !hasAnySelection
            "
            @click="submitSelection"
          >
            {{ sending ? "Отправка..." : "Подтвердить действия" }}
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.choosing-victim-page {
  padding: 1.5rem;
  font-family:
    Inter,
    system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial;
  color: #fff;

  .header {
    margin-bottom: 1rem;

    h2 {
      margin: 0;
      font-size: 1.6rem;
    }

    .subtitle {
      margin-top: 6px;
      color: #cfcfcf;
    }
  }

  .waiting-banner {
    padding: 12px;
    margin-bottom: 12px;
    background: linear-gradient(90deg, rgb(0 0 0 / 35%), rgb(0 0 0 / 25%));
    border: 1px solid rgb(255 255 255 / 3%);
    border-radius: 10px;

    .banner-inner {
      display: flex;
      gap: 12px;
      align-items: center;

      .spinner {
        width: 36px;
        height: 36px;
        border: 4px solid rgb(255 255 255 / 8%);
        border-top-color: #ffd54f;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .text {
        .title {
          font-weight: 700;
        }

        .sub {
          margin-top: 4px;
          font-size: 13px;
          color: #d0d0d0;
        }
      }
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .content {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 1.25rem;
    align-items: start;
  }

  .spells {
    .empty {
      padding: 2rem;
      color: #bbb;
      text-align: center;
      background: #1b1b26;
      border-radius: 10px;
    }

    .spells-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 12px;
    }

    .spell-card {
      padding: 14px;
      background: linear-gradient(180deg, #1f1f2e, #14141a);
      border: 2px solid transparent;
      border-radius: 12px;
      box-shadow: 0 6px 18px rgb(0 0 0 / 45%);
      transition:
        transform 0.12s ease,
        border-color 0.12s ease;

      &--selected {
        border-color: #4caf50;
        transform: translateY(-4px);
      }

      &--unavailable {
        opacity: 0.55;
      }

      .spell-row {
        display: flex;
        gap: 12px;
        align-items: start;
        justify-content: space-between;
      }

      .spell-meta {
        .spell-title {
          font-size: 1.05rem;
          font-weight: 700;
        }

        .spell-slug {
          margin-top: 4px;
          font-size: 12px;
          color: #c0bfbf;
        }
      }

      .spell-right {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: flex-end;

        .spell-cd {
          font-size: 12px;
          font-weight: 600;
          color: #ffd54f;
        }

        .use-toggle {
          display: flex;
          gap: 8px;
          align-items: center;

          input {
            width: 18px;
            height: 18px;
          }

          span {
            font-size: 13px;
            font-weight: 600;
          }
        }
      }

      .spell-desc {
        min-height: 38px;
        margin: 10px 0;
        font-size: 13px;
        color: #cfcfcf;
      }

      .spell-footer {
        display: flex;
        gap: 12px;
        align-items: center;
        justify-content: space-between;

        .base-cd {
          font-size: 12px;
          color: #9ea0a5;
        }

        .target-block {
          display: flex;
          flex-direction: column;
          gap: 6px;

          label {
            font-size: 12px;
            color: #ddd;
          }

          select {
            min-width: 160px;
            padding: 8px;
            color: #fff;
            background: #0f0f12;
            border: 1px solid #2a2a3d;
            border-radius: 8px;
          }
        }
      }
    }
  }

  .players {
    padding: 12px;
    background: linear-gradient(
      180deg,
      rgb(255 255 255 / 3%),
      rgb(255 255 255 / 1.5%)
    );
    border: 1px solid rgb(255 255 255 / 3%);
    border-radius: 12px;

    h4 {
      margin: 0 0 8px;
      color: #fff;
    }

    .players-list {
      padding: 0;
      margin: 0 0 12px;
      list-style: none;

      li {
        padding: 8px 6px;
        margin-bottom: 6px;
        background: rgb(0 0 0 / 25%);
        border-radius: 8px;

        &.me {
          outline: 2px solid rgb(255 255 0 / 12%);
        }

        .player-line {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: space-between;

          .player-name {
            font-weight: 700;
          }

          .player-meta {
            font-size: 12px;
            color: #cfcfcf;
          }
        }
      }
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 6px;

      .btn {
        padding: 10px 12px;
        font-weight: 700;
        cursor: pointer;
        border: none;
        border-radius: 8px;
      }

      .btn-ghost {
        color: #fff;
        background: transparent;
        border: 1px solid rgb(255 255 255 / 6%);
      }

      .btn-primary {
        color: #fff;
        background: linear-gradient(90deg, #ff8a65, #ff6f61);
      }

      .btn-primary:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }
    }
  }

  @media (width <= 1024px) {
    .content {
      grid-template-columns: 1fr 300px;
    }

    .spells-grid {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
  }

  @media (width <= 768px) {
    .content {
      grid-template-columns: 1fr;
    }

    .spells-grid {
      grid-template-columns: 1fr;
    }

    .players {
      order: 2;
      margin-top: 12px;
    }

    .spell-footer {
      flex-direction: column;
      gap: 8px;
      align-items: stretch;

      .target-block select {
        width: 100%;
      }
    }

    .spell-card {
      padding: 16px;
    }

    .header h2 {
      font-size: 1.4rem;
    }
  }

  @media (width <= 420px) {
    padding: 12px;

    .spell-meta .spell-title {
      font-size: 1rem;
    }

    .spell-slug {
      font-size: 11px;
    }

    .spell-desc {
      font-size: 13px;
    }

    .players {
      padding: 10px;
    }

    .players-list li {
      padding: 10px;
    }

    .actions .btn {
      width: 100%;
      padding: 12px;
    }

    .spell-card .use-toggle input {
      width: 22px;
      height: 22px;
    }
  }
}
</style>
