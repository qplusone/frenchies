import { Enemy } from './Enemy';
import { BrouillardBlob } from './BrouillardBlob';
import { PluieSprite } from './PluieSprite';
import { FeuilleFlotter } from './FeuilleFlotter';
import { PapillonGris } from './PapillonGris';
import { PierreRoulante } from './PierreRoulante';
import { ToileDaraignee } from './ToileDaraignee';
import { NuageNoir } from './NuageNoir';

export function createEnemy(
  scene: Phaser.Scene,
  type: string,
  x: number,
  y: number,
): Enemy {
  switch (type) {
    case 'brouillard_blob':
      return new BrouillardBlob(scene, x, y);
    case 'pluie_sprite':
      return new PluieSprite(scene, x, y);
    case 'feuille_flotter':
      return new FeuilleFlotter(scene, x, y);
    case 'papillon_gris':
      return new PapillonGris(scene, x, y);
    case 'pierre_roulante':
      return new PierreRoulante(scene, x, y);
    case 'toile_daraignee':
      return new ToileDaraignee(scene, x, y);
    case 'nuage_noir':
      return new NuageNoir(scene, x, y);
    default:
      // Default to blob for unknown types
      return new BrouillardBlob(scene, x, y);
  }
}
