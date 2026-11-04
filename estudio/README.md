# Estúdio de vídeo

Ferramentas instaladas para as edições do @claarkio.

| Ferramenta | Versão | Como usar |
|---|---|---|
| Remotion | 4.0.540 | `npx remotion render src/index.jsx <Composição> saida.mp4 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell` |
| HyperFrames | 0.9.13 | `npx hyperframes init <nome>` e `npx hyperframes render -o saida.mp4` (com `PUPPETEER_EXECUTABLE_PATH` apontando para o mesmo Chrome). O GSAP deve ser carregado de `node_modules/gsap`, porque o CDN é bloqueado pela rede. |
| GSAP | 3.15.0 | Animações dentro do HyperFrames |
| FFmpeg | 6.1.1 | Já vem no ambiente |
| yt-dlp | 2026.10.26 | `pip install yt-dlp` |
| Whisper | 20250625 | `pip install openai-whisper`. O modelo precisa ser baixado de openaipublic.azureedge.net, que não está liberado na rede. |

Para reinstalar em um ambiente novo: `npm install` nesta pasta e `pip install yt-dlp openai-whisper`.
