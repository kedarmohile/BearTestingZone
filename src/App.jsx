import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, OrbitControls, Stars, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useEffect, useReducer, useRef } from 'react';
import HoneywoodPhaserGame from './game/HoneywoodPhaserGame';

const games = [
  {
    id: 'honeywood',
    title: 'Honeywood Saga',
    status: 'Play now',
    text: 'An isometric fantasy RPG town where the Mohile Family Bears quest, cast mythic powers, and defend Honeywood.',
  },
  {
    id: 'berry',
    title: 'Berry Bounce',
    status: 'In progress',
    text: 'A timing and combo challenge starring Papa Bear and the famous rolling berry barrels.',
  },
  {
    id: 'builder',
    title: 'Forest Builder',
    status: 'In progress',
    text: 'Mumma Bear designs cabins, bridges, gardens, and the family picnic square.',
  },
];

const zoneTemplates = [
  {
    id: 'grove',
    name: 'Honey Grove',
    owner: 'Bruno Bear',
    resource: 'honey',
    resourceLabel: 'Honey',
    color: '#f59e0b',
    position: [-4.1, 0, 1.6],
    unlockCost: 0,
    baseRate: 2,
    upgradeCost: 65,
    workerCost: 90,
    story: 'Bruno gathers Brave Honey to power the whole rescue.',
  },
  {
    id: 'orchard',
    name: 'Berry Orchard',
    owner: 'Memi Bear',
    resource: 'berries',
    resourceLabel: 'Berries',
    color: '#ef4444',
    position: [-1.45, 0, -1.25],
    unlockCost: 120,
    baseRate: 2,
    upgradeCost: 95,
    workerCost: 120,
    story: 'Memi keeps the berry baskets full for hungry forest friends.',
  },
  {
    id: 'river',
    name: 'River Dock',
    owner: 'Papa Bear',
    resource: 'fish',
    resourceLabel: 'Fish',
    color: '#38bdf8',
    position: [1.5, 0, 1.2],
    unlockCost: 260,
    baseRate: 1,
    upgradeCost: 145,
    workerCost: 170,
    story: 'Papa opens the river route so supplies can cross fast.',
  },
  {
    id: 'kitchen',
    name: 'Picnic Kitchen',
    owner: 'Mumma Bear',
    resource: 'pies',
    resourceLabel: 'Pies',
    color: '#fb7185',
    position: [4.1, 0, -1.05],
    unlockCost: 520,
    baseRate: 1,
    upgradeCost: 230,
    workerCost: 250,
    story: 'Mumma turns forest food into legendary festival treats.',
  },
];

const orderTemplates = [
  {
    id: 'scout-snack',
    name: 'Scout Snack Packs',
    wants: { honey: 10, berries: 8 },
    coins: 90,
    festival: 6,
    courage: 4,
  },
  {
    id: 'river-lunch',
    name: 'River Crew Lunch',
    wants: { honey: 16, fish: 6 },
    coins: 150,
    festival: 9,
    courage: 6,
  },
  {
    id: 'family-feast',
    name: 'Family Feast Table',
    wants: { berries: 18, fish: 8, pies: 5 },
    coins: 260,
    festival: 15,
    courage: 10,
  },
];

const mythicPowers = [
  {
    id: 'storm-paw',
    bear: 'Bruno Bear',
    name: 'Storm Paw',
    cost: 12,
    color: '#38bdf8',
    effect: 'Thunder knocks Ranger Magnus back with a bright cartoon boom.',
  },
  {
    id: 'sun-honey',
    bear: 'Memi Bear',
    name: 'Sun Honey Burst',
    cost: 10,
    color: '#facc15',
    effect: 'Golden honey light clears dark vines from the picnic trail.',
  },
  {
    id: 'root-guard',
    bear: 'Mumma Bear',
    name: 'Root Guardian',
    cost: 14,
    color: '#22c55e',
    effect: 'Ancient forest roots trap the villains safely until they run away.',
  },
  {
    id: 'forge-roar',
    bear: 'Papa Bear',
    name: 'Forge Roar',
    cost: 16,
    color: '#fb7185',
    effect: 'A heroic roar powers every workshop and cracks Magnus shields.',
  },
];

