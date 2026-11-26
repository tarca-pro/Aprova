import json, sys
# --- linha do tempo (segundos do VÍDEO) ---
M0 = 13.0                       # música começa em 13.0s → drop (14.8) cai em V=1.8; grave 29.57 → V=16.57
SLOW = 95/30                    # duração do slow-motion pré-renderizado
segments = [
  {"from": 12.6, "to": 14.4},                                   # V 0.00–1.80  teaser do mortal (gancho)
  {"from": 2.0,  "to": 13.0},                                   # V 1.80–12.80 história (decolagem em V 12.05)
  {"src": "input/snow_slow.mp4", "from": 0, "to": SLOW},        # V 12.80–15.97 mortal em câmera lenta
  {"from": 14.8, "to": 18.8},                                   # V 15.97–19.97 aterrissagem (clipe 15.40 → V 16.57)
]
LAND = 1.8 + 11.0 + SLOW + 0.6
DUR = 19.9
bass = [29.57, 30.03, 30.5, 30.96, 31.42, 31.88, 32.34, 32.8]
beats = [round(b - M0, 3) for b in bass if b - M0 < DUR]

# --- roteiro: (início, fim, frase, palavras-ênfase) ---
phrases = [
  (0.05, 1.78, "ele pulou um cânion de cabeça pra baixo", []),
  (1.80, 2.75, "na beira do penhasco", []),
  (2.75, 4.50, "ele olhou pro abismo lá embaixo", []),
  (4.50, 6.60, "qualquer erro ali seria fatal", []),
  (6.60, 9.20, "mas em vez de desistir ele pegou velocidade", []),
  (9.20, 11.20, "e foi direto pra rampa", []),
  (11.20, 12.80, "sem frear e se jogou", []),
  (12.80, 15.00, "girando no ar sobre as pedras", []),
  (15.60, 16.50, "e...", []),
  (16.57, 17.45, "cravou", ["cravou"]),
  (17.45, 19.85, "você teria coragem comenta aqui embaixo", []),
]
words = []
for a, b, text, emph in phrases:
    toks = text.split()
    wts = [len(t) + 2 for t in toks]
    tot = sum(wts); t = a
    for tok, w in zip(toks, wts):
        d = (b - a) * w / tot
        o = {"text": tok, "start": round(t, 3), "end": round(t + d, 3)}
        if tok in emph: o["emph"] = True
        words.append(o); t += d

props = {
  "style": "clean", "handle": "@ClarkClips", "captionY": 0.77,
  "durationInSeconds": DUR,
  "clip": "input/snow.mp4", "segments": segments, "clipVolume": 0,
  "music": "input/montagem.m4a", "musicStartFrom": M0, "musicVolume": 0.9, "musicFadeOut": 0.6,
  "words": words,
  # seta no gancho apontando as pedras lá embaixo (acompanha o giro)
  "arrows": [{"start": 0, "end": 1.7, "x": 0.45, "y": 0.5, "angle": -25, "size": 0.25,
              "track": [{"t": 0, "x": 0.45, "y": 0.5}, {"t": 0.8, "x": 0.5, "y": 0.36}, {"t": 1.4, "x": 0.58, "y": 0.33}]}],
  # círculo no abismo quando ele olha pra baixo (clipe 3.0–4.6 → V 2.8–4.4)
  "circles": [{"start": 2.85, "end": 4.45, "x": 0.6, "y": 0.43, "radius": 0.13,
               "track": [{"t": 2.85, "x": 0.6, "y": 0.42}, {"t": 3.2, "x": 0.6, "y": 0.44}, {"t": 4.0, "x": 0.5, "y": 0.45}]}],
  "transitions": [
    {"at": 1.8, "type": "flash"},                 # drop da música
  ],
  "beats": beats, "beatZoom": 1.08,
  "shakes": [{"at": round(LAND, 3), "dur": 0.45, "amount": 30}],
  "sfx": [
    {"at": 0, "src": "sfx/riser.wav", "volume": 0.5, "duration": 1.8},   # tensão no gancho (música em silêncio)
    {"at": 12.0, "src": "sfx/whoosh.wav", "volume": 0.6},                # decolagem
    {"at": round(LAND, 3), "src": "sfx/impact.wav", "volume": 0.8},      # aterrissagem = 1º grave do clímax
  ],
  "kenBurns": 1.05,
}
json.dump(props, open(sys.argv[1], "w"), ensure_ascii=False, indent=2)
print("LAND", LAND, "DUR", DUR, "beats", beats)
