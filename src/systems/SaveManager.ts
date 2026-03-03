import type { LevelStatus } from './GameManager';

const SAVE_KEY = 'jardin_des_frenchies_save';

export interface SaveData {
  selectedCharacter: 'poppleton' | 'zacko';
  totalMacarons: number;
  totalPaintDrops: number;
  candlesFound: number;
  peintureMode: boolean;
  levelStatus: Record<string, LevelStatus>;
  galleryUnlocks: string[];
  currentWorld: number;
  currentLevel: number;
}

export class SaveManager {
  save(data: SaveData): void {
    try {
      const json = JSON.stringify(data);
      localStorage.setItem(SAVE_KEY, json);
    } catch (e) {
      console.warn('Failed to save game:', e);
    }
  }

  load(): SaveData | null {
    try {
      const json = localStorage.getItem(SAVE_KEY);
      if (!json) return null;
      return JSON.parse(json) as SaveData;
    } catch (e) {
      console.warn('Failed to load save:', e);
      return null;
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {
      console.warn('Failed to clear save:', e);
    }
  }

  hasSave(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  }
}
