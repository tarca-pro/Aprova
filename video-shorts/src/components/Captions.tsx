import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import type {CaptionStyle, Word} from '../types';

// Cores medidas frame a frame no v1 (legendas "comic").
const COMIC_COLORS = ['#FFFFFF', '#F7F31C', '#3FEA1F', '#22E3EA'];

const pickComicColors = (words: Word[]) => {
  const out: string[] = [];
  words.forEach((_, i) => {
    let c = COMIC_COLORS[Math.floor(random(`c${i}`) * COMIC_COLORS.length)];
    // nunca repete a mesma cor em seguida (como na referência)
    if (i > 0 && c === out[i - 1]) {
      c = COMIC_COLORS[(COMIC_COLORS.indexOf(c) + 1 + Math.floor(random(`d${i}`) * 3)) % COMIC_COLORS.length];
    }
    out.push(c);
  });
  return out;
};

export const Captions: React.FC<{
  words: Word[];
  style: CaptionStyle;
  y: number;
  scale: number;
  handle?: string;
}> = ({words, style, y, scale, handle}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;
  const colors = React.useMemo(() => pickComicColors(words), [words]);
  const idx = words.findIndex((w) => t >= w.start && t < w.end);
  const k = width / 1080;

  const watermark =
    style === 'clean' && handle ? (
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: y * height + 50 * k * scale,
          textAlign: 'center',
          fontFamily: 'Montserrat',
          fontWeight: 500,
          fontSize: 33 * k,
          color: 'rgba(255,255,255,0.82)',
          textShadow: '0 1px 3px rgba(0,0,0,0.75)',
        }}
      >
        {handle}
      </div>
    ) : null;

  if (idx === -1) return <AbsoluteFill>{watermark}</AbsoluteFill>;
  const w = words[idx];
  const local = frame - Math.round(w.start * fps); // frames desde que a palavra entrou

  if (style === 'comic') {
    // Entrada: 1º frame com borrão horizontal forte + leve deslize, 2º frame ainda borrado.
    const blur = interpolate(local, [0, 1, 2], [9, 3, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return (
      <AbsoluteFill>
        <svg width="0" height="0" style={{position: 'absolute'}}>
          <filter id="hblur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={`${blur * k * 1.6} 0`} />
          </filter>
        </svg>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: y * height,
            translate: `${interpolate(local, [0, 2], [-18 * k, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}px -50%`,
            scale: interpolate(local, [0, 2], [1.08, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            textAlign: 'center',
            fontFamily: 'Bangers',
            fontSize: 104 * k * scale,
            letterSpacing: 1 * k,
            color: colors[idx],
            WebkitTextStroke: `${15 * k * scale}px #000`,
            paintOrder: 'stroke fill',
            textShadow: `0 ${4 * k}px ${3 * k}px rgba(0,0,0,0.55)`,
            textTransform: 'uppercase',
            filter: blur > 0 ? 'url(#hblur)' : undefined,
            lineHeight: 1,
          }}
        >
          {w.text}
        </div>
      </AbsoluteFill>
    );
  }

  // clean (@conexãocuriosa): Montserrat ExtraBold, branco, contorno preto + sombra deslocada. Corte seco.
  const s = 6 * k * scale;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: y * height,
          translate: '0 -50%',
          // palavra de ênfase: entra grande (pop) e assenta 30% maior
          scale: w.emph
            ? interpolate(local, [0, 3, 6], [2.4, 1.5, 1.6], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
            : 1,
          textAlign: 'center',
          fontFamily: 'Montserrat',
          fontWeight: 800,
          fontSize: 98 * k * scale,
          color: '#fff',
          WebkitTextStroke: `${11 * k * scale}px #000`,
          paintOrder: 'stroke fill',
          textShadow: `${s}px ${s}px ${2 * k}px #000, ${s * 0.6}px ${s * 0.9}px ${8 * k}px rgba(0,0,0,0.6)`,
          lineHeight: 1,
          letterSpacing: -0.5 * k,
        }}
      >
        {w.text.toLowerCase()}
      </div>
      {watermark}
    </AbsoluteFill>
  );
};
