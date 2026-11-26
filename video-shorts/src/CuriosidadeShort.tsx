import React from 'react';
import {Audio, Video} from '@remotion/media';
import {AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions} from './components/Captions';
import {Arrow, Circle} from './components/Highlights';
import {LightOverlay, zoomBlurAt} from './components/Transitions';
import type {ShortProps} from './types';

const src = (s: string) => (/^(https?:|data:|blob:)/.test(s) ? s : staticFile(s));

/** Camada do clipe: cover 9:16, grade de cor, zoom lento e zoom-blur nas transições. */
const ClipLayer: React.FC<ShortProps> = (p) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  let zbScale = 1;
  let zbBlur = 0;
  for (const tr of p.transitions) {
    if (tr.type !== 'zoomBlur') continue;
    const z = zoomBlurAt(frame - Math.round(tr.at * fps));
    zbScale *= z.scale;
    zbBlur = Math.max(zbBlur, z.blur);
  }
  const g = {saturation: 1.18, contrast: 1.07, brightness: 1.02, ...p.grade};
  return (
    <AbsoluteFill
      style={{
        scale: interpolate(frame, [0, durationInFrames], [1, p.kenBurns ?? 1.06]) * zbScale,
        filter: `saturate(${g.saturation}) contrast(${g.contrast}) brightness(${g.brightness})${zbBlur > 0 ? ` blur(${zbBlur}px)` : ''}`,
      }}
    >
      <Video
        src={src(p.clip)}
        trimBefore={Math.round((p.clipStartFrom ?? 0) * fps)}
        loop={p.clipLoop ?? true}
        volume={p.clipVolume ?? 0}
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />
    </AbsoluteFill>
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
      {p.music ? <Audio src={src(p.music)} loop volume={p.musicVolume ?? (hasNarration ? 0.18 : 0.6)} /> : null}
      {[...autoSfx, ...p.sfx].map((s, i) => (
        <Sequence key={`s${i}`} name={`sfx ${s.src}`} from={f(s.at)} layout="none">
          <Audio src={src(s.src)} volume={s.volume ?? 0.6} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
