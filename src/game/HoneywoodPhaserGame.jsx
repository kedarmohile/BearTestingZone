import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { bearCharacters, equipmentCatalog, powerCatalog } from '../gameData/characters';
import { offlineBotProfiles, questCatalog } from '../gameData/quests';

const worldTiles = [
  { x: 0, y: 0, color: 0x70b567 },
  { x: 1, y: 0, color: 0x78bf70 },
  { x: 2, y: 0, color: 0x69a85f },
  { x: 3, y: 0, color: 0x5d9c58 },
  { x: 0, y: 1, color: 0x7dbd6f },
  { x: 1, y: 1, color: 0x97c56b },
  { x: 2, y: 1, color: 0x85b95f },
  { x: 3, y: 1, color: 0x699d67 },
  { x: 0, y: 2, color: 0x5fa7a6 },
  { x: 1, y: 2, color: 0x72b86c },
  { x: 2, y: 2, color: 0xb6a16b },
  { x: 3, y: 2, color: 0x6ba85d },
];

function isoToScreen(tileX, tileY) {
  return {
    x: 420 + (tileX - tileY) * 84,
    y: 190 + (tileX + tileY) * 42,
  };
}

class HoneywoodScene extends Phaser.Scene {
  constructor() {
    super('HoneywoodScene');
    this.playerSpeed = 170;
    this.questProgress = 0;
    this.questComplete = false;
  }

  create() {
    this.cameras.main.setBackgroundColor('#123849');
    this.createWorld();
    this.createCharacters();
    this.createHud();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE');
    this.physics.add.overlap(this.player, this.honeyGroup, this.collectHoney, undefined, this);
    this.physics.add.overlap(this.player, this.ranger, this.stunRanger, undefined, this);
    this.physics.add.overlap(this.player, this.basketZone, this.completeQuest, undefined, this);
  }

  createWorld() {
    const title = this.add.text(26, 24, 'Honeywood Saga Prototype', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#fff7cc',
      fontStyle: 'bold',
    });
    title.setScrollFactor(0);

    worldTiles.forEach((tile) => {
      const point = isoToScreen(tile.x, tile.y);
      const diamond = this.add.polygon(point.x, point.y, [0, -42, 84, 0, 0, 42, -84, 0], tile.color);
      diamond.setStrokeStyle(2, 0xffffff, 0.22);
    });

    this.add.rectangle(420, 208, 120, 72, 0xead18a).setStrokeStyle(4, 0x765334);
    this.add.rectangle(420, 172, 132, 24, 0x9f5f39).setStrokeStyle(3, 0x5f3c25);
    this.add.text(358, 195, 'Family Lodge', { fontSize: '14px', color: '#2d1708', fontStyle: 'bold' });

    this.add.rectangle(610, 340, 116, 58, 0xf2c46d).setStrokeStyle(4, 0x7b4b2a);
    this.add.text(552, 331, 'Picnic Basket', { fontSize: '13px', color: '#2d1708', fontStyle: 'bold' });
    this.basketZone = this.add.zone(610, 340, 128, 80);
    this.physics.add.existing(this.basketZone, true);

