<script setup lang="ts">
import * as THREE from "three";
import { onMounted, ref, nextTick, computed, watch } from "vue";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AnimationMixer, AnimationClip } from "three";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { useGameStore } from "@/modules/game/store";
import {
  ISpellInfo,
  IVictimAbilities,
  IVictimAbilitiesGroupedByTarget,
} from "@/modules/game/types/server-client-response-types";

const emit = defineEmits(["finished"]);

const gameStore = useGameStore();

const victimAbilitiesGroupedByTarget = computed<
  IVictimAbilitiesGroupedByTarget[]
>(() => gameStore.victimAbilitiesGroupedByTarget ?? []);
const spells = computed<ISpellInfo[]>(() => gameStore.spells ?? []);

const canvasRef = ref<HTMLCanvasElement | null>(null);
const labelContainerRef = ref<HTMLDivElement | null>(null);

onMounted(async () => {
  await nextTick();

  const canvas = canvasRef.value!;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 3, 15);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);

  if (labelContainerRef.value) {
    labelContainerRef.value.appendChild(labelRenderer.domElement);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0";
    labelRenderer.domElement.style.pointerEvents = "none";
  } else {
    console.warn("labelContainerRef not found when mounting label renderer");
  }

  const controls = new OrbitControls(camera, renderer.domElement);

  window.addEventListener("resize", () => {
    try {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      labelRenderer.setSize(window.innerWidth, window.innerHeight);
    } catch (err) {
      console.error("Error on resize:", err);
    }
  });

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  const loader = new GLTFLoader();

  async function loadCharacter(url: string, scale = 2) {
    try {
      const gltf = await loader.loadAsync(url);
      const model = gltf.scene;
      model.scale.set(scale, scale, scale);
      scene.add(model);
      const mixer = new AnimationMixer(model);
      return {
        model,
        mixer,
        clips: gltf.animations as AnimationClip[],
        label: null as CSS2DObject | null,
      };
    } catch (err) {
      console.error("Failed to load character", err);
      throw err;
    }
  }

  function safePlayAnimation(
    mixer: AnimationMixer,
    clips: AnimationClip[],
    names: string[] | string
  ) {
    const arr = Array.isArray(names) ? names : [names];
    for (const n of arr) {
      const clip = AnimationClip.findByName(clips, n);
      if (clip) {
        mixer.stopAllAction();
        const action = mixer.clipAction(clip);
        action.reset();
        action.play();
        return true;
      }
    }
    return false;
  }

  function createSpellProjectile() {
    const group = new THREE.Group();

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x88ccff })
    );
    group.add(core);

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.4,
      })
    );
    group.add(glow);

    const particles = new THREE.Points(
      new THREE.BufferGeometry().setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
          new Array(100).fill(0).map(() => (Math.random() - 0.5) * 2),
          3
        )
      ),
      new THREE.PointsMaterial({
        color: 0x88ccff,
        size: 0.1,
        transparent: true,
        opacity: 0.7,
      })
    );
    group.add(particles);

    return group;
  }

  function makeLabel(
    text: string,
    target: THREE.Object3D,
    className = "label",
    y = 3
  ) {
    const div = document.createElement("div");
    div.className = className;
    div.textContent = text;
    const label = new CSS2DObject(div);
    label.position.set(0, y, 0);
    target.add(label);
    return label;
  }

  type LoadedCharacter = {
    model: THREE.Object3D;
    mixer: AnimationMixer;
    clips: AnimationClip[];
    label: CSS2DObject | null;
  } | null;

  let victim: LoadedCharacter = null;
  let attacker: LoadedCharacter = null;
  let projectile: THREE.Group | null = null;
  let mixers: AnimationMixer[] = [];
  let clock = new THREE.Clock();

  let victimIndex = 0;
  let attackerIndex = 0;
  let fireProgress = 0;
  let state: "idle" | "projectile" | "impact" = "idle";

  const projectileSpeed = 0.6;
  const walkDuration = 1.2;
  const leaveDuration = 1.2;
  const attackCastDelay = 1.0;
  const betweenAttackersDelay = 1.4;

  const activeProjectiles = new Set<THREE.Group>();

  watch(spells, () => {
    try {
      for (const proj of activeProjectiles) {
        const abilityId = (proj as any).__abilityId as number | undefined;
        const labelObj = (proj as any).__labelRef as CSS2DObject | undefined;
        if (abilityId != null && labelObj) {
          const info = spells.value.find((s) => s.id === abilityId);
          if (info) {
            const el = (labelObj as any).element ?? (labelObj as any).element;
            if (el) {
              el.textContent = info.title;
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to update projectile labels on spells change", err);
    }
  });

  function removeProjectileFromActive(proj: THREE.Group | null) {
    if (!proj) {
      return;
    }
    activeProjectiles.delete(proj);
  }

  function addProjectileToActive(proj: THREE.Group) {
    activeProjectiles.add(proj);
  }

  function removeCharacter(char: LoadedCharacter) {
    if (!char) {
      return;
    }
    try {
      if (char.model.parent) {
        scene.remove(char.model);
      }
    } catch (err) {
      console.error("Failed to remove model from scene", err);
    }
    const idx = mixers.indexOf(char.mixer);
    if (idx !== -1) {
      mixers.splice(idx, 1);
    }

    if (char.label) {
      try {
        const el = (char.label as any).element ?? (char.label as any).element;
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      } catch (err) {
        console.error("Failed to remove CSS2DObject element", err);
      }
    }
  }

  async function showNextVictim() {
    attackerIndex = 0;
    fireProgress = 0;
    state = "idle";

    const victims = victimAbilitiesGroupedByTarget.value;
    const victimData = victims[victimIndex];
    if (!victimData) {
      finishAll();
      return;
    }

    removeCharacter(victim);
    try {
      victim = await loadCharacter(
        "https://threejs.org/examples/models/gltf/Soldier.glb"
      );
    } catch (err) {
      console.error("Failed to load victim model, finishing animation", err);
      finishAll();
      return;
    }

    victim.model.position.set(0, 0, 15);
    mixers.push(victim.mixer);
    victim.label = makeLabel(victimData.to, victim.model, "victim-label", 3);

    safePlayAnimation(victim.mixer, victim.clips, ["Walk", "Run", "Idle"]);

    const startZ = 15,
      endZ = 0;
    const start = performance.now();
    function stepIn(now: number) {
      const t = (now - start) / (walkDuration * 1000);
      if (t < 1) {
        if (victim) {
          victim.model.position.z = THREE.MathUtils.lerp(startZ, endZ, t);
        }
        requestAnimationFrame(stepIn);
      } else {
        if (victim) {
          victim.model.position.z = endZ;
        }
        safePlayAnimation(victim!.mixer, victim!.clips, ["Idle"]);
        setTimeout(showNextAttacker, 300);
      }
    }
    requestAnimationFrame(stepIn);
  }

  async function showNextAttacker() {
    const victims = victimAbilitiesGroupedByTarget.value;
    const victimData = victims[victimIndex];
    const hit = victimData?.hits[attackerIndex];
    if (!hit) {
      leaveCharactersAndContinue();
      return;
    }

    removeCharacter(attacker);
    try {
      attacker = await loadCharacter(
        "https://threejs.org/examples/models/gltf/Soldier.glb"
      );
    } catch (err) {
      console.error("Failed to load attacker model, skipping attacker", err);
      attackerIndex++;
      setTimeout(showNextAttacker, 0);
      return;
    }

    attacker.model.position.set(-10, 0, 8);
    mixers.push(attacker.mixer);
    attacker.label = makeLabel(hit.from, attacker.model, "attacker-label", 3);
    safePlayAnimation(attacker.mixer, attacker.clips, ["Walk", "Run", "Idle"]);

    const from = new THREE.Vector3(-10, 0, 8),
      to = new THREE.Vector3(-4, 0, 2);
    const start = performance.now();
    function stepWalk(now: number) {
      const t = (now - start) / (walkDuration * 1000);
      if (t < 1) {
        if (attacker) {
          attacker.model.position.lerpVectors(from, to, t);
        }
        requestAnimationFrame(stepWalk);
      } else {
        if (attacker) {
          attacker.model.position.copy(to);
        }
        safePlayAnimation(attacker!.mixer, attacker!.clips, ["Idle"]);
        setTimeout(() => castSpell(hit), attackCastDelay * 1000);
      }
    }
    requestAnimationFrame(stepWalk);
  }

  function castSpell(hit: IVictimAbilities) {
    if (!attacker) {
      console.warn("castSpell called without attacker");
      return;
    }

    safePlayAnimation(attacker.mixer, attacker.clips, [
      "Cast",
      "MagicCast",
      "Attack",
      "Run",
      "Idle",
    ]);

    const proj = createSpellProjectile();
    proj.position.copy(attacker.model.position);
    scene.add(proj);

    const spellInfo = spells.value.find((s) => s.id === hit.abilityId);
    const initialText = spellInfo?.title ?? `Ability ${hit.abilityId}`;
    const spellDiv = document.createElement("div");
    spellDiv.className = "spell-name";
    spellDiv.textContent = initialText;
    const spellLabel = new CSS2DObject(spellDiv);
    spellLabel.position.set(0, 4, 0);
    proj.add(spellLabel);

    (proj as any).__labelRef = spellLabel;
    (proj as any).__abilityId = hit.abilityId;

    addProjectileToActive(proj);

    projectile = proj;
    fireProgress = 0;
    (projectile as any).willHit = hit.success;
    state = "projectile";
  }

  function leaveCharactersAndContinue() {
    const toRemove: LoadedCharacter[] = [];
    if (attacker) {
      toRemove.push(attacker);
    }
    if (victim) {
      toRemove.push(victim);
    }

    let completed = 0;
    const total = toRemove.length;
    if (total === 0) {
      nextVictimOrFinish();
      return;
    }

    toRemove.forEach((ch) => {
      const startPos = ch!.model.position.clone();
      const endPos = startPos.clone().setZ(startPos.z - 20);
      const start = performance.now();
      function stepLeave(now: number) {
        const t = (now - start) / (leaveDuration * 1000);
        if (t < 1) {
          ch!.model.position.lerpVectors(startPos, endPos, t);
          requestAnimationFrame(stepLeave);
        } else {
          removeCharacter(ch);
          if (ch === attacker) {
            attacker = null;
          }
          if (ch === victim) {
            victim = null;
          }
          completed++;
          if (completed >= total) {
            nextVictimOrFinish();
          }
        }
      }
      requestAnimationFrame(stepLeave);
    });
  }

  function nextVictimOrFinish() {
    attackerIndex = 0;
    victimIndex++;
    if (victimIndex >= (victimAbilitiesGroupedByTarget.value?.length ?? 0)) {
      finishAll();
    } else {
      showNextVictim();
    }
  }

  function finishAll() {
    removeCharacter(attacker);
    removeCharacter(victim);
    attacker = null;
    victim = null;
    emit("finished");
  }

  function cleanupProjectileLabelAndRemove(proj: THREE.Group) {
    try {
      const lab = (proj as any).__labelRef as CSS2DObject | undefined;
      if (lab) {
        const el = (lab as any).element ?? (lab as any).element;
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      }
    } catch (err) {
      console.error("Failed to remove projectile label", err);
    } finally {
      removeProjectileFromActive(proj);
      try {
        if (proj.parent) {
          scene.remove(proj);
        }
      } catch (err) {
        console.error("Failed to remove projectile from scene", err);
      }
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    mixers.forEach((m) => m.update(delta));

    if (state === "projectile" && projectile && victim && attacker) {
      fireProgress += delta * projectileSpeed;
      const target = (projectile as any).willHit
        ? victim.model.position.clone()
        : victim.model.position.clone().add(new THREE.Vector3(3, 0, 0));
      projectile.position.lerpVectors(
        attacker.model.position,
        target,
        Math.min(fireProgress, 1)
      );

      if (fireProgress >= 1) {
        state = "impact";

        if (projectile) {
          cleanupProjectileLabelAndRemove(projectile);
        }

        if ((projectile as any).willHit) {
          safePlayAnimation(victim!.mixer, victim!.clips, [
            "HitReaction",
            "Hit",
            "Idle",
          ]);
          const light = new THREE.PointLight(0x88ccff, 3, 10);
          light.position.copy(victim!.model.position);
          scene.add(light);
          setTimeout(() => {
            try {
              scene.remove(light);
            } catch (err) {
              console.error("Failed to remove hit light", err);
            }
          }, 600);
        } else {
          // MISS над жертвой, значительно выше, красный и большой
          const missDiv = document.createElement("div");
          missDiv.className = "miss-label";
          missDiv.textContent = "MISS";
          const missLabel = new CSS2DObject(missDiv);
          missLabel.position
            .copy(victim!.model.position)
            .add(new THREE.Vector3(0, 8, 0));
          scene.add(missLabel);
          setTimeout(() => {
            try {
              const el =
                (missLabel as any).element ?? (missLabel as any).element;
              if (el && el.parentNode) {
                el.parentNode.removeChild(el);
              }
              if (missLabel.parent) {
                scene.remove(missLabel);
              }
            } catch (err) {
              console.error("Failed to cleanup miss label", err);
            }
          }, 1400);
        }

        projectile = null;

        removeCharacter(attacker);
        attacker = null;

        setTimeout(() => {
          attackerIndex++;
          showNextAttacker();
        }, betweenAttackersDelay * 1000);
      }
    }

    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }

  showNextVictim();
  animate();
});
</script>

<template>
  <div class="spell-page">
    <canvas ref="canvasRef" class="spell-canvas"></canvas>
    <div ref="labelContainerRef" class="label-container"></div>
  </div>
</template>

<style scoped>
.spell-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.spell-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.label-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.label {
  font-size: 1.2rem;
  font-weight: bold;
  text-shadow: 0 0 6px black;
  pointer-events: none;
}

.victim-label {
  position: relative;
  z-index: 1;
  color: #f44;
}

.attacker-label {
  position: relative;
  z-index: 1;
  color: #4af;
}

/* ability title (was spell-name) — ярче */
.spell-name {
  position: relative;
  z-index: 2;
  font-size: 1.45rem;
  font-weight: 800;
  color: #e6fbff;
  text-shadow:
    0 0 20px #9fe6ff,
    0 0 6px rgb(255 255 255 / 40%);
  pointer-events: none;
}

/* MISS — больше, красный, выше и с большим z-index */
.miss-label {
  position: relative;
  z-index: 9999;
  font-size: 3rem;
  font-weight: 900;
  color: #ff2e2e;
  text-shadow:
    0 0 18px rgb(255 46 46 / 80%),
    0 0 6px black;
  pointer-events: none;
  transform: translateY(-10px);
}
</style>
