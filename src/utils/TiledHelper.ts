import Phaser from 'phaser';

export interface SpawnPoint {
  x: number;
  y: number;
  name?: string;
}

export interface EnemySpawn {
  type: string;
  x: number;
  y: number;
  properties: Record<string, unknown>;
}

export interface CollectibleSpawn {
  type: string;
  x: number;
  y: number;
  properties: Record<string, unknown>;
}

export interface CheckpointData {
  id: string;
  x: number;
  y: number;
  name?: string;
}

export interface TriggerData {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: Record<string, unknown>;
}

function getObjectProperties(obj: Phaser.Types.Tilemaps.TiledObject): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  if (obj.properties) {
    if (Array.isArray(obj.properties)) {
      for (const prop of obj.properties) {
        props[prop.name] = prop.value;
      }
    }
  }
  return props;
}

export function parseSpawnPoints(map: Phaser.Tilemaps.Tilemap, layerName: string = 'spawns'): SpawnPoint[] {
  const layer = map.getObjectLayer(layerName);
  if (!layer) return [];

  return layer.objects
    .filter(obj => obj.type === 'player_spawn' || obj.name === 'player_spawn')
    .map(obj => ({
      x: obj.x! + (obj.width || 0) / 2,
      y: obj.y! - (obj.height || 0) / 2,
      name: obj.name,
    }));
}

export function parseEnemies(map: Phaser.Tilemaps.Tilemap, layerName: string = 'enemies'): EnemySpawn[] {
  const layer = map.getObjectLayer(layerName);
  if (!layer) return [];

  return layer.objects.map(obj => ({
    type: obj.type || obj.name || 'brouillard_blob',
    x: obj.x! + (obj.width || 0) / 2,
    y: obj.y! - (obj.height || 0) / 2,
    properties: getObjectProperties(obj),
  }));
}

export function parseCollectibles(map: Phaser.Tilemaps.Tilemap, layerName: string = 'collectibles'): CollectibleSpawn[] {
  const layer = map.getObjectLayer(layerName);
  if (!layer) return [];

  return layer.objects.map(obj => ({
    type: obj.type || obj.name || 'macaron',
    x: obj.x! + (obj.width || 0) / 2,
    y: obj.y! - (obj.height || 0) / 2,
    properties: getObjectProperties(obj),
  }));
}

export function parseCheckpoints(map: Phaser.Tilemaps.Tilemap, layerName: string = 'checkpoints'): CheckpointData[] {
  const layer = map.getObjectLayer(layerName);
  if (!layer) return [];

  return layer.objects.map((obj, index) => ({
    id: obj.name || `checkpoint_${index}`,
    x: obj.x! + (obj.width || 0) / 2,
    y: obj.y! - (obj.height || 0) / 2,
    name: obj.name,
  }));
}

export function parseTriggers(map: Phaser.Tilemaps.Tilemap, layerName: string = 'triggers'): TriggerData[] {
  const layer = map.getObjectLayer(layerName);
  if (!layer) return [];

  return layer.objects.map(obj => ({
    name: obj.name || 'trigger',
    x: obj.x!,
    y: obj.y!,
    width: obj.width || 16,
    height: obj.height || 16,
    properties: getObjectProperties(obj),
  }));
}
