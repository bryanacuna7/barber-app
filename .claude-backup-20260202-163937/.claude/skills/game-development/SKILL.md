# Game Development Skill

Patterns for web-based game development with JavaScript/TypeScript.

## Game Loop Pattern

```typescript
class Game {
  private lastTime = 0;
  private running = false;

  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.loop(time));
  }

  stop() {
    this.running = false;
  }

  private loop(currentTime: number) {
    if (!this.running) return;

    const deltaTime = (currentTime - this.lastTime) / 1000; // seconds
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame((time) => this.loop(time));
  }

  private update(dt: number) {
    // Update game state
    // dt = time since last frame in seconds
  }

  private render() {
    // Draw to canvas
  }
}
```

## Canvas Setup

```typescript
const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// High DPI support
const dpr = window.devicePixelRatio || 1;
canvas.width = canvas.clientWidth * dpr;
canvas.height = canvas.clientHeight * dpr;
ctx.scale(dpr, dpr);

// Clear screen
function clear() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
```

## Entity System

```typescript
interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  update(dt: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}

class Player implements Entity {
  x = 100;
  y = 100;
  width = 32;
  height = 32;
  speed = 200;
  velocityX = 0;
  velocityY = 0;

  update(dt: number) {
    this.x += this.velocityX * this.speed * dt;
    this.y += this.velocityY * this.speed * dt;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#0f0';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
```

## Input Handling

```typescript
class InputManager {
  private keys = new Set<string>();

  constructor() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }

  isPressed(key: string): boolean {
    return this.keys.has(key);
  }

  getAxis(negative: string, positive: string): number {
    let value = 0;
    if (this.isPressed(negative)) value -= 1;
    if (this.isPressed(positive)) value += 1;
    return value;
  }
}

// Usage
const input = new InputManager();

function update(dt: number) {
  player.velocityX = input.getAxis('ArrowLeft', 'ArrowRight');
  player.velocityY = input.getAxis('ArrowUp', 'ArrowDown');
}
```

## Collision Detection

```typescript
// AABB collision
function rectCollision(a: Entity, b: Entity): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Circle collision
function circleCollision(
  x1: number, y1: number, r1: number,
  x2: number, y2: number, r2: number
): boolean {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < r1 + r2;
}

// Point in rect
function pointInRect(px: number, py: number, rect: Entity): boolean {
  return (
    px >= rect.x &&
    px <= rect.x + rect.width &&
    py >= rect.y &&
    py <= rect.y + rect.height
  );
}
```

## Sprite Animation

```typescript
class Sprite {
  private frameIndex = 0;
  private frameTime = 0;
  private frameDuration = 0.1; // seconds per frame

  constructor(
    private image: HTMLImageElement,
    private frameWidth: number,
    private frameHeight: number,
    private frameCount: number
  ) {}

  update(dt: number) {
    this.frameTime += dt;
    if (this.frameTime >= this.frameDuration) {
      this.frameTime = 0;
      this.frameIndex = (this.frameIndex + 1) % this.frameCount;
    }
  }

  render(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.drawImage(
      this.image,
      this.frameIndex * this.frameWidth, 0,  // Source
      this.frameWidth, this.frameHeight,
      x, y,                                   // Destination
      this.frameWidth, this.frameHeight
    );
  }
}
```

## Camera System

```typescript
class Camera {
  x = 0;
  y = 0;

  constructor(
    private width: number,
    private height: number
  ) {}

  follow(target: Entity, worldWidth: number, worldHeight: number) {
    // Center on target
    this.x = target.x - this.width / 2;
    this.y = target.y - this.height / 2;

    // Clamp to world bounds
    this.x = Math.max(0, Math.min(this.x, worldWidth - this.width));
    this.y = Math.max(0, Math.min(this.y, worldHeight - this.height));
  }

  apply(ctx: CanvasRenderingContext2D) {
    ctx.translate(-this.x, -this.y);
  }

  reset(ctx: CanvasRenderingContext2D) {
    ctx.translate(this.x, this.y);
  }
}
```

## Sound Manager

```typescript
class SoundManager {
  private sounds = new Map<string, HTMLAudioElement>();

  load(name: string, src: string) {
    const audio = new Audio(src);
    audio.preload = 'auto';
    this.sounds.set(name, audio);
  }

  play(name: string, volume = 1) {
    const sound = this.sounds.get(name);
    if (sound) {
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.volume = volume;
      clone.play();
    }
  }

  playMusic(name: string, volume = 0.5) {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.loop = true;
      sound.volume = volume;
      sound.play();
    }
  }
}
```

## State Machine

```typescript
type GameState = 'menu' | 'playing' | 'paused' | 'gameOver';

class StateMachine {
  private state: GameState = 'menu';
  private states = new Map<GameState, {
    enter?: () => void;
    update?: (dt: number) => void;
    render?: (ctx: CanvasRenderingContext2D) => void;
    exit?: () => void;
  }>();

  register(name: GameState, handlers: typeof this.states extends Map<any, infer V> ? V : never) {
    this.states.set(name, handlers);
  }

  change(newState: GameState) {
    this.states.get(this.state)?.exit?.();
    this.state = newState;
    this.states.get(this.state)?.enter?.();
  }

  update(dt: number) {
    this.states.get(this.state)?.update?.(dt);
  }

  render(ctx: CanvasRenderingContext2D) {
    this.states.get(this.state)?.render?.(ctx);
  }
}
```

## Libraries

| Library | Purpose |
|---------|---------|
| **Phaser** | Full game framework |
| **PixiJS** | 2D rendering engine |
| **Three.js** | 3D graphics |
| **Howler.js** | Audio |
| **Matter.js** | 2D physics |
| **Cannon.js** | 3D physics |
