#!/usr/bin/env bash
# Gera os efeitos sonoros usados nas referências (sintetizados, livres de direitos).
set -e
cd "$(dirname "$0")/../public/sfx"
FF="ffmpeg -hide_banner -loglevel error -y"
# Whoosh: ruído rosa com passa-banda varrendo grave->agudo->grave, envelope em sino (0.6s)
$FF -f lavfi -i "anoisesrc=color=pink:duration=0.6:sample_rate=44100" -af "bandpass=f=900:w=1.2,volume='exp(-pow((t-0.32)/0.13,2))*24':eval=frame,aphaser=type=t:speed=2,alimiter=limit=0.8,afade=t=out:st=0.5:d=0.1" -ac 2 whoosh.wav
# Impacto/boom grave (queda de 90Hz para 35Hz) + estalo inicial – usado no flash
$FF -f lavfi -i "aevalsrc='0.9*sin(2*PI*(35*t+55*(1-exp(-t*6))/6*6))*exp(-t*4)+0.25*(random(0)-0.5)*exp(-t*40)':d=1.1:s=44100" -af "lowpass=f=400,volume=1.6,alimiter" -ac 2 impact.wav
# Flash: whoosh curto + impacto juntos
$FF -i whoosh.wav -i impact.wav -filter_complex "[1]adelay=280|280[b];[0][b]amix=inputs=2:normalize=0,alimiter" flash.wav
# Riser de suspense (tom sustentado ~900/1800Hz, como no v3 de 5.8s a 9.3s)
$FF -f lavfi -i "aevalsrc='0.18*sin(2*PI*(880+120*t/3.5)*t)+0.08*sin(2*PI*(1760+240*t/3.5)*t)':d=3.5:s=44100" -af "afade=t=in:d=0.8,afade=t=out:st=3.1:d=0.4,tremolo=f=6:d=0.3" -ac 2 riser.wav
# Pop (aparição de seta/círculo)
$FF -f lavfi -i "aevalsrc='0.7*sin(2*PI*(1200-900*t/0.08)*t)*exp(-t*45)':d=0.12:s=44100" -ac 2 pop.wav
# Zoom-blur swoosh (transição do v1 aos 15s): ruído branco filtrado subindo
$FF -f lavfi -i "anoisesrc=color=white:duration=0.5:sample_rate=44100" -af "highpass=f=1500,lowpass=f=7000,volume='min(1,t/0.25)*exp(-max(0,t-0.25)*14)*1.2':eval=frame" -ac 2 swoosh.wav
ls -la