const initialState = {
  screen: 'home',
  coins: 120,
  resources: { honey: 0, berries: 0, fish: 0, pies: 0 },
  zones: zoneTemplates.map((zone, index) => ({
    ...zone,
    unlocked: index === 0,
    level: 1,
    workers: index === 0 ? 1 : 0,
    stored: 0,
  })),
  activeOrder: 0,
  festival: 0,
  courage: 8,
  magnus: 12,
  chapter: 1,
  boostUntil: 0,
  powersUsed: 0,
  drone: { wave: 1, charge: 60, integrity: 100, cleared: 0, combo: 0 },
  log: 'Honeywood opens at sunrise. Bruno is ready to build.',
};

function canAffordResources(resources, wants) {
  return Object.entries(wants).every(([key, value]) => resources[key] >= value);
}

function productionFor(zone, boostUntil) {
  if (!zone.unlocked) return 0;
  const boost = Date.now() < boostUntil ? 2 : 1;
  return zone.baseRate * zone.level * Math.max(1, zone.workers) * boost;
}

function reducer(state, action) {
  if (action.type === 'screen') {
    return { ...state, screen: action.screen };
  }

  if (action.type === 'tick') {
    const resources = { ...state.resources };
    let coins = state.coins;
    for (const zone of state.zones) {
      const produced = productionFor(zone, state.boostUntil);
      resources[zone.resource] += produced;
      coins += Math.floor(produced * zone.level * 0.5);
    }

    const magnus = Math.min(100, state.magnus + 0.45);
    const chapter = state.festival >= 80 ? 4 : state.festival >= 45 ? 3 : state.festival >= 18 ? 2 : 1;
    return { ...state, coins, resources, magnus, chapter };
  }

  if (action.type === 'tap-zone') {
    const zone = state.zones.find((item) => item.id === action.id);
    if (!zone || !zone.unlocked) return state;
    return {
      ...state,
      resources: {
        ...state.resources,
        [zone.resource]: state.resources[zone.resource] + 6 + zone.level * 2,
      },
      courage: state.courage + 1,
      log: `${zone.owner} leads a fast harvest rush at ${zone.name}.`,
    };
  }

  if (action.type === 'unlock') {
    const zone = state.zones.find((item) => item.id === action.id);
    if (!zone || zone.unlocked || state.coins < zone.unlockCost) return state;
    return {
      ...state,
      coins: state.coins - zone.unlockCost,
      zones: state.zones.map((item) =>
        item.id === action.id ? { ...item, unlocked: true, workers: 1 } : item
      ),
      log: `${zone.name} unlocked. ${zone.story}`,
    };
  }

  if (action.type === 'upgrade') {
    const zone = state.zones.find((item) => item.id === action.id);
    const cost = zone ? zone.upgradeCost * zone.level : Infinity;
    if (!zone || !zone.unlocked || state.coins < cost) return state;
    return {
      ...state,
      coins: state.coins - cost,
      zones: state.zones.map((item) =>
        item.id === action.id ? { ...item, level: item.level + 1 } : item
      ),
      log: `${zone.name} upgraded. Production is getting serious.`,
    };
  }

  if (action.type === 'hire') {
    const zone = state.zones.find((item) => item.id === action.id);
    const cost = zone ? zone.workerCost * (zone.workers + 1) : Infinity;
    if (!zone || !zone.unlocked || state.coins < cost) return state;
    return {
      ...state,
      coins: state.coins - cost,
      zones: state.zones.map((item) =>
        item.id === action.id ? { ...item, workers: item.workers + 1 } : item
      ),
      log: `A new helper joins ${zone.owner} at ${zone.name}.`,
    };
  }

  if (action.type === 'boost') {
    if (state.courage < 5) return { ...state, log: 'Need more courage honey before another family boost.' };
    return {
      ...state,
      courage: state.courage - 5,
      boostUntil: Date.now() + 15000,
      log: 'Family Rally activated. Every zone produces double for 15 seconds.',
    };
  }

  if (action.type === 'power') {
    const power = mythicPowers.find((item) => item.id === action.id);
    if (!power) return state;
    if (state.courage < power.cost) {
      return { ...state, log: `${power.name} needs ${power.cost} courage.` };
    }

    return {
      ...state,
      courage: state.courage - power.cost,
      powersUsed: state.powersUsed + 1,
      magnus: Math.max(0, state.magnus - 18),
      festival: Math.min(100, state.festival + 7),
      coins: state.coins + 45,
      log: `${power.bear} casts ${power.name}. ${power.effect}`,
    };
  }

  if (action.type === 'drone-stage') {
    return {
      ...state,
      screen: 'drone',
      log: 'Honey Drone launched. Clear ranger signal towers from the sky.',
    };
  }

  if (action.type === 'drone-action') {
    const drone = state.drone;
    if (action.move === 'scan') {
      return {
        ...state,
        drone: {
          ...drone,
          charge: Math.min(100, drone.charge + 18),
          combo: drone.combo + 1,
        },
        courage: state.courage + 2,
        log: 'Honey Drone scans the forest and finds a safe path for Cubby.',
      };
    }

    if (action.move === 'shield') {
      if (drone.charge < 12) return { ...state, log: 'Drone shield needs more charge.' };
      return {
        ...state,
        drone: {
          ...drone,
          charge: drone.charge - 12,
          integrity: Math.min(100, drone.integrity + 22),
        },
        log: 'Drone shield blooms like golden honey glass.',
      };
    }

    if (action.move === 'stun') {
      if (drone.charge < 20) return { ...state, log: 'Stun beam needs more drone charge.' };
      const cleared = drone.cleared + 1;
      const nextWave = cleared > 0 && cleared % 4 === 0 ? drone.wave + 1 : drone.wave;
      return {
        ...state,
        coins: state.coins + 75 + drone.combo * 8,
        courage: state.courage + 4,
        festival: Math.min(100, state.festival + 5),
        magnus: Math.max(0, state.magnus - 10),
        drone: {
          wave: nextWave,
          cleared,
          charge: Math.max(0, drone.charge - 20),
          integrity: Math.max(15, drone.integrity - 6),
          combo: drone.combo + 1,
        },
        log: 'Honey Drone fires a kid-safe stun beam. Ranger tower disabled.',
      };
    }
  }

  if (action.type === 'order') {
    const order = orderTemplates[state.activeOrder % orderTemplates.length];
    if (!canAffordResources(state.resources, order.wants)) {
      return { ...state, log: `${order.name} needs more supplies first.` };
    }

    const resources = { ...state.resources };
    for (const [key, value] of Object.entries(order.wants)) {
      resources[key] -= value;
    }

    return {
      ...state,
      resources,
      coins: state.coins + order.coins,
      festival: Math.min(100, state.festival + order.festival),
      courage: state.courage + order.courage,
      activeOrder: state.activeOrder + 1,
      log: `${order.name} delivered. The Great Picnic Festival grows brighter.`,
    };
  }

  if (action.type === 'magnus') {
    if (state.courage < 10) return { ...state, log: 'Magnus is too strong. Build more courage first.' };
    const festivalGain = state.magnus >= 70 ? 10 : 5;
    return {
      ...state,
      courage: state.courage - 10,
      magnus: Math.max(0, state.magnus - 28),
      festival: Math.min(100, state.festival + festivalGain),
      log:
        state.magnus >= 70
          ? 'Huge showdown. Ranger Magnus retreats from the picnic gate.'
          : 'Bruno pushes Ranger Magnus back into the dark woods.',
    };
  }

  return state;
}

