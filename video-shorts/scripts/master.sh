#!/usr/bin/env bash
# Masteriza o áudio do render: limitador + loudness -14 LUFS (padrão YouTube/TikTok), vídeo copiado sem perda.
# Uso: bash scripts/master.sh out/video.mp4 [saida.mp4]
set -e
IN="$1"; OUT="${2:-${1%.mp4}_final.mp4}"
VD=$(ffprobe -v error -select_streams v:0 -show_entries stream=duration -of default=nw=1:nk=1 "$IN")
ffmpeg -hide_banner -loglevel error -y -i "$IN" -t "$VD" -c:v copy \
  -af "alimiter=limit=0.8:attack=2:release=60:level=disabled,loudnorm=I=-14:TP=-1.5:LRA=9,aresample=48000" \
  -c:a aac -b:a 192k -movflags +faststart "$OUT"
echo "→ $OUT"
