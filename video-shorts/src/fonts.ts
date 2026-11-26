import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Bangers = fonte das legendas coloridas (v1).
// Montserrat 800/900 = legendas brancas com sombra (v2/v3, @conexãocuriosa).
export const fontsLoaded = Promise.all([
  loadFont({family: 'Bangers', url: staticFile('fonts/Bangers.woff2'), weight: '400'}),
  ...['500', '700', '800', '900'].map((weight) =>
    loadFont({family: 'Montserrat', url: staticFile(`fonts/Montserrat-${weight}.woff2`), weight}),
  ),
]);
