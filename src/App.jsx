import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';

const games = [
  {
    id: 'picnic',
    title: 'Picnic Basket Rescue',
    status: 'Play now',
    text: 'A 3D story adventure where Bruno races, swims, dodges rangers, defeats Magnus, and saves Cubby.',
  },
  {
    id: 'berry',
    title: 'Berry Bounce',
    status: 'Coming soon',
    text: 'A fast skill-jump challenge with Papa Bear, berry combos, swinging logs, and forest timing puzzles.',
  },
  {
    id: 'builder',
    title: 'Forest Builder',
    status: 'Coming soon',
    text: 'A cozy role-play builder where Mumma Bear creates the Mohile Family Bears village.',
  },
];

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
        <h1>Mohile Family Bears Arcade</h1>
        <p className="tagline">
          A family-made game world with brave bears, big adventures, skill challenges, story missions, and happy wins.
        </p>
        <div>
          <span className="pill">3D Adventure</span>
          <span className="pill">Family Arcade</span>
          <span className="pill">Bear Approved</span>
        </div>
        <section className="games" aria-label="Game list">
          {games.map((game) => (
            <button key={game.id} className="game-card" onClick={() => game.id === 'picnic' && onPlay('story')}>
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

function Story({ onStart, onBack }) {
  return (
    <main className="story-shell">
      <motion.section className="story-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="story-art">
          <Canvas camera={{ position: [0, 4, 8], fov: 48 }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[4, 8, 4]} intensity={1.5} />
            <Stars radius={40} depth={12} count={800} factor={3} />
            <ForestSet />
            <Bear3D position={[-2.2, 0.55, 0]} />
            <Cubby3D position={[2.15, 0.42, -0.6]} />
            <Villain3D position={[0, 0.9, -2.2]} />
            <PicnicBasket position={[2.8, 0.25, 0.8]} />
          </Canvas>
        </div>
        <div className="story-copy">
          <span className="brand">Story Mission</span>
          <h1>Picnic Basket Rescue</h1>
          <p>
            Dark Ranger Magnus has sealed the Royal Picnic Basket and trapped Baby Cubby near the river gate.
            Bruno Bear must race through the forest, swim across rushing water, collect courage honey, and beat
            Magnus in a final showdown.
          </p>
          <div className="mission-list">
            <strong>Mission path:</strong>
            <span>Run the forest trail</span>
            <span>Swim the river crossing</span>
            <span>Dodge ranger patrols</span>
            <span>Defeat Magnus</span>
            <span>Save Cubby and win the family celebration</span>
          </div>
          <div className="actions">
            <button className="primary" onClick={onStart}>Start 3D Adventure</button>
            <button className="secondary" onClick={onBack}>Back</button>
          </div>
          <div className="credits">Created by Papa Mohile, Memi Mohile, and Mumma Mohile</div>
        </div>
      </motion.section>
    </main>
  );
}

function ForestSet() {
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#5b8f4d" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0.8]}>
        <planeGeometry args={[18, 2.2]} />
        <meshStandardMaterial color="#3ba7d9" roughness={0.2} />
      </mesh>
      {[-7, -5, -3, 4, 6, 7].map((x, i) => (
        <group key={i} position={[x, 0, -3 + (i % 2) * 5]}>
          <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[0.18, 0.25, 1.2, 10]} /><meshStandardMaterial color="#7c4a25" /></mesh>
          <mesh position={[0, 1.45, 0]}><coneGeometry args={[0.75, 1.4, 12]} /><meshStandardMaterial color="#1f6b3a" /></mesh>
        </group>
      ))}
    </>
  );
}

function Bear3D({ position }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 4) * 0.05;
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.55, 0]}><sphereGeometry args={[0.48, 32, 32]} /><meshStandardMaterial color="#9a6a3a" /></mesh>
      <mesh position={[-0.28, 0.92, 0]}><sphereGeometry args={[0.18, 20, 20]} /><meshStandardMaterial color="#9a6a3a" /></mesh>
      <mesh position={[0.28, 0.92, 0]}><sphereGeometry args={[0.18, 20, 20]} /><meshStandardMaterial color="#9a6a3a" /></mesh>
      <mesh position={[0, 0.46, 0.38]}><sphereGeometry args={[0.22, 20, 20]} /><meshStandardMaterial color="#f3d2a2" /></mesh>
      <mesh position={[0, 0.22, 0]}><sphereGeometry args={[0.36, 24, 24]} /><meshStandardMaterial color="#9a6a3a" /></mesh>
    </group>
  );
}

function Cubby3D({ position }) {
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
      <group position={position}>
        <mesh position={[0, 0.42, 0]}><sphereGeometry args={[0.32, 28, 28]} /><meshStandardMaterial color="#b7773c" /></mesh>
        <mesh position={[-0.18, 0.65, 0]}><sphereGeometry args={[0.12, 16, 16]} /><meshStandardMaterial color="#b7773c" /></mesh>
        <mesh position={[0.18, 0.65, 0]}><sphereGeometry args={[0.12, 16, 16]} /><meshStandardMaterial color="#b7773c" /></mesh>
      </group>
    </Float>
  );
}

