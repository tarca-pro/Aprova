# Snowboard Canyon Gap (@ClarkClips)

- Clipe: `public/input/snow.mp4` (Thomas Feurstein, Silvretta Montafon). Música: `public/input/montagem.m4a` ("Montagem Câmera Lenta").
- Slow-motion do mortal (clipe 13.0–14.8s a 0.55x, interpolado):
  `ffmpeg -ss 13.0 -t 1.8 -i public/input/snow.mp4 -an -vf "setpts=PTS/0.55,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" public/input/snow_slow.mp4`
- `python3 examples/snowboard-canyon/build.py props.json` → `npm run render`

Sincronia: a música começa em 13.0s. O drop (14.8s) cai no flash do gancho (V=1.8s). O primeiro grave do clímax (29.57s) cai na aterrissagem (V=16.57s). Os graves seguintes (a cada 0.463s) viram zoom-punch.
