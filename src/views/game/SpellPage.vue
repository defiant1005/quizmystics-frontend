<script setup lang="ts">
// Three.js + утилиты
import * as THREE from "three";
import { onMounted, onBeforeUnmount, ref } from "vue";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

// ==== ТИПЫ И ДАННЫЕ ====
interface IVictimAbilities {
  from: string;
  to: string;
  abilityId: number;
  success: boolean;
}
interface IVictimAbilitiesGroupedByTarget {
  to: string;
  hits: IVictimAbilities[];
}

// Если у тебя есть стор как в начале — просто подставь его сюда.
// Ниже — пример мок-данных; компонент работает и с реальными.
const victimAbilitiesGroupedByTarget = ref<IVictimAbilitiesGroupedByTarget[]>([
  {
    to: "Эльф Аэлин",
    hits: [
      { from: "Маг Ралор", to: "Эльф Аэлин", abilityId: 1, success: true },
      { from: "Гоблин Скрик", to: "Эльф Аэлин", abilityId: 2, success: false },
      { from: "Воин Тарг", to: "Эльф Аэлин", abilityId: 3, success: true },
    ],
  },
  {
    to: "Гоблин Скрик",
    hits: [
      { from: "Эльф Аэлин", to: "Гоблин Скрик", abilityId: 1, success: false },
      { from: "Маг Ралор", to: "Гоблин Скрик", abilityId: 4, success: true },
    ],
  },
]);

// Названия и цвета способностей (можешь из своего словаря подставить)
const abilityNames: Record<number, string> = {
  1: "Fireball",
  2: "Ice Bolt",
  3: "Shadow Strike",
  4: "Arcane Lance",
};
const abilityColors: Record<number, number> = {
  1: 0xff5a00,
  2: 0x6ecbff,
  3: 0x6b3fa0,
  4: 0xf2ff67,
};

// ==== ССЫЛКИ НА ЭЛЕМЕНТЫ ====
const canvasRef = ref<HTMLCanvasElement | null>(null);
const labelContainerRef = ref<HTMLDivElement | null>(null);

// ==== ГЛОБАЛЫ СЦЕНЫ ====
let renderer: THREE.WebGLRenderer;
let labelRenderer: CSS2DRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
let clock = new THREE.Clock();
let raf = 0;

// Пул для очистки
const temp: any[] = [];

// ==== ЗАГРУЗКА МОДЕЛЕЙ ====
// Используем человекоподобную модель из примеров three.js (Soldier.glb) — у неё есть Idle/Walk/Run.
// При желании замени на своих: маг, эльф, гоблин, и т.д. (GLB из Mixamo/Sketchfab).
const HUMAN_URL = "https://threejs.org/examples/models/gltf/Soldier.glb"; // стабильный CDN примеров three.js

type Char = {
  root: THREE.Object3D;
  mixer: THREE.AnimationMixer;
  clips: THREE.AnimationClip[];
  actions: Record<string, THREE.AnimationAction>;
  label?: CSS2DObject;
  name?: string;
};
const loader = new GLTFLoader();

