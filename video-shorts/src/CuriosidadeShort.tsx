import React from 'react';
import {Audio, Video} from '@remotion/media';
import {AbsoluteFill, Easing, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions} from './components/Captions';
import {Arrow, Circle} from './components/Highlights';
import {LightOverlay, zoomBlurAt} from './components/Transitions';
import type {ShortProps} from './types';

const src = (s: string) => (/^(https?:|data:|blob:)/.test(s) ? s : staticFile(s));

const videoStyle: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover'};

/** Trechos do clipe em sequência, cada um com sua velocidade (teaser, câmera lenta...). */
const Segments: React.FC<ShortProps> = (p) => {
  const {fps} = useVideoConfig();
  let at = 0;
  return (
    <>
      {p.segments!.map((s, i) => {
        const speed = s.speed ?? 1;
        const from = Math.round(at * fps);
        const len = (s.to - s.from) / speed;
        at += len;
        const dur = Math.round(at * fps) - from;
        return (
          <Sequence key={i} name={`trecho ${s.from}–${s.to}s ×${speed}`} from={from} durationInFrames={dur}>
            <Video
              src={src(s.src ?? p.clip)}
              trimBefore={Math.round(s.from * fps)}
              playbackRate={speed}
              volume={p.clipVolume ?? 0}
              style={videoStyle}
            />
          </Sequence>
        );
      })}
    </>
  );
};

/** Camada do clipe: cover 9:16, grade de cor, zoom lento, zoom-blur, punch nas batidas e tremida. */
const ClipLayer: React.FC<ShortProps> = (p) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames, width} = useVideoConfig();
  let zbScale = 1;
  let zbBlur = 0;
  for (const tr of p.transitions) {
    if (tr.type !== 'zoomBlur') continue;
    const z = zoomBlurAt(frame - Math.round(tr.at * fps));
    zbScale *= z.scale;
    zbBlur = Math.max(zbBlur, z.blur);
  }
  // zoom-punch: salta para beatZoom no frame da batida e volta em ~7 frames
  let punch = 1;
  for (const b of p.beats ?? []) {
    const rel = frame - Math.round(b * fps);
    if (rel >= 0 && rel < 8) punch = Math.max(punch, interpolate(rel, [0, 7], [p.beatZoom ?? 1.07, 1], {easing: Easing.out(Easing.quad)}));
  }
  // tremida: ruído determinístico decaindo
  let sx = 0;
  let sy = 0;
  for (const s of p.shakes ?? []) {
    const rel = frame - Math.round(s.at * fps);
    const n = Math.round((s.dur ?? 0.4) * fps);
    if (rel >= 0 && rel < n) {
      const amp = (s.amount ?? 28) * (width / 1080) * (1 - rel / n);
      sx += (random(`sx${s.at}-${rel}`) - 0.5) * 2 * amp;
      sy += (random(`sy${s.at}-${rel}`) - 0.5) * 2 * amp;
    }
  }
  const g = {saturation: 1.18, contrast: 1.07, brightness: 1.02, ...p.grade};
  return (
    <AbsoluteFill
      style={{
        scale: interpolate(frame, [0, durationInFrames], [1, p.kenBurns ?? 1.06]) * zbScale * punch * (sx || sy ? 1.04 : 1),
        translate: `${sx}px ${sy}px`,
        filter: `saturate(${g.saturation}) contrast(${g.contrast}) brightness(${g.brightness})${zbBlur > 0 ? ` blur(${zbBlur}px)` : ''}`,
      }}
    >
      {p.segments?.length ? (
        <Segments {...p} />
      ) : (
        <Video
          src={src(p.clip)}
          trimBefore={Math.round((p.clipStartFrom ?? 0) * fps)}
          loop={p.clipLoop ?? true}
          volume={p.clipVolume ?? 0}
          style={videoStyle}
        />
      )}
    </AbsoluteFill>
  );
};

/** Música começando em `musicStartFrom`, com fade-in curto e fade-out no fim. */
const Music: React.FC<ShortProps & {base: number}> = (p) => {
  const {fps, durationInFrames} = useVideoConfig();
  const fade = Math.max(1, Math.round((p.musicFadeOut ?? 0.5) * fps));
  return (
    <Audio
      src={src(p.music!)}
      trimBefore={Math.round((p.musicStartFrom ?? 0) * fps)}
      loop={!p.musicStartFrom}
      volume={(f) => {
        const env = p.musicEnvelope?.length
          ? interpolate(f / fps, p.musicEnvelope.map((k) => k[0]), p.musicEnvelope.map((k) => k[1]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
          : 1;
        return p.base * env * interpolate(f, [0, 3, durationInFrames - fade, durationInFrames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      }}
    />
  );
};

export const CuriosidadeShort: React.FC<ShortProps> = (p) => {
  const {fps} = useVideoConfig();
  const f = (s: number) => Math.max(0, Math.round(s * fps));
  const hasNarration = Boolean(p.narration);

  // SFX automáticos: impacto nos flashes, swoosh no zoom-blur, pop nas setas/círculos
  const autoSfx = [
    ...p.transitions
      .filter((t) => t.sfx !== false)
      .map((t) => ({
        at: t.at - (t.type === 'flash' ? 0.3 : t.type === 'zoomBlur' ? 0.25 : 0.15),
        src: t.type === 'flash' ? 'sfx/flash.wav' : t.type === 'zoomBlur' ? 'sfx/swoosh.wav' : 'sfx/whoosh.wav',
        volume: 0.55,
      })),
    ...p.arrows.map((a) => ({at: a.start, src: 'sfx/pop.wav', volume: 0.35})),
    ...p.circles.map((c) => ({at: c.start, src: 'sfx/pop.wav', volume: 0.35})),
  ];

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <ClipLayer {...p} />

      {p.transitions
        .filter((t) => t.type !== 'zoomBlur')
        .map((t, i) => (
          <Sequence key={`tr${i}`} name={`${t.type} ${t.at}s`} from={f(t.at) - 1} durationInFrames={12} layout="none">
            <LightOverlay type={t.type} />
          </Sequence>
        ))}

      {p.circles.map((c, i) => (
        <Sequence key={`c${i}`} name={`círculo ${c.start}s`} from={f(c.start)} durationInFrames={Math.max(1, f(c.end) - f(c.start))}>
          <Circle fx={c} />
        </Sequence>
      ))}
      {p.arrows.map((a, i) => (
        <Sequence key={`a${i}`} name={`seta ${a.start}s`} from={f(a.start)} durationInFrames={Math.max(1, f(a.end) - f(a.start))}>
          <Arrow fx={a} />
        </Sequence>
      ))}

      <Captions
        words={p.words}
        style={p.style}
        y={p.captionY ?? (p.style === 'comic' ? 0.777 : 0.65)}
        scale={p.captionScale ?? 1}
        handle={p.handle}
      />

      {p.narration ? <Audio src={src(p.narration)} volume={p.narrationVolume ?? 1} /> : null}
      {p.music ? <Music {...p} base={p.musicVolume ?? (hasNarration ? 0.18 : 0.6)} /> : null}
      {[...autoSfx, ...p.sfx].map((s: {at: number; src: string; volume?: number; duration?: number}, i) => (
        <Sequence
          key={`s${i}`}
          name={`sfx ${s.src}`}
          from={f(s.at)}
          durationInFrames={s.duration ? f(s.duration) : undefined}
          layout="none"
        >
          <Audio src={src(s.src)} volume={s.volume ?? 0.6} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