function BearMascot() {
  return (
    <div className="bear" aria-label="Mohile Family Bears mascot">
      <div className="face" />
      <div className="eye left" />
      <div className="eye right" />
      <div className="nose" />
      <div className="smile" />
    </div>
  );
}

function Home({ onPlay }) {
  return (
    <main className="app-shell">
      <motion.section className="card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <BearMascot />
        <p className="eyebrow">Mohile Family Bears presents</p>
        <h1>Honeywood Arcade</h1>
        <p className="tagline">
          A family-made bear universe with tycoon strategy, story missions, skill boosts, a big villain, and happy wins.
        </p>
        <div>
          <span className="pill">No Ads</span>
          <span className="pill">Epic Tycoon</span>
          <span className="pill">Family Story</span>
        </div>
        <section className="games" aria-label="Game list">
          {games.map((game) => (
            <button key={game.id} className="game-card" onClick={() => game.id === 'honeywood' && onPlay()}>
              <strong>{game.title}</strong>
              <span>{game.text}</span>
              <em>{game.status}</em>
            </button>
          ))}
        </section>
        <div className="credits">Created by Papa Mohile, Memi Mohile, and Mumma Mohile</div>
        <p className="footer">The Mohile Family Bears are officially on duty.</p>
      </motion.section>
    </main>
  );
}