async function loadHuman(color: number): Promise<Char> {
  const gltf = await loader.loadAsync(HUMAN_URL);
  const root = gltf.scene;
  root.traverse((o: any) => {
    if (o.isMesh) {
      // перекрашиваем, оставляя скин
      o.material = new THREE.MeshStandardMaterial({ color, skinning: true });
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  root.scale.set(1.25, 1.25, 1.25);

  const mixer = new THREE.AnimationMixer(root);
  const clips = gltf.animations;
  // Для Soldier доступны "Idle", "Walk", "Run". Сделаем суррогат "Cast" руками (поворот кости).
  const idle = THREE.AnimationClip.findByName(clips, "Idle");
  const walk = THREE.AnimationClip.findByName(clips, "Walk");
  const run = THREE.AnimationClip.findByName(clips, "Run");

  const actions: Record<string, THREE.AnimationAction> = {};
  if (idle) {
    actions.Idle = mixer.clipAction(idle);
  }
  if (walk) {
    actions.Walk = mixer.clipAction(walk);
  }
  if (run) {
    actions.Run = mixer.clipAction(run);
  }

  // Грубый псевдо-каст: анимируем правую руку самописно (добавим clip "Cast" на 0.8 сек)
  const castTrack = new THREE.NumberKeyframeTrack(
    ".userData.cast",
    [0, 0.4, 0.8],
    [0, 1, 0]
  );
  const Cast = new THREE.AnimationClip("Cast", 0.8, [castTrack]);
  actions.Cast = mixer.clipAction(Cast);

  // Hit реакция: используем "Run" на месте + тряска позы (самописно)
  const hitTrack = new THREE.NumberKeyframeTrack(
    ".userData.hit",
    [0, 0.3, 0.6],
    [0, 1, 0]
  );
  const Hit = new THREE.AnimationClip("Hit", 0.6, [hitTrack]);
  actions.Hit = mixer.clipAction(Hit);

  return { root, mixer, clips, actions };
}

// Плавный переход анимации
function fadeTo(
  actionFrom: THREE.AnimationAction | undefined,
  actionTo: THREE.AnimationAction,
  duration = 0.4
) {
  if (actionFrom && actionFrom !== actionTo) {
    actionFrom.fadeOut(duration);
  }
  actionTo
    .reset()
    .setEffectiveTimeScale(1)
    .setEffectiveWeight(1)
    .fadeIn(duration)
    .play();
}

// ====== ТЕКСТОВЫЕ ЛЕЙБЛЫ (без наложений) ======
function makeLabel(
  text: string,
  target: THREE.Object3D,
  className: string,
  y = 2.6
) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = text;
  const label = new CSS2DObject(div);
  label.position.set(0, y, 0);
  target.add(label);
  return label;
}
// Для читаемости: жертва — по центру сверху, атакующий — чуть в сторону от направления "радиусом" наружу
function placeAttackerLabel(label: CSS2DObject, attackerPos: THREE.Vector3) {
  // смещение в экранных координатах через CSS (не 3D), чтобы не пересекалось с жертвой
  (label.element as HTMLElement).style.transform = "translate(-50%, -140%)";
}

// ====== FX: Фаербол (ядро, glow, хвост-частицы) ======
function makeFireball(color = 0xff6a00) {
  const group = new THREE.Group();

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 20, 20),
    new THREE.MeshBasicMaterial({ color })
  );
  group.add(core);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.52, 20, 20),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35 })
  );
  group.add(glow);

  // хвост — полупрозрачные "искры"
  const tailGeo = new THREE.BufferGeometry();
  const COUNT = 80;
  const positions = new Float32Array(COUNT * 3);
  tailGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const tailMat = new THREE.PointsMaterial({
    color,
    size: 0.12,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });
  const tail = new THREE.Points(tailGeo, tailMat);
  (tail as any)._life = new Array(COUNT).fill(0);
  group.add(tail);

  (group as any)._updateTail = (pos: THREE.Vector3) => {
    const a = tail.geometry.attributes.position as THREE.BufferAttribute;
    // сдвигаем точки назад
    for (let i = COUNT - 1; i > 0; i--) {
      a.setXYZ(i, a.getX(i - 1), a.getY(i - 1), a.getZ(i - 1));
    }
    a.setXYZ(0, pos.x, pos.y, pos.z);
    a.needsUpdate = true;
  };

  return group;
}

