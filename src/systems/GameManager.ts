import { TOTAL_BIRTHDAY_CANDLES, MACARONS_PER_BONUS, SOUFFLE_INVINCIBILITY_MS } from '../config/GameConfig';
import { SaveManager, type SaveData } from './SaveManager';

export interface LevelStatus {
  completed: boolean;
  macaronsCollected: number;
  bestMacarons: number;
}

export class GameManager {
  private static _instance: GameManager;

  // Character
  selectedCharacter: 'poppleton' | 'zacko' = 'poppleton';

  // Collectibles (current session)
  macarons: number = 0;
  paintDrops: number = 0;
  candlesFound: number = 0; // bitmask for 11 candles

  // World/level progress
  levelStatus: Map<string, LevelStatus> = new Map();
  currentWorld: number = 1;
  currentLevel: number = 1;

  // Settings
  peintureMode: boolean = false;

  // Gallery
  galleryUnlocks: Set<string> = new Set();

  // Total counts (persistent)
  totalMacarons: number = 0;
  totalPaintDrops: number = 0;

  private saveManager: SaveManager;

  private constructor() {
    this.saveManager = new SaveManager();
    this.load();
  }

  static get instance(): GameManager {
    if (!GameManager._instance) {
      GameManager._instance = new GameManager();
    }
    return GameManager._instance;
  }

  // Macaron collection
  collectMacaron(): void {
    this.macarons++;
    this.totalMacarons++;

    // Check for bonus at threshold
    if (this.totalMacarons % MACARONS_PER_BONUS === 0) {
      // Unlock a bonus painting in gallery
      const bonusIndex = Math.floor(this.totalMacarons / MACARONS_PER_BONUS);
      this.galleryUnlocks.add(`bonus_painting_${bonusIndex}`);
    }
  }

  // Paint drop collection
  collectPaintDrop(): void {
    this.paintDrops++;
    this.totalPaintDrops++;
  }

  // Birthday candle collection (0-10 for 11 candles)
  collectCandle(candleIndex: number): void {
    this.candlesFound |= (1 << candleIndex);
  }

  get candleCount(): number {
    let count = 0;
    for (let i = 0; i < TOTAL_BIRTHDAY_CANDLES; i++) {
      if (this.candlesFound & (1 << i)) count++;
    }
    return count;
  }

  get allCandlesFound(): boolean {
    return this.candleCount >= TOTAL_BIRTHDAY_CANDLES;
  }

  get hasBirthdayGardenAccess(): boolean {
    return this.allCandlesFound;
  }

  // Gallery
  spendPaintDrops(amount: number): boolean {
    if (this.totalPaintDrops >= amount) {
      this.totalPaintDrops -= amount;
      return true;
    }
    return false;
  }

  unlockGalleryItem(itemId: string): void {
    this.galleryUnlocks.add(itemId);
  }

  isGalleryItemUnlocked(itemId: string): boolean {
    return this.galleryUnlocks.has(itemId);
  }

  // Level management
  completeLevel(worldNum: number, levelNum: number, macaronsCollected: number): void {
    const key = `${worldNum}-${levelNum}`;
    const existing = this.levelStatus.get(key);
    this.levelStatus.set(key, {
      completed: true,
      macaronsCollected,
      bestMacarons: Math.max(macaronsCollected, existing?.bestMacarons || 0),
    });
    this.save();
  }

  isLevelCompleted(worldNum: number, levelNum: number): boolean {
    return this.levelStatus.get(`${worldNum}-${levelNum}`)?.completed || false;
  }

  isWorldCompleted(worldNum: number): boolean {
    // World has 3 levels + 1 boss = 4 stages
    for (let l = 1; l <= 4; l++) {
      if (!this.isLevelCompleted(worldNum, l)) return false;
    }
    return true;
  }

  isWorldUnlocked(worldNum: number): boolean {
    if (worldNum === 1) return true;
    return this.isWorldCompleted(worldNum - 1);
  }

  // Reset level-session collectibles (when starting a level)
  resetLevelCollectibles(): void {
    this.macarons = 0;
  }

  // Persistence
  save(): void {
    const data: SaveData = {
      selectedCharacter: this.selectedCharacter,
      totalMacarons: this.totalMacarons,
      totalPaintDrops: this.totalPaintDrops,
      candlesFound: this.candlesFound,
      peintureMode: this.peintureMode,
      levelStatus: Object.fromEntries(this.levelStatus),
      galleryUnlocks: Array.from(this.galleryUnlocks),
      currentWorld: this.currentWorld,
      currentLevel: this.currentLevel,
    };
    this.saveManager.save(data);
  }

  load(): void {
    const data = this.saveManager.load();
    if (!data) return;

    this.selectedCharacter = data.selectedCharacter || 'poppleton';
    this.totalMacarons = data.totalMacarons || 0;
    this.totalPaintDrops = data.totalPaintDrops || 0;
    this.candlesFound = data.candlesFound || 0;
    this.peintureMode = data.peintureMode || false;
    this.currentWorld = data.currentWorld || 1;
    this.currentLevel = data.currentLevel || 1;

    if (data.levelStatus) {
      this.levelStatus = new Map(Object.entries(data.levelStatus));
    }
    if (data.galleryUnlocks) {
      this.galleryUnlocks = new Set(data.galleryUnlocks);
    }
  }

  clearSave(): void {
    this.saveManager.clear();
    this.totalMacarons = 0;
    this.totalPaintDrops = 0;
    this.candlesFound = 0;
    this.peintureMode = false;
    this.levelStatus.clear();
    this.galleryUnlocks.clear();
    this.currentWorld = 1;
    this.currentLevel = 1;
  }

  hasSave(): boolean {
    return this.saveManager.hasSave();
  }
}