function StoryPanel({ onStart, onBack }) {
  return (
    <main className="story-shell">
      <motion.section className="story-card" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="story-art">
          <Canvas camera={{ position: [0, 6, 9], fov: 45 }}>
            <SceneLights />
            <Stars radius={50} depth={14} count={1200} factor={3} />
            <HoneywoodBoard preview />
          </Canvas>
        </div>
        <div className="story-copy">
          <span className="brand">Epic idle tycoon</span>
          <h1>Mohile Family Bears: Honeywood Tycoon</h1>
          <p>
            Ranger Magnus has blocked the forest roads and locked Baby Cubby's picnic invitation inside the old
            tower. Bruno, Memi, Mumma, and Papa must rebuild Honeywood, serve forest friends, and light the Great
            Picnic Festival before Magnus takes the basket forever.
          </p>
          <div className="mission-list">
            <strong>Your mission</strong>
            <span>Build honey, berry, river, and kitchen zones.</span>
            <span>Hire bear helpers and upgrade each family station.</span>
            <span>Fulfill orders to fill the festival meter.</span>
            <span>Unlock Ragnarok-style bear powers to defeat Ranger Magnus with no blood or scary gore.</span>
            <span>Launch the Honey Drone stage to clear ranger signal towers from the sky.</span>
            <span>Win by restoring the Great Picnic Festival.</span>
          </div>
          <div className="actions">
            <button className="primary" onClick={onStart}>Start Honeywood</button>
            <button className="secondary" onClick={onBack}>Back</button>
          </div>
          <div className="credits">Created by Papa Mohile, Memi Mohile, and Mumma Mohile</div>
        </div>
      </motion.section>
    </main>
  );
}

function TycoonGame({ state, dispatch }) {
  return <HoneywoodPhaserGame onHome={() => dispatch({ type: 'screen', screen: 'home' })} />;
}

function DroneStage({ state, dispatch }) {
  return (
    <main className="drone-shell">
      <section className="drone-hud">
        <button className="secondary" onClick={() => dispatch({ type: 'screen', screen: 'game' })}>Back to Tycoon</button>
        <div>
          <span className="tiny-label">Sky mission wave {state.drone.wave}</span>
          <strong>Honey Drone: Ranger Signal Raid</strong>
        </div>
        <div className="resources">
          <span>Charge {state.drone.charge}</span>
          <span>Integrity {state.drone.integrity}</span>
          <span>Towers {state.drone.cleared}</span>
        </div>
      </section>
      <section className="drone-arena">
        <Canvas camera={{ position: [0, 6.2, 10], fov: 48 }}>
          <SceneLights />
          <Stars radius={60} depth={18} count={1300} factor={3} />
          <DroneScene drone={state.drone} />
        </Canvas>
        <div className="drone-brief">
          <strong>{state.log}</strong>
          <span>Arcade goal: scan for charge, shield when damaged, then stun ranger signal towers.</span>
        </div>
      </section>
      <section className="drone-controls">
        <button className="primary" onClick={() => dispatch({ type: 'drone-action', move: 'scan' })}>Scan Forest</button>
        <button className="sky" onClick={() => dispatch({ type: 'drone-action', move: 'stun' })}>Stun Tower</button>
        <button className="secondary" onClick={() => dispatch({ type: 'drone-action', move: 'shield' })}>Honey Shield</button>
      </section>
    </main>
  );
}