// Взрыв при попадании
function impactExplosion(pos: THREE.Vector3, color: number) {
  const light = new THREE.PointLight(color, 2.5, 12);
  light.position.copy(pos);
  scene.add(light);
  // исчезнет через 500 мс
  setTimeout(() => {
    scene.remove(light);
  }, 500);

  const spriteMat = new THREE.SpriteMaterial({
    map: new THREE.TextureLoader().load(
      "https://threejs.org/examples/textures/sprites/glow.png"
    ),
    color,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  const spr = new THREE.Sprite(spriteMat);
  spr.scale.set(3, 3, 3);
  spr.position.copy(pos);
  scene.add(spr);
  // легкая анимация затухания
  const start = performance.now();
  const tick = () => {
    const t = (performance.now() - start) / 500;
    spr.scale.setScalar(3 + 2 * t);
    spriteMat.opacity = Math.max(0, 0.9 - t);
    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      scene.remove(spr);
    }
  };
  tick();
}

// ====== ПОМОЩНИКИ ПО ДВИЖЕНИЮ ======
function moveTo(
  obj: THREE.Object3D,
  to: THREE.Vector3,
  duration = 1500,
  onDone?: () => void
) {
  const from = obj.position.clone();
  const start = performance.now();
  const animate = () => {
    const t = Math.min(1, (performance.now() - start) / duration);
    obj.position.lerpVectors(from, to, t);
    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      onDone && onDone();
    }
  };
  animate();
}
function lookAtSmooth(
  obj: THREE.Object3D,
  target: THREE.Vector3,
  duration = 400
) {
  const start = performance.now();
  const from = new THREE.Quaternion().copy(obj.quaternion);
  const to = new THREE.Quaternion();
  const dummy = new THREE.Object3D();
  dummy.position.copy(obj.position);
  dummy.lookAt(target);
  to.copy(dummy.quaternion);
  const tick = () => {
    const t = Math.min(1, (performance.now() - start) / duration);
    THREE.Quaternion.slerp(from, to, obj.quaternion, t);
    if (t < 1) {
      requestAnimationFrame(tick);
    }
  };
  tick();
}

// ==== ОСНОВНАЯ РЕЖИССУРА ====
let currentVictimIdx = 0;
let currentHitIdx = 0;

let victimChar: Char | null = null;
let attackerChar: Char | null = null;
let projectile: THREE.Group | null = null;

let running = false;

function polarAround(center: THREE.Vector3, radius: number, angle: number) {
  return new THREE.Vector3(
    center.x + Math.cos(angle) * radius,
    center.y,
    center.z + Math.sin(angle) * radius
  );
}

// Главная последовательность: жертва → цикл атакующих → следующая жертва
async function showNextVictim() {
  if (currentVictimIdx >= victimAbilitiesGroupedByTarget.value.length) {
    running = false;
    return;
  }
  const data = victimAbilitiesGroupedByTarget.value[currentVictimIdx];

  // создаем и заводим жертву: выходит из глубины к центру
  victimChar && scene.remove(victimChar.root);
  victimChar = await loadHuman(0xff5c5c);
  victimChar.name = data.to;
  const center = new THREE.Vector3(0, 0, 0);
  victimChar.root.position.copy(new THREE.Vector3(0, 0, 18));
  victimChar.root.rotation.y = Math.PI; // чуть лицом к камере
  scene.add(victimChar.root);
  victimChar.label = makeLabel(
    data.to,
    victimChar.root,
    "label victim-label",
    2.8
  );

  fadeTo(undefined, victimChar.actions.Idle, 0.2);
  // Walk-подход
  fadeTo(victimChar.actions.Idle, victimChar.actions.Walk, 0.3);
  moveTo(victimChar.root, center, 1800, () => {
    fadeTo(victimChar!.actions.Walk, victimChar!.actions.Idle, 0.3);
  });

  currentHitIdx = 0;
  setTimeout(showNextAttacker, 2200); // пауза после выхода
}

async function showNextAttacker() {
  const group = victimAbilitiesGroupedByTarget.value[currentVictimIdx];
  const hit = group.hits[currentHitIdx];
  if (!hit) {
    // Все атаковали — жертва уходит, следующая
    if (victimChar) {
      fadeTo(victimChar.actions.Idle, victimChar.actions.Walk, 0.2);
      moveTo(victimChar.root, new THREE.Vector3(0, 0, -18), 1600, () => {
        scene.remove(victimChar!.root);
        victimChar = null;
        currentVictimIdx++;
        setTimeout(showNextVictim, 900);
      });
    } else {
      currentVictimIdx++;
      setTimeout(showNextVictim, 600);
    }
    return;
  }

  // Спавним атакующего по кругу (не прижат слева)
  attackerChar && scene.remove(attackerChar.root);
  attackerChar = await loadHuman(0x6fb6ff);
  attackerChar.name = hit.from;
  const center = new THREE.Vector3(0, 0, 0);
  const angle = Math.random() * Math.PI * 2;
  const spawn = polarAround(center, 16, angle); // выходит из-за круга
  const stand = polarAround(center, 9.5, angle); // позиция броска
  attackerChar.root.position.copy(spawn);
  scene.add(attackerChar.root);
  attackerChar.label = makeLabel(
    hit.from,
    attackerChar.root,
    "label attacker-label",
    2.8
  );
  placeAttackerLabel(attackerChar.label!, stand);

  lookAtSmooth(attackerChar.root, center, 350);
  fadeTo(undefined, attackerChar.actions.Walk, 0.25);
  moveTo(attackerChar.root, stand, 1200, () => {
    fadeTo(attackerChar!.actions.Walk, attackerChar!.actions.Idle, 0.2);
    lookAtSmooth(attackerChar!.root, center, 250);
    setTimeout(() => castSpell(attackerChar!, victimChar!, hit), 500);
  });
}

