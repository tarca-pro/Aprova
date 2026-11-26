# Análise frame a frame das 3 referências

| | v1 "O homem que desafiou a lógica…" | v2 "Ele passou dos limites…" | v3 "Por pouco isso não terminou mal" |
|---|---|---|---|
| Formato | 720×1280, 30 fps, H.264 + AAC 44,1 kHz | igual | igual |
| Duração | 18,6 s | 15,0 s | 17,1 s |
| Palavras narradas | 62 (≈3,4 palavras/s) | 52 (≈3,5/s) | 70 (≈4,1/s) |
| Estilo de legenda | **comic** | **clean** + `@conexãocuriosa` | **clean** + `@conexãocuriosa` |

## Estrutura (igual nos 3)
1. **0–1 s – gancho**: frase de impacto ("O que esse homem fez foi surreal", "Eu tenho quase certeza que você não esperava…", "Esse ciclista passou por um dos maiores sustos da vida dele") + **seta vermelha 3D** apontando para o personagem.
2. **Contexto** (onde/quem), cortes no clipe cobertos por **transição de luz**.
3. **Momento-chave** destacado com **círculo** vermelho (v2/v3) ou laranja (v1) que **segue o objeto**.
4. **Desfecho** + **CTA** no fim: "se inscreve para mais curiosidades" / "comenta aqui embaixo" / "se inscreve pra não perder a próxima".

## Legendas (1 palavra por vez, troca a cada 0,2–0,5 s, corte seco entre palavras)
- **comic (v1)**: fonte *Bangers* (condensada itálica de HQ), MAIÚSCULAS, contorno preto grosso + sombra.
  Cores alternadas sem repetir: branco `#FFFFFF`, amarelo `#F7F31C`, verde `#3FEA1F`, ciano `#22E3EA`.
  Entrada: 1º frame com **borrão de movimento horizontal**, 2º frame meio borrado, 3º nítido. Centro em y = 77,7 %.
- **clean (v2/v3)**: *Montserrat ExtraBold*, minúsculas, branco, contorno preto + sombra deslocada para baixo-direita.
  Sem animação de entrada. y = 78 % (v2) / 65 % (v3). Marca d'água `@conexãocuriosa` (branco ~80 %, fonte pequena) logo abaixo.

## Gráficos
- **Seta**: vermelha `#FF0A0A`, extrusão preta (efeito 3D), aparece em 0 s e some ~1 s; fica "cutucando" na direção que aponta (~3,5 Hz) e acompanha o alvo.
- **Círculo**: anel sem preenchimento, traço ~11 px (em 1080p), aparece seco (pop), segue o alvo e some junto com uma transição.

## Transições (medidas frame a frame)
- **flash** (v2 2,3 s / v3 2,8 s, 8,1 s, 11,5 s, 15,4 s) — 11 frames: f0 tom quente laranja/rosa → f1–f4 **branco estourado** (o corte acontece aqui) → f5 amarelo → f6–f9 laranja/rosa diminuindo → normal.
- **leak** (v1 3,7 s) — vazamento laranja/rosa vindo do canto inferior direito, ~8 frames, sem estourar.
- **zoomBlur** (v1 15,0 s) — 6 frames de zoom acelerando (1→1,35) com desfoque crescente, corte, 9 frames assentando (1,25→1) com desfoque sumindo.

## Cor
Saturação e contraste levemente aumentados (céu bem azul, vermelhos fortes). Template: `saturate 1.18 · contrast 1.07 · brightness 1.02` + zoom lento contínuo de 6 %.

## Som
- **Narração** em primeiro plano (voz de TTS masculina, ritmo rápido, sem pausas longas), loudness integrado −25 a −31 LUFS.
- **Música** de fundo baixa (~−28 dB), batida constante ~140 BPM (bumbos visíveis no espectrograma do v3).
- **Efeitos**: impacto/boom grave nas transições flash (v2 11,2 s), whoosh nos cortes, tom de suspense sustentado (~900/1800 Hz) no v3 de 5,8 s a 9,3 s, durante "ele veio em alta velocidade sem imaginar…".
