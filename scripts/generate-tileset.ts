// This script generates placeholder tileset PNGs using canvas
// Run with: npx tsx scripts/generate-tileset.ts

import { createCanvas } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

// World 1 tileset: 4 tiles (ground, platform, water, lily pad)
const TILE_SIZE = 16;
const TILES_PER_ROW = 4;

const canvas = createCanvas(TILE_SIZE * TILES_PER_ROW, TILE_SIZE);
const ctx = canvas.getContext('2d');

// Tile 1: Ground (green earth)
ctx.fillStyle = '#5a7e5e';
ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
ctx.fillStyle = '#7a9e7e';
ctx.fillRect(0, 0, TILE_SIZE, 4);
// Add some texture
ctx.fillStyle = '#4a6e4e';
ctx.fillRect(3, 6, 2, 2);
ctx.fillRect(10, 9, 2, 2);
ctx.fillRect(6, 12, 2, 2);

// Tile 2: Platform (lighter, lily pad style)
ctx.fillStyle = '#4a8c8c';
ctx.fillRect(TILE_SIZE, 0, TILE_SIZE, TILE_SIZE);
ctx.fillStyle = '#6baaab';
ctx.fillRect(TILE_SIZE, 0, TILE_SIZE, 4);
ctx.fillStyle = '#3a7c7c';
ctx.fillRect(TILE_SIZE + 2, 8, 3, 2);
ctx.fillRect(TILE_SIZE + 9, 5, 3, 2);

// Tile 3: Water
ctx.fillStyle = '#3a6e8c';
ctx.fillRect(TILE_SIZE * 2, 0, TILE_SIZE, TILE_SIZE);
ctx.fillStyle = '#4a7e9c';
ctx.fillRect(TILE_SIZE * 2 + 2, 4, 6, 2);
ctx.fillRect(TILE_SIZE * 2 + 8, 10, 4, 2);

// Tile 4: Decoration (flower)
ctx.fillStyle = '#e8b4b8';
ctx.fillRect(TILE_SIZE * 3 + 4, 4, 8, 8);
ctx.fillStyle = '#ffdddd';
ctx.fillRect(TILE_SIZE * 3 + 6, 6, 4, 4);
ctx.fillStyle = '#7a9e7e';
ctx.fillRect(TILE_SIZE * 3 + 7, 12, 2, 4);

const outputDir = path.join(__dirname, '..', 'assets', 'tilesets');
fs.mkdirSync(outputDir, { recursive: true });

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(outputDir, 'world1-tileset.png'), buffer);
console.log('Generated world1-tileset.png');