function labelSpell(name: string, mid: THREE.Vector3) {
  const div = document.createElement("div");
  div.className = "spell-name";
  div.textContent = name;
  const label = new CSS2DObject(div);
  label.position.copy(mid.clone().add(new THREE.Vector3(0, 3.2, 0)));
  scene.add(label);
  setTimeout(() => scene.remove(label), 2000);
}

function castSpell(attacker: Char, victim: Char, hit: IVictimAbilities) {
  // Псевдо-каст: короткий клип + поднимем правую руку (bone)
  fadeTo(attacker.actions.Idle, attacker.actions.Cast, 0.1);

  // В момент середины каста — запускаем снаряд
  setTimeout(() => {
    const start = attacker.root.position
      .clone()
      .add(new THREE.Vector3(0.2, 1.6, 0)); // от руки
    const end = victim.root.position.clone().add(new THREE.Vector3(0, 1.4, 0));

    // подпись заклинания
    labelSpell(
      abilityNames[hit.abilityId] || "Spell",
      start.clone().lerp(end, 0.5)
    );

    // фаербол
    const color = abilityColors[hit.abilityId] ?? 0xff6a00;
    projectile = makeFireball(color);
    projectile.position.copy(start);
    scene.add(projectile);

    const missOffset = new THREE.Vector3(0, 2.2, 0); // траектория мимо
    const P0 = start;
    const P1 = start
      .clone()
      .lerp(end, 0.5)
      .add(new THREE.Vector3(0, 1.2, 0)); // дуга
    const P2 = hit.success ? end : end.clone().add(missOffset);

    const duration = 2200; // медленнее
    const t0 = performance.now();

    const tick = () => {
      const t = Math.min(1, (performance.now() - t0) / duration);
      // квадратичная Безье
      const a = P0.clone().lerp(P1, t);
      const b = P1.clone().lerp(P2, t);
      const pos = a.clone().lerp(b, t);
      projectile!.position.copy(pos);
      (projectile as any)._updateTail(pos);
      // Легкая пульсация glow
      projectile!.children[1].scale.setScalar(
        1 + 0.15 * Math.sin(t * Math.PI * 6)
      );

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        // Конец полёта
        if (hit.success) {
          impactExplosion(P2, color);
          // Жертва — хит‑реакция (потрясти)
          fadeTo(victim.actions.Idle, victim.actions.Hit, 0.05);
          shake(victim.root, 380);
        } else {
          // MISS подпись
          missLabel(P2);
        }
        scene.remove(projectile!);
        projectile = null;

        // Немного паузы — и уводим атакующего
        setTimeout(() => {
          fadeTo(attacker.actions.Idle, attacker.actions.Walk, 0.2);
          const away = attacker.root.position
            .clone()
            .setLength(18)
            .multiplyScalar(1); // уйти за круг
          moveTo(attacker.root, away, 1200, () => {
            scene.remove(attacker.root);
            attackerChar = null;
            currentHitIdx++;
            setTimeout(showNextAttacker, 600);
          });
        }, 600);
      }
    };
    tick();
  }, 350);
}

function missLabel(pos: THREE.Vector3) {
  const div = document.createElement("div");
  div.className = "miss-label";
  div.textContent = "MISS";
  const lbl = new CSS2DObject(div);
  lbl.position.copy(pos.clone().add(new THREE.Vector3(0, 2.6, 0)));
  scene.add(lbl);
  setTimeout(() => scene.remove(lbl), 1000);
}

