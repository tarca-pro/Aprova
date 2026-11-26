import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import type {TransitionFx} from '../types';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * Overlays de luz. Frame 0 desta Sequence = 1 frame antes do corte.
 * "flash" (v2/v3, ~11 frames): quente → branco estourado (4f) → amarelo → laranja/rosa → normal.
 * "leak"  (v1 aos 3.7s, ~10 frames): vazamento laranja/rosa vindo do canto, sem estourar no branco.
 */
export const LightOverlay: React.FC<{type: TransitionFx['type']}> = ({type}) => {
  const f = useCurrentFrame();
  if (type === 'flash') {
    return (
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        {/* camada quente (laranja/rosa) – aparece antes e no rabo do flash */}
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(120% 90% at 85% 15%, #FFD27A 0%, #FF9A5C 50%, #FF7A7A 100%)',
            mixBlendMode: 'screen',
            opacity: interpolate(f, [0, 1, 5, 6, 9, 11], [0.75, 1, 1, 0.85, 0.35, 0], clamp),
          }}
        />
        {/* amarelo */}
        <AbsoluteFill
          style={{
            background: 'radial-gradient(130% 100% at 50% 40%, #FFFFFF 0%, #FFF3A0 60%, #FFC94D 100%)',
            opacity: interpolate(f, [0, 1, 5, 6, 7], [0, 0.6, 0.85, 0.55, 0], clamp),
          }}
        />
        {/* branco estourado */}
        <AbsoluteFill
          style={{
            background: '#fff',
            opacity: interpolate(f, [0, 1, 2, 4, 5], [0, 0.85, 0.97, 0.97, 0], clamp),
          }}
        />
      </AbsoluteFill>
    );
  }
  if (type === 'leak') {
    return (
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(90% 70% at 90% 85%, rgba(255,170,90,1) 0%, rgba(255,95,120,0.8) 45%, rgba(255,95,120,0) 80%)',
          mixBlendMode: 'screen',
          opacity: interpolate(f, [0, 4, 6, 10], [0, 1, 0.8, 0], clamp),
        }}
      />
    );
  }
  return null;
};

/** Para "zoomBlur": devolve escala/blur do vídeo num instante (em frames relativos ao corte). */
export const zoomBlurAt = (rel: number): {scale: number; blur: number} => {
  // antes do corte: 6 frames acelerando zoom + blur; depois: 9 frames assentando
  if (rel < -6 || rel > 9) return {scale: 1, blur: 0};
  if (rel < 0) {
    return {
      scale: interpolate(rel, [-6, 0], [1, 1.35], clamp),
      blur: interpolate(rel, [-6, -3, 0], [0, 6, 22], clamp),
    };
  }
  return {
    scale: interpolate(rel, [0, 9], [1.25, 1], clamp),
    blur: interpolate(rel, [0, 4, 9], [22, 8, 0], clamp),
  };
};
