import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, OrbitControls, Stars, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useEffect, useReducer, useRef } from 'react';

const games = [
  {
    id: 'honeywood',
    title: 'Honeywood Tycoon',
    status: 'Play now',
    text: 'Build the Mohile Family Bears village, fulfill picnic orders, push back Ranger Magnus, and save the Great Festival.',
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
            <span>Use courage honey to defeat Ranger Magnus.</span>
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
  const order = orderTemplates[state.activeOrder % orderTemplates.length];
  const victory = state.festival >= 100;

  return (
    <main className="tycoon-shell">
      <section className="topbar">
        <button className="secondary" onClick={() => dispatch({ type: 'screen', screen: 'home' })}>Home</button>
        <div>
          <span className="tiny-label">Chapter {state.chapter}</span>
          <strong>{victory ? 'Festival Saved' : 'Honeywood Tycoon'}</strong>
        </div>
        <ResourceBar state={state} />
      </section>

      <section className="tycoon-layout">
        <div className="world-panel">
          <Canvas camera={{ position: [0, 7.5, 9.5], fov: 48 }}>
            <SceneLights />
            <Stars radius={60} depth={18} count={900} factor={2.4} />
            <HoneywoodBoard state={state} dispatch={dispatch} />
            <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.25} minDistance={6} maxDistance={12} />
          </Canvas>
          <div className="world-banner">
            <strong>{victory ? 'Big win. Cubby is saved.' : state.log}</strong>
            <span>Click glowing zones in the 3D board for active harvest boosts.</span>
          </div>
        </div>

        <aside className="command-panel">
          <section className="panel-block festival-block">
            <div className="section-heading">
              <span>Great Picnic Festival</span>
              <strong>{state.festival}%</strong>
            </div>
            <Meter value={state.festival} color="#f59e0b" />
            <p>{victory ? 'Honeywood is cheering. The family picnic is saved.' : 'Fill this by completing orders and defeating Magnus.'}</p>
          </section>

          <section className="panel-block order-block">
            <div className="section-heading">
              <span>Current Order</span>
              <strong>{order.name}</strong>
            </div>
            <ul className="needs-list">
              {Object.entries(order.wants).map(([key, value]) => (
                <li key={key}>
                  <span>{key}</span>
                  <strong>{Math.floor(state.resources[key])}/{value}</strong>
                </li>
              ))}
            </ul>
            <button className="primary wide" onClick={() => dispatch({ type: 'order' })}>Deliver Order</button>
          </section>

          <section className="panel-block villain-block">
            <div className="section-heading">
              <span>Ranger Magnus Pressure</span>
              <strong>{Math.floor(state.magnus)}%</strong>
            </div>
            <Meter value={state.magnus} color="#ef4444" />
            <button className="danger wide" onClick={() => dispatch({ type: 'magnus' })}>Spend Courage to Push Back</button>
          </section>

          <section className="panel-block">
            <div className="section-heading">
              <span>Family Power</span>
              <strong>{Math.floor(state.courage)} courage</strong>
            </div>
            <button className="primary wide" onClick={() => dispatch({ type: 'boost' })}>Family Rally Boost</button>
          </section>
        </aside>
      </section>

      <section className="zone-grid">
        {state.zones.map((zone) => (
          <ZoneCard key={zone.id} zone={zone} state={state} dispatch={dispatch} />
        ))}
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
    return <TycoonGame state={state} dispatch={dispatch} />;
  }

  return <Home onPlay={() => dispatch({ type: 'screen', screen: 'story' })} />;
}