function shake(obj: THREE.Object3D, ms = 300) {
  const base = obj.position.clone();
  const t0 = performance.now();
  const tick = () => {
    const t = (performance.now() - t0) / ms;
    if (t >= 1) {
      obj.position.copy(base);
      return;
    }
    const amp = 0.06 * (1 - t);
    obj.position.set(
      base.x + (Math.random() - 0.5) * amp,
      base.y + (Math.random() - 0.5) * amp,
      base.z + (Math.random() - 0.5) * amp
    );
    raf = requestAnimationFrame(tick);
  };
  tick();
}

// ==== ИНИЦИАЛИЗАЦИЯ СЦЕНЫ ====
onMounted(() => {
  const canvas = canvasRef.value!;
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#05060a");

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.set(0, 4.2, 16);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelContainerRef.value!.appendChild(labelRenderer.domElement);
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.top = "0";
  labelRenderer.domElement.style.left = "0";
  labelRenderer.domElement.style.pointerEvents = "none";

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.maxPolarAngle = Math.PI / 2.05;
  controls.minDistance = 10;
  controls.maxDistance = 26;

  // Свет и "арена"
  const hemi = new THREE.HemisphereLight(0xffffff, 0x2b2b2b, 0.7);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 1.0);
  dir.position.set(6, 12, 10);
  dir.castShadow = true;
  scene.add(dir);

  const floorGeo = new THREE.CircleGeometry(14, 64);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x0b0e15,
    metalness: 0.1,
    roughness: 0.9,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // адаптив
  window.addEventListener("resize", onResize);

  // старт
  running = true;
  showNextVictim();
  animate();
});

onBeforeUnmount(() => {
  running = false;
  cancelAnimationFrame(raf);
  window.removeEventListener("resize", onResize);
});

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  raf = requestAnimationFrame(animate);
  const dt = clock.getDelta();

  // апдейтим миксеры персонажей, если есть
  if (victimChar) {
    victimChar.mixer.update(dt);
  }
  if (attackerChar) {
    attackerChar.mixer.update(dt);
  }

  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
</script>

<template>
  <div class="spell-page">
    <canvas ref="canvasRef" class="spell-canvas"></canvas>
    <div ref="labelContainerRef" class="label-container"></div>
  </div>
</template>

<style scoped>
/* Фуллскрин адаптив */
.spell-page {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(
    1200px 600px at 50% 100%,
    #0a0d14 0%,
    #05060a 60%,
    #000 100%
  );
}
.spell-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

/* Лейблы — разнесены и читаемы */
.label-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.label {
  padding: 4px 8px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.3px;
  white-space: nowrap;
  text-shadow:
    0 2px 8px rgb(0 0 0 / 80%),
    0 0 14px rgb(0 0 0 / 60%);
  user-select: none;
  background: rgb(0 0 0 / 25%);
  border-radius: 6px;
  backdrop-filter: blur(2px);
  transform: translate(-50%, -120%);
}
.victim-label {
  color: #ff6b6b;
}
.attacker-label {
  color: #6fb6ff;
}

.spell-name {
  padding: 4px 10px;
  font-size: 1.1rem;
  font-weight: 800;
  color: #ffd857;
  text-shadow:
    0 2px 10px rgb(0 0 0 / 90%),
    0 0 14px rgb(255 216 87 / 35%);
  background: rgb(33 26 4 / 35%);
  border-radius: 999px;
  backdrop-filter: blur(3px);
  transform: translate(-50%, -120%);
}

.miss-label {
  padding: 2px 8px;
  font-size: 1.3rem;
  font-weight: 800;
  color: #bfc7d5;
  text-shadow:
    0 2px 10px rgb(0 0 0 / 90%),
    0 0 14px rgb(191 199 213 / 35%);
  background: rgb(0 0 0 / 25%);
  border-radius: 999px;
  transform: translate(-50%, -140%);
}

/* Мобилам чуть крупнее подписи */
@media (width <= 480px) {
  .label {
    font-size: 0.9rem;
  }
  .spell-name {
    font-size: 1rem;
  }
  .miss-label {
    font-size: 1.1rem;
  }
}
</style>