function ResourceBar({ state }) {
  return (
    <div className="resources">
      <span>Coins {Math.floor(state.coins)}</span>
      <span>Honey {Math.floor(state.resources.honey)}</span>
      <span>Berries {Math.floor(state.resources.berries)}</span>
      <span>Fish {Math.floor(state.resources.fish)}</span>
      <span>Pies {Math.floor(state.resources.pies)}</span>
    </div>
  );
}

function ZoneCard({ zone, state, dispatch }) {
  const upgradeCost = zone.upgradeCost * zone.level;
  const hireCost = zone.workerCost * (zone.workers + 1);

  return (
    <article className={`zone-card ${zone.unlocked ? '' : 'locked'}`}>
      <div className="zone-title">
        <span style={{ background: zone.color }} />
        <div>
          <strong>{zone.name}</strong>
          <small>{zone.owner}</small>
        </div>
      </div>
      <p>{zone.story}</p>
      {zone.unlocked ? (
        <>
          <div className="zone-stats">
            <span>Level {zone.level}</span>
            <span>Workers {zone.workers}</span>
            <span>{zone.resourceLabel}/sec {productionFor(zone, state.boostUntil)}</span>
          </div>
          <div className="zone-actions">
            <button onClick={() => dispatch({ type: 'upgrade', id: zone.id })}>Upgrade {upgradeCost}</button>
            <button onClick={() => dispatch({ type: 'hire', id: zone.id })}>Hire {hireCost}</button>
          </div>
        </>
      ) : (
        <button className="primary wide" onClick={() => dispatch({ type: 'unlock', id: zone.id })}>
          Unlock {zone.unlockCost}
        </button>
      )}
    </article>
  );
}

function Meter({ value, color }) {
  return (
    <div className="meter">
      <span style={{ width: `${Math.min(100, value)}%`, background: color }} />
    </div>
  );
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.72} />
      <directionalLight position={[4, 8, 4]} intensity={1.5} />
      <pointLight position={[-4, 4, 4]} intensity={0.8} color="#fbbf24" />
    </>
  );
}

function HoneywoodBoard({ state, dispatch, preview = false }) {
  const zones = state?.zones ?? zoneTemplates.map((zone, index) => ({ ...zone, unlocked: index < 3, level: 1, workers: 1 }));
  const magnus = state?.magnus ?? 35;
  const festival = state?.festival ?? 42;

  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.05, 0]}>
        <circleGeometry args={[7.2, 64]} />
        <meshStandardMaterial color="#326b42" roughness={0.9} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <ringGeometry args={[2.1, 2.42, 64]} />
        <meshStandardMaterial color="#d9a45a" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.025, 0]}>
        <circleGeometry args={[1.4, 40]} />
        <meshStandardMaterial color={festival >= 100 ? '#facc15' : '#7c3f18'} />
      </mesh>
      <Text position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.25} color="#fff7ed" anchorX="center">
        GREAT PICNIC
      </Text>
      {zones.map((zone) => (
        <ZoneNode key={zone.id} zone={zone} dispatch={dispatch} preview={preview} />
      ))}
      <MagnusTower pressure={magnus} />
      <BearFamily position={[-0.2, 0.1, 2.9]} />
      <FestivalBasket position={[0, 0.2, 0]} festival={festival} />
      {state?.powersUsed > 0 && <PowerStorm count={state.powersUsed} />}
    </>
  );
}

