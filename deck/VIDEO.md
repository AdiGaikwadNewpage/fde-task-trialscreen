# Making the video

Three commands produce a complete 7:17 silent cut. You record one voice track over it.

```bash
npm run dev                      # in the project root, leave it running
node deck/record-deck.mjs        # slides 1-6 and 7-9, held to the script timings
node deck/record-demo.mjs        # the live app, driven and captured automatically
./deck/build-video.sh            # joins them → deck/out/silent-cut.mp4
```

Then record your narration against `silent-cut.mp4` — play it back and read `SCRIPT.md`
over the top — and assemble:

```bash
./deck/build-video.sh ~/Desktop/voice.m4a   # → deck/out/trialscreen-pitch.mp4
```

The audio is normalised to −16 LUFS, which is what every platform expects for speech.

## What each piece runs to

| Segment | Length | Script section |
|---|---|---|
| `deck-intro.mp4` | 3:03 | Cover through the demo handoff (slides 1–6) |
| `demo.mp4` | 2:31 | The live app |
| `deck-outro.mp4` | 1:44 | Architecture, evidence, close (slides 7–9) |
| **`silent-cut.mp4`** | **7:17** | Everything |

## Adjusting the pace

The demo recording scales with one number:

```bash
PACE=2.6 node deck/record-demo.mjs   # slower, more room to talk
PACE=1.8 node deck/record-demo.mjs   # tighter
```

Deck timings live in the `INTRO` and `OUTRO` arrays at the top of `record-deck.mjs`, in
seconds per slide. They match the timings in `SCRIPT.md` — change both together.

## Recording your voice

Nothing fancy is needed. QuickTime Player → File → New Audio Recording, or Voice Memos.
Three things matter more than the microphone:

- **A quiet room with soft furnishings.** Room echo is the one thing you cannot fix later.
- **A consistent distance** from the mic — about a hand's width, slightly off to the side
  so plosives don't thump.
- **Leave two seconds of silence** at the start. It gives `loudnorm` a noise floor to read
  and gives you a clean handle for trimming.

Record it in one take against the silent cut. If you fluff a line, pause, and say it again
— it is far easier to cut a retake out of one continuous file than to stitch takes.

## If you would rather present it live

Skip all of this. Open `deck/index.html`, press `F`, and drive it yourself with the
shot list in `RECORDING-GUIDE.md`. The recorded demo exists to make the screen half
repeatable, not to replace you.
