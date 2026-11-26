// Todas as posições (x, y, radius) são normalizadas: 0..1 da largura/altura do vídeo.
// Todos os tempos são em segundos.

export type CaptionStyle = 'comic' | 'clean';

export type Word = {text: string; start: number; end: number; emph?: boolean};

/** Trecho do clipe na linha do tempo (em sequência). `src` opcional para usar outro arquivo (ex.: slow-motion pré-renderizado). */
export type Segment = {src?: string; from: number; to: number; speed?: number};

export type TrackPoint = {t: number; x: number; y: number};

export type ArrowFx = {
  start: number;
  end: number;
  /** Onde a ponta da seta aponta. Use `track` para acompanhar algo em movimento. */
  x: number;
  y: number;
  track?: TrackPoint[];
  /** Ângulo em graus. 0 = seta apontando para baixo; 45 = vindo da direita-cima (como no v1). */
  angle?: number;
  size?: number; // fração da largura (padrão 0.2)
};

export type CircleFx = {
  start: number;
  end: number;
  x: number;
  y: number;
  track?: TrackPoint[];
  radius?: number; // fração da largura (padrão 0.09)
  color?: string; // padrão vermelho (#E8141B). v1 usa laranja (#FF5A1E)
  strokeWidth?: number; // px em 1080p
};

export type TransitionType = 'flash' | 'leak' | 'zoomBlur';
export type TransitionFx = {at: number; type: TransitionType; sfx?: boolean};

export type SfxFx = {at: number; src: string; volume?: number; duration?: number};

export type ShortProps = {
  style: CaptionStyle;
  durationInSeconds: number;
  clip: string; // arquivo em public/ (ex: "input/clip.mp4") ou URL
  clipStartFrom?: number; // segundos a pular no início do clipe
  clipLoop?: boolean;
  /** Se definido, substitui clip/clipStartFrom: monta a linha do tempo com estes trechos. */
  segments?: Segment[];
  music?: string;
  musicStartFrom?: number; // segundo da música que toca no frame 0
  musicFadeOut?: number; // segundos de fade no final
  musicVolume?: number; // padrão 0.18 com narração / 0.6 sem
  /** Envelope de volume da música: [[segundo, volume], ...] (multiplica musicVolume). Útil para abaixar sob a voz e subir no clímax. */
  musicEnvelope?: [number, number][];
  /** Batidas (segundos do vídeo) → zoom-punch no clipe */
  beats?: number[];
  beatZoom?: number; // padrão 1.07
  /** Tremidas de câmera (impacto) */
  shakes?: {at: number; dur?: number; amount?: number}[];
  narration?: string;
  narrationVolume?: number;
  clipVolume?: number; // som original do clipe (padrão 0)
  words: Word[];
  captionY?: number; // centro vertical da legenda (comic 0.777, clean 0.65)
  captionScale?: number;
  handle?: string; // marca d'água sob a legenda (estilo clean), ex: "@conexãocuriosa"
  arrows: ArrowFx[];
  circles: CircleFx[];
  transitions: TransitionFx[];
  sfx: SfxFx[];
  /** zoom lento contínuo (1 = sem zoom). Padrão 1.06 */
  kenBurns?: number;
  grade?: {saturation?: number; contrast?: number; brightness?: number};
};