function ZoneNode({ zone, dispatch, preview }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current && zone.unlocked) {
      ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.7 + zone.position[0]) * 0.08;
    }
  });

  return (
    <group position={zone.position} ref={ref}>
      <Float speed={1.4} floatIntensity={zone.unlocked ? 0.16 : 0.02}>
        <mesh
          position={[0, 0.25, 0]}
          onClick={(event) => {
            event.stopPropagation();
            if (!preview && dispatch) dispatch({ type: 'tap-zone', id: zone.id });
          }}
        >
          <cylinderGeometry args={[0.92, 1.08, 0.5, 24]} />
          <meshStandardMaterial color={zone.unlocked ? zone.color : '#64748b'} roughness={0.42} />
        </mesh>
        <mesh position={[0, 0.84, 0]}>
          <boxGeometry args={[1.2, 0.62, 0.82]} />
          <meshStandardMaterial color={zone.unlocked ? '#fff7ed' : '#94a3b8'} />
        </mesh>
        {zone.unlocked && <WorkerRing count={zone.workers} color={zone.color} />}
        <Html position={[0, 1.38, 0]} center distanceFactor={8}>
          <div className="zone-label">
            <strong>{zone.name}</strong>
            <span>{zone.unlocked ? `Lv ${zone.level} - ${zone.owner}` : `Unlock ${zone.unlockCost}`}</span>
          </div>
        </Html>
      </Float>
    </group>
  );
}

function WorkerRing({ count, color }) {
  const group = useRef();
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = clock.elapsedTime * 0.9;
  });

  return (
    <group ref={group}>
      {Array.from({ length: Math.min(6, count) }).map((_, index) => {
        const angle = (index / Math.min(6, count)) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(angle) * 1.15, 0.45, Math.sin(angle) * 1.15]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.18} />
          </mesh>
        );
      })}
    </group>
  );
}

function BearFamily({ position }) {
  return (
    <group position={position}>
      <Bear3D position={[-0.7, 0.25, 0]} color="#9a6a3a" scale={0.9} />
      <Bear3D position={[0, 0.25, 0.15]} color="#b7773c" scale={0.65} />
      <Bear3D position={[0.72, 0.25, 0]} color="#8b5a2b" scale={0.82} />
    </group>
  );
}

function PowerStorm({ count }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 1.4;
      ref.current.position.y = 0.2 + Math.sin(clock.elapsedTime * 2) * 0.08;
    }
  });

  return (
    <group ref={ref} position={[0, 0.25, 0]}>
      {mythicPowers.map((power, index) => {
        const angle = (index / mythicPowers.length) * Math.PI * 2;
        return (
          <mesh key={power.id} position={[Math.cos(angle) * (2.7 + count * 0.08), 1.2, Math.sin(angle) * (2.7 + count * 0.08)]}>
            <octahedronGeometry args={[0.22, 0]} />
            <meshStandardMaterial color={power.color} emissive={power.color} emissiveIntensity={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}

function Bear3D({ position, color, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.38, 24, 24]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.22, 0.82, 0]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.22, 0.82, 0]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.45, 0.28]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#f3d2a2" />
      </mesh>
    </group>
  );
}

function DroneScene({ drone }) {
  const droneRef = useRef();
  const towerRef = useRef();
  useFrame(({ clock }) => {
    if (droneRef.current) {
      droneRef.current.position.x = Math.sin(clock.elapsedTime * 1.9) * 2.7;
      droneRef.current.position.y = 2.7 + Math.sin(clock.elapsedTime * 3.2) * 0.2;
      droneRef.current.rotation.z = Math.sin(clock.elapsedTime * 2.4) * 0.16;
    }
    if (towerRef.current) {
      towerRef.current.rotation.y = clock.elapsedTime * 0.45;
    }
  });

  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.08, 0]}>
        <circleGeometry args={[8, 64]} />
        <meshStandardMaterial color="#12355b" roughness={0.8} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <ringGeometry args={[3.2, 3.55, 64]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.25} />
      </mesh>
      <group ref={droneRef}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.9, 0.22, 0.6]} />
          <meshStandardMaterial color="#facc15" emissive="#f59e0b" emissiveIntensity={0.35} />
        </mesh>
        {[-0.72, 0.72].map((x) =>
          [-0.48, 0.48].map((z) => (
            <group key={`${x}-${z}`} position={[x, 0, z]}>
              <mesh rotation-x={Math.PI / 2}>
                <torusGeometry args={[0.22, 0.025, 10, 28]} />
                <meshStandardMaterial color="#e0f2fe" emissive="#38bdf8" emissiveIntensity={0.5} />
              </mesh>
              <mesh>
                <sphereGeometry args={[0.08, 12, 12]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
            </group>
          ))
        )}
        <Text position={[0, 0.22, 0]} fontSize={0.18} color="#111827" anchorX="center">
          HONEY DRONE
        </Text>
      </group>
      <group ref={towerRef}>
        {Array.from({ length: 5 }).map((_, index) => {
          const angle = (index / 5) * Math.PI * 2 + drone.wave * 0.25;
          const disabled = index < drone.cleared % 5;
          return (
            <group key={index} position={[Math.cos(angle) * 3.4, 0, Math.sin(angle) * 3.4]}>
              <mesh position={[0, 0.7, 0]}>
                <cylinderGeometry args={[0.22, 0.32, 1.4, 8]} />
                <meshStandardMaterial
                  color={disabled ? '#64748b' : '#7f1d1d'}
                  emissive={disabled ? '#0f172a' : '#ef4444'}
                  emissiveIntensity={disabled ? 0.1 : 0.5}
                />
              </mesh>
              <mesh position={[0, 1.55, 0]}>
                <octahedronGeometry args={[0.28, 0]} />
                <meshStandardMaterial color={disabled ? '#94a3b8' : '#f97316'} emissive={disabled ? '#64748b' : '#f97316'} emissiveIntensity={0.8} />
              </mesh>
            </group>
          );
        })}
      </group>
      <Html position={[0, 3.5, -2.6]} center distanceFactor={9}>
        <div className="zone-label">
          <strong>Combo {drone.combo}</strong>
          <span>Wave {drone.wave} sky patrol</span>
        </div>
      </Html>
    </>
  );
}

