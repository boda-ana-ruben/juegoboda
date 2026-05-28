import type { Obstacle, Player } from "./types.ts";

export function intersectsPlayer(player: Player, ob: Obstacle): boolean {
  const px = player.x + 8;
  const py = player.y + 8;
  const pw = player.width - 16;
  const ph = player.height - 12;

  const ox = ob.x + 8;
  const oy = ob.y + 10;
  const ow = ob.width - 16;
  const oh = ob.height - 20;

  return px < ox + ow && px + pw > ox && py < oy + oh && py + ph > oy;
}