function Villain3D({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.75, 0]}><boxGeometry args={[0.65, 1.2, 0.45]} /><meshStandardMaterial color="#264653" /></mesh>
      <mesh position={[0, 1.48, 0]}><sphereGeometry args={[0.28, 24, 24]} /><meshStandardMaterial color="#f2c58f" /></mesh>
      <mesh position={[0, 1.78, 0]}><cylinderGeometry args={[0.38, 0.42, 0.18, 20]} /><meshStandardMaterial color="#1f4d31" /></mesh>
      <mesh position={[0, 1.9, 0]}><boxGeometry args={[0.78, 0.08, 0.45]} /><meshStandardMaterial color="#1f4d31" /></mesh>
    </group>
  );
}

function PicnicBasket({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.22, 0]}><boxGeometry args={[0.85, 0.45, 0.55]} /><meshStandardMaterial color="#9b5c26" /></mesh>
      <mesh position={[0, 0.55, 0]}><torusGeometry args={[0.42, 0.04, 10, 28, Math.PI]} /><meshStandardMaterial color="#5f381b" /></mesh>
      <mesh position={[-0.18, 0.55, 0.22]}><sphereGeometry args={[0.1, 12, 12]} /><meshStandardMaterial color="#f43f5e" /></mesh>
      <mesh position={[0.1, 0.58, 0.22]}><sphereGeometry args={[0.1, 12, 12]} /><meshStandardMaterial color="#f59e0b" /></mesh>
    </group>
  );
}

function AdventureGame({ onBack }) {
  const [phase, setPhase] = useState('forest');
  const [score, setScore] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [message, setMessage] = useState('Race through the forest. Collect honey. Reach the river.');

  const phaseText = useMemo(() => ({
    forest: 'Forest Race',
    river: 'River Swim',
    boss: 'Magnus Showdown',
    victory: 'Cubby Saved',
  }), []);

  function action(type) {
    if (phase === 'victory') return;
    const points = type === 'boost' ? 40 : type === 'dodge' ? 30 : 50;
    setScore((s) => s + points);
    setEnergy((e) => Math.max(0, e - 8));
    setMessage(type === 'boost' ? 'Bruno bursts forward with honey speed.' : type === 'dodge' ? 'Clean dodge. Ranger missed.' : 'Skill move landed. The family cheers.');
    if (score > 160 && phase === 'forest') { setPhase('river'); setMessage('River crossing unlocked. Swim fast and avoid rocks.'); }
    if (score > 340 && phase === 'river') { setPhase('boss'); setMessage('Magnus appears at the basket gate. Final battle.'); }
    if (score > 560 && phase === 'boss') { setPhase('victory'); setMessage('Big win. Cubby is saved. Mohile Family Bears forever.'); }
  }

  return (
    <main className="game-shell">
      <section className="game-ui">
        <div className="hud">
          <button className="secondary" onClick={onBack}>Back</button>
          <strong>{phaseText[phase]}</strong>
          <span>Score {score}</span>
          <span>Energy {energy}</span>
        </div>
        <div className="game-canvas">
          <Canvas camera={{ position: [0, 5.2, 9], fov: 50 }}>
            <ambientLight intensity={0.75} />
            <directionalLight position={[4, 8, 5]} intensity={1.6} />
            <Stars radius={50} depth={12} count={900} factor={3} />
            <ForestSet />
            <RunnerScene phase={phase} />
          </Canvas>
        </div>
        <div className="control-panel">
          <p>{message}</p>
          <button className="primary" onClick={() => action('boost')}>Honey Boost</button>
          <button className="primary" onClick={() => action('dodge')}>Dodge</button>
          <button className="primary" onClick={() => action('skill')}>Skill Move</button>
        </div>
      </section>
    </main>
  );
}

function RunnerScene({ phase }) {
  const bear = useRef();
  useFrame(({ clock }) => {
    if (bear.current) {
      bear.current.position.x = Math.sin(clock.elapsedTime * 1.6) * 1.4;
      bear.current.rotation.y = Math.sin(clock.elapsedTime * 1.6) * 0.22;
    }
  });
  return (
    <>
      <group ref={bear}><Bear3D position={[0, 0.55, 1.8]} /></group>
      {phase === 'river' && <mesh rotation-x={-Math.PI / 2} position={[0, 0.09, 1.6]}><planeGeometry args={[7, 3]} /><meshStandardMaterial color="#0284c7" /></mesh>}
      {phase === 'boss' && <Villain3D position={[0, 0.9, -1.9]} />}
      {phase === 'victory' && <Cubby3D position={[1.5, 0.45, 1.8]} />}
      <PicnicBasket position={[2.8, 0.25, -1.6]} />
    </>
  );
}

export default function App() {
  const [screen, setScreen] = useState('home');
  if (screen === 'story') return <Story onStart={() => setScreen('game')} onBack={() => setScreen('home')} />;
  if (screen === 'game') return <AdventureGame onBack={() => setScreen('home')} />;
  return <Home onPlay={setScreen} />;
}