function FestivalBasket({ position, festival }) {
  return (
    <Float speed={2} floatIntensity={festival >= 100 ? 0.45 : 0.12}>
      <group position={position}>
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[1.25, 0.58, 0.82]} />
          <meshStandardMaterial color="#9b5c26" />
        </mesh>
        <mesh position={[0, 0.74, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.045, 12, 36, Math.PI]} />
          <meshStandardMaterial color="#5f381b" />
        </mesh>
        <mesh position={[-0.32, 0.76, 0.35]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={festival / 160} />
        </mesh>
        <mesh position={[0.18, 0.82, 0.34]}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={festival / 150} />
        </mesh>
      </group>
    </Float>
  );
}

function MagnusTower({ pressure }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.elapsedTime * 1.1) * 0.15;
  });

  return (
    <group ref={ref} position={[4.55, 0, 2.9]}>
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.45, 0.62, 1.9, 6]} />
        <meshStandardMaterial color="#1f2937" emissive="#7f1d1d" emissiveIntensity={pressure / 130} />
      </mesh>
      <mesh position={[0, 2.05, 0]}>
        <coneGeometry args={[0.76, 0.75, 6]} />
        <meshStandardMaterial color="#450a0a" />
      </mesh>
      <Html position={[0, 2.65, 0]} center distanceFactor={9}>
        <div className="villain-label">Magnus {Math.floor(pressure)}%</div>
      </Html>
    </group>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const id = window.setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (state.screen === 'story') {
    return (
      <StoryPanel
        onStart={() => dispatch({ type: 'screen', screen: 'game' })}
        onBack={() => dispatch({ type: 'screen', screen: 'home' })}
      />
    );
  }

  if (state.screen === 'game') {
    return <HoneywoodPhaserGame onHome={() => dispatch({ type: 'screen', screen: 'home' })} />;
  }

  if (state.screen === 'drone') {
    return <DroneStage state={state} dispatch={dispatch} />;
  }

  return <Home onPlay={() => dispatch({ type: 'screen', screen: 'story' })} />;
}
