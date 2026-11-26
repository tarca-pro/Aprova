# video-shorts: template Remotion de shorts de curiosidades

Este template reproduz o estilo das referências: legenda palavra por palavra, seta 3D, círculo de destaque, transições flash/leak/zoom-blur, música, efeitos sonoros e grade de cor. A análise completa está em [ANALISE.md](ANALISE.md).

## Uso rápido

```bash
npm install
npm run sfx                      # (re)gera os efeitos sonoros em public/sfx

# 1) gera o props.json a partir das suas mídias
node scripts/prepare.mjs --clip meu_clipe.mp4 --music musica.mp3 \
     --script roteiro.txt --style clean --handle @meucanal
#   opcional: --narration narracao.mp3 (as legendas seguem a fala)
#             --style comic           (legenda colorida estilo v1)
#             --start 3.5             (pula os 3,5 s iniciais do clipe)

# 2) ajuste no props.json a posição da seta (arrows) e dos círculos (circles)
# 3) preview e render
npm run studio
npm run render                   # → out/video.mp4 (1080×1920, 30 fps)
```

Nesta máquina (container sem download de Chrome), defina antes:
`export REMOTION_CHROME=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`

## props.json
| campo | o que faz |
|---|---|
| `style` | `clean` (branco Montserrat + @handle) ou `comic` (Bangers colorida) |
| `words[]` | `{text, start, end}` em segundos: uma palavra na tela por vez |
| `arrows[]` | `{start, end, x, y, angle, track?}`: x/y em fração da tela (0–1), `angle` 0 = apontando para baixo |
| `circles[]` | `{start, end, x, y, radius, color?, track?}`: `track: [{t,x,y}]` faz o círculo seguir o objeto |
| `transitions[]` | `{at, type: flash \| leak \| zoomBlur}`: efeito sonoro automático |
| `sfx[]` | efeitos extras `{at, src: "sfx/riser.wav", volume}` |
| `musicVolume`, `narrationVolume`, `clipVolume`, `kenBurns`, `grade` | mixagem e cor |
