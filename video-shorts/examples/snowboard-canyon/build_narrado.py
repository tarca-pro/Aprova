import json, subprocess, sys
J = sys.argv[1]; OUT_PROPS = sys.argv[2]; PUB = sys.argv[3]
# --- frases da narração: (início, fim no arquivo original, partes [(ini, fim, texto)], posição no vídeo, tempo) ---
S = [
  ((0.0, 2.5),    [(0.0, 0.664, "ele pulou"), (0.767, 2.5, "um cânion de cabeça pra baixo")], 0.05, 1.1),
  ((2.952, 5.935),[(2.952, 5.935, "na beira do penhasco ele olhou pro abismo lá embaixo")], 2.45, 1.1),
  ((6.407, 8.377),[(6.407, 8.377, "qualquer erro ali seria fatal")], 5.28, 1.1),
  ((8.949, 13.524),[(8.949, 10.58, "mas em vez de desistir"), (10.776, 13.524, "ele pegou velocidade e foi direto pra rampa")], 7.20, 1.1),
  ((13.881, 14.74),[(13.881, 14.74, "sem frear")], 11.50, 1.1),
  ((15.187, 15.896),[(15.187, 15.896, "e se jogou")], 12.42, 1.1),
  ((16.35, 18.598),[(16.35, 18.598, "girando no ar sobre as pedras")], 13.30, 1.1),
  ((18.705, 19.06),[(18.705, 19.06, "e...")], 15.85, 1.1),
  ((19.408, 20.008),[(19.408, 20.008, "cravou")], 17.10, 1.1),
  ((20.564, 22.738),[(20.564, 21.532, "você teria coragem"), (21.909, 22.738, "comenta aqui embaixo")], 17.78, 1.12),
]
PRE, POST = 0.04, 0.07
# --- áudio da narração reposicionada ---
fc, labels = [], []
for i, ((a, b), parts, at, tempo) in enumerate(S):
    d = int(max(0, at - PRE / tempo) * 1000)
    fc.append(f"[0:a]atrim={max(0,a-PRE)}:{b+POST},asetpts=PTS-STARTPTS,atempo={tempo},afade=t=in:d=0.02,afade=t=out:st={(b-a+PRE+POST)/tempo-0.03}:d=0.03,adelay={d}|{d}[s{i}]")
    labels.append(f"[s{i}]")
fc.append("".join(labels) + f"amix=inputs={len(S)}:normalize=0,apad=whole_dur=19.9,atrim=0:19.9,loudnorm=I=-15:TP=-1.5:LRA=11[out]")
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", f"{J}/narr.mp3", "-filter_complex", ";".join(fc),
                "-map", "[out]", "-ar", "44100", "-c:a", "pcm_s16le", f"{PUB}/input/narracao_sync.wav"], check=True)

# --- legendas: palavras distribuídas dentro de cada trecho de fala ---
words = []
for (a, b), parts, at, tempo in S:
    for pa, pb, text in parts:
        va, vb = at + (pa - a) / tempo, at + (pb - a) / tempo
        toks = text.split(); wts = [len(t) + 2 for t in toks]; tot = sum(wts); t = va
        for tok, w in zip(toks, wts):
            dd = (vb - va) * w / tot
            o = {"text": tok.replace("...", "…"), "start": round(t, 3), "end": round(t + dd, 3)}
            if tok == "cravou": o["emph"] = True
            words.append(o); t += dd
for i in range(len(words) - 1):  # segura a palavra até a próxima se o buraco for curto
    if words[i + 1]["start"] - words[i]["end"] < 0.45: words[i]["end"] = words[i + 1]["start"]
words[-1]["end"] = 19.85

# --- linha do tempo do vídeo ---
DROP, LAND, DUR = 2.35, 17.12, 19.9
M0 = round(29.57 - LAND, 3)          # 12.45 → drop da música (14.8) cai em V=2.35
SLOW = 95 / 30
segments = [
  {"from": 12.3, "to": 12.3 + DROP},                       # gancho: mortal sobre as pedras
  {"from": 2.0, "to": 13.0},                               # história (decolagem clipe 12.25 → V 12.6)
  {"src": "input/snow_slow.mp4", "from": 0, "to": SLOW},   # câmera lenta V 13.35–16.52
  {"from": 14.8, "to": 14.8 + (DUR - (DROP + 11.0 + SLOW))}, # aterrissagem clipe 15.40 → V 17.12
]
beats = [round(29.57 + n * 0.4625 - M0, 3) for n in range(8) if 29.57 + n * 0.4625 - M0 < DUR]
props = {
  "style": "clean", "handle": "@ClarkClips", "captionY": 0.77,
  "durationInSeconds": DUR,
  "clip": "input/snow.mp4", "segments": segments, "clipVolume": 0,
  "narration": "input/narracao_sync.wav", "narrationVolume": 1.0,
  "music": "input/montagem.m4a", "musicStartFrom": M0, "musicFadeOut": 0.5, "musicVolume": 1,
  # música baixa sob a voz, abre no drop, explode na aterrissagem e volta a abaixar sob o CTA
  "musicEnvelope": [[0, 0.3], [DROP - 0.05, 0.3], [DROP, 0.42], [LAND - 0.1, 0.36], [LAND, 0.95], [LAND + 0.55, 0.95], [LAND + 0.75, 0.42], [DUR, 0.42]],
  "words": words,
  "arrows": [{"start": 0, "end": 2.2, "x": 0.45, "y": 0.5, "angle": -25, "size": 0.25,
              "track": [{"t": 0.5, "x": 0.45, "y": 0.5}, {"t": 1.1, "x": 0.5, "y": 0.36}, {"t": 1.7, "x": 0.58, "y": 0.33}]}],
  "circles": [{"start": 3.4, "end": 4.95, "x": 0.6, "y": 0.43, "radius": 0.13,
               "track": [{"t": 3.4, "x": 0.6, "y": 0.42}, {"t": 3.75, "x": 0.6, "y": 0.44}, {"t": 4.55, "x": 0.5, "y": 0.45}]}],
  "transitions": [{"at": DROP, "type": "flash"}],
  "beats": beats, "beatZoom": 1.08,
  "shakes": [{"at": LAND, "dur": 0.45, "amount": 30}],
  "sfx": [
    {"at": 0, "src": "sfx/riser.wav", "volume": 0.3, "duration": DROP},
    {"at": 12.45, "src": "sfx/whoosh.wav", "volume": 0.5},
    {"at": LAND, "src": "sfx/impact.wav", "volume": 0.7},
  ],
  "kenBurns": 1.05,
}
json.dump(props, open(OUT_PROPS, "w"), ensure_ascii=False, indent=2)
print("M0", M0, "beats", beats)
print(" ".join(f"{w['text']}@{w['start']}" for w in words))
