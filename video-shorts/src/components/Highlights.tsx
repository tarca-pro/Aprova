import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {positionAt} from '../track';
import type {ArrowFx, CircleFx} from '../types';

/**
 * Seta vermelha 3D (face vermelha + extrusão preta), igual às referências.
 * Desenhada apontando para BAIXO com a ponta em (0,0); a rotação gira em volta da ponta.
 */
const ArrowShape: React.FC<{size: number}> = ({size}) => {
  // geometria em unidades de 100
  const pts = '-14,-100 14,-100 14,-42 34,-42 0,0 -34,-42 -14,-42';
  return (
    <svg
      width={size}
      height={size * 1.15}
      viewBox="-50 -110 100 115"
      style={{position: 'absolute', left: -size / 2, top: -size * (110 / 115) * 1.15, overflow: 'visible'}}
    >
      {/* extrusão (lado escuro) */}
      <g transform="translate(-9,-7)">
        <polygon points={pts} fill="#111" stroke="#111" strokeWidth={4} strokeLinejoin="round" />
      </g>
      <polygon points={pts} fill="#000" transform="translate(-4.5,-3.5)" />
      <polygon points={pts} fill="#FF0A0A" stroke="#B00000" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
};

export const Arrow: React.FC<{fx: ArrowFx}> = ({fx}) => {
  const frame = useCurrentFrame(); // relativo ao início da Sequence
  const {fps, width, height} = useVideoConfig();
  const t = fx.start + frame / fps;
  const p = positionAt(t, fx);
  const angle = fx.angle ?? 0;
  const rad = (angle * Math.PI) / 180;
  // "cutucada" na direção apontada (~3,5 Hz), como nas referências
  const bob = Math.sin((frame / fps) * Math.PI * 2 * 3.5) * 14 * (width / 1080);
  const dx = -Math.sin(rad) * bob;
  const dy = Math.cos(rad) * bob;
  const dur = (fx.end - fx.start) * fps;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: p.x * width + dx,
          top: p.y * height + dy,
          rotate: `${angle}deg`,
          scale: interpolate(frame, [0, 4, dur - 3, dur], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.back(2)),
          }),
          transformOrigin: '0 0',
        }}
      >
        <ArrowShape size={(fx.size ?? 0.2) * width} />
      </div>
    </AbsoluteFill>
  );
};

export const Circle: React.FC<{fx: CircleFx}> = ({fx}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = fx.start + frame / fps;
  const p = positionAt(t, fx);
  const r = (fx.radius ?? 0.09) * width;
  const sw = (fx.strokeWidth ?? 11) * (width / 1080);
  return (
    <AbsoluteFill>
      <svg
        width={width}
        height={height}
        style={{
          position: 'absolute',
          scale: interpolate(frame, [0, 3], [1.35, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          transformOrigin: `${p.x * width}px ${p.y * height}px`,
          opacity: interpolate(frame, [0, 1], [0, 1], {extrapolateRight: 'clamp'}),
        }}
      >
        <circle
          cx={p.x * width}
          cy={p.y * height}
          r={r}
          fill="none"
          stroke={fx.color ?? '#E8141B'}
          strokeWidth={sw}
          style={{filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.35))'}}
        />
      </svg>
    </AbsoluteFill>
  );
};
