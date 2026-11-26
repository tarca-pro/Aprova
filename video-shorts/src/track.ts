import {interpolate} from 'remotion';
import type {TrackPoint} from './types';

/** Posição (x,y normalizados) num instante t, interpolando os pontos do track. */
export const positionAt = (
  t: number,
  base: {x: number; y: number; track?: TrackPoint[]},
): {x: number; y: number} => {
  const tr = base.track;
  if (!tr || tr.length === 0) return {x: base.x, y: base.y};
  if (tr.length === 1) return {x: tr[0].x, y: tr[0].y};
  const ts = tr.map((p) => p.t);
  const opts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  return {
    x: interpolate(t, ts, tr.map((p) => p.x), opts),
    y: interpolate(t, ts, tr.map((p) => p.y), opts),
  };
};