    this.honeyGroup = this.physics.add.staticGroup();
    [
      [336, 304],
      [472, 314],
      [548, 248],
      [650, 420],
      [278, 392],
    ].forEach(([x, y]) => {
      const honey = this.add.circle(x, y, 11, 0xfacc15).setStrokeStyle(3, 0xfff3b0);
      this.physics.add.existing(honey, true);
      this.honeyGroup.add(honey);
    });
  }

  createCharacters() {
    this.player = this.add.container(340, 420);
    this.physics.add.existing(this.player);
    this.player.body.setSize(42, 42);
    this.player.body.setOffset(-21, -21);
    this.drawBear(this.player, 0x9a6a3a, 'Bruno');

    this.ranger = this.add.container(632, 274);
    this.physics.add.existing(this.ranger);
    this.ranger.body.setSize(38, 44);
    this.ranger.body.setOffset(-19, -22);
    this.drawRanger(this.ranger);

    this.botBears = [
      this.add.container(270, 300),
      this.add.container(520, 430),
    ];
    this.drawBear(this.botBears[0], 0xc47b45, 'Memi');
    this.drawBear(this.botBears[1], 0x8b5d35, 'Papa');
  }

  drawBear(container, color, label) {
    container.add(this.add.circle(0, -18, 20, color));
    container.add(this.add.circle(-15, -36, 9, color));
    container.add(this.add.circle(15, -36, 9, color));
    container.add(this.add.ellipse(0, -14, 24, 14, 0xf3d6a5));
    container.add(this.add.circle(-7, -22, 3, 0x20140d));
    container.add(this.add.circle(7, -22, 3, 0x20140d));
    container.add(this.add.circle(0, -14, 4, 0x20140d));
    container.add(this.add.rectangle(0, 14, 34, 42, color));
    container.add(this.add.text(-28, 38, label, { fontSize: '12px', color: '#fff', fontStyle: 'bold' }));
  }

  drawRanger(container) {
    container.add(this.add.rectangle(0, -10, 30, 48, 0x3f6f46));
    container.add(this.add.circle(0, -40, 14, 0xf0c991));
    container.add(this.add.polygon(0, -56, [-22, 0, 22, 0, 0, -18], 0x315535));
    container.add(this.add.text(-48, 24, 'Ranger', { fontSize: '12px', color: '#fef3c7', fontStyle: 'bold' }));
  }

  createHud() {
    const quest = questCatalog[0];
    this.questText = this.add.text(26, 58, `Quest: ${quest.objectives[0].label}, then ${quest.objectives[1].label}.`, {
      fontFamily: 'Arial',
      fontSize: '15px',
      color: '#dbeafe',
    });
    this.questText.setScrollFactor(0);

    this.powerText = this.add.text(26, 82, 'Power: press SPACE for Storm Paw stun.', {
      fontFamily: 'Arial',
      fontSize: '15px',
      color: '#fde68a',
    });
    this.powerText.setScrollFactor(0);
  }

  update(_, delta) {
    const velocity = this.playerSpeed;
    const body = this.player.body;
    body.setVelocity(0, 0);

    if (this.cursors.left.isDown || this.keys.A.isDown) body.setVelocityX(-velocity);
    if (this.cursors.right.isDown || this.keys.D.isDown) body.setVelocityX(velocity);
    if (this.cursors.up.isDown || this.keys.W.isDown) body.setVelocityY(-velocity);
    if (this.cursors.down.isDown || this.keys.S.isDown) body.setVelocityY(velocity);

    if (this.keys.SPACE.isDown && !this.stormActive) {
      this.castStormPaw();
    }

    this.moveRanger(delta);
  }

  moveRanger(delta) {
    const dx = this.player.x - this.ranger.x;
    const dy = this.player.y - this.ranger.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const speed = this.stormActive ? -70 : 56;
    this.ranger.x += (dx / distance) * speed * (delta / 1000);
    this.ranger.y += (dy / distance) * speed * (delta / 1000);
  }

  collectHoney(_, honey) {
    if (this.questComplete) return;
    honey.destroy();
    this.questProgress += 1;
    this.questText.setText(`Quest: Brave Honey ${this.questProgress}/5. Reach the Picnic Basket after collecting all.`);
    if (this.questProgress >= 5) {
      this.questText.setText('Quest ready: bring Brave Honey to the Picnic Basket for the family win.');
    }
  }

  castStormPaw() {
    this.stormActive = true;
    const ring = this.add.circle(this.player.x, this.player.y - 14, 18, 0x38bdf8, 0.35).setStrokeStyle(5, 0xbae6fd);
    this.tweens.add({
      targets: ring,
      scale: 4,
      alpha: 0,
      duration: 480,
      onComplete: () => {
        ring.destroy();
        this.time.delayedCall(900, () => {
          this.stormActive = false;
        });
      },
    });
  }

  stunRanger() {
    if (!this.stormActive) {
      this.questText.setText('Ranger bumped Bruno. Use Storm Paw, then finish the rescue.');
      return;
    }
    this.ranger.x = 690;
    this.ranger.y = 210;
    this.questText.setText('Storm Paw worked. Ranger is safely stunned and ran back to the trail.');
  }

  completeQuest() {
    if (this.questComplete || this.questProgress < 5) return;
    this.questComplete = true;
    this.player.body.setVelocity(0, 0);
    this.questText.setText('Quest complete: the picnic basket is saved. Berry Bow unlocked.');
    this.add.rectangle(480, 270, 560, 164, 0x0f172a, 0.88).setStrokeStyle(3, 0xfde68a);
    this.add.text(248, 218, 'Big Win: Honeywood Picnic Saved', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#fde68a',
      fontStyle: 'bold',
    });
    this.add.text(286, 262, 'Bruno restored the Brave Honey and unlocked the Berry Bow.', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#dbeafe',
    });
    this.add.text(326, 292, 'Next: add character select, inventory, and the first bot quest.', {
      fontFamily: 'Arial',
      fontSize: '15px',
      color: '#bae6fd',
    });
  }
}

export default function HoneywoodPhaserGame({ onHome }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const bruno = bearCharacters.find((bear) => bear.id === 'bruno');
  const starterWeapon = equipmentCatalog.find((item) => item.id === bruno.starterEquipment.mainHand);
  const starterPower = powerCatalog.find((power) => power.id === bruno.powers[0]);
  const quest = questCatalog[0];

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return undefined;

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 960,
      height: 540,
      backgroundColor: '#123849',
      physics: {
        default: 'arcade',
        arcade: { debug: false },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: HoneywoodScene,
    });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <main className="phaser-shell">
      <section className="phaser-topbar">
        <button className="secondary" onClick={onHome}>Home</button>
        <div>
          <span className="tiny-label">Baked foundation</span>
          <strong>Reldens-inspired Phaser RPG slice</strong>
        </div>
      </section>

      <section className="phaser-layout">
        <div className="phaser-game-frame" ref={containerRef} />
        <aside className="phaser-side-panel">
          <span className="tiny-label">Playable Bear</span>
          <h2>{bruno.name}</h2>
          <p>{bruno.storyHook}</p>
          <div className="loadout-card quest-card">
            <strong>{quest.title}</strong>
            <span>{quest.story}</span>
          </div>
          <div className="loadout-card">
            <strong>{starterWeapon.name}</strong>
            <span>{starterWeapon.kidSafeEffect}</span>
          </div>
          <div className="loadout-card">
            <strong>{starterPower.name}</strong>
            <span>{starterPower.effect}</span>
          </div>
          <div className="loadout-card">
            <strong>Offline Helpers</strong>
            <span>{offlineBotProfiles.map((bot) => bot.characterId).join(', ')} are planned as bot companions.</span>
          </div>
          <div className="source-note">
            Foundation: Phaser runtime now, Reldens systems next, Colyseus online later.
          </div>
        </aside>
      </section>
    </main>
  );
}
