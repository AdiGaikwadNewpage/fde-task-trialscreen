#!/usr/bin/env bash
# Assembles the pitch video.
#
#   ./deck/build-video.sh                 # silent cut, for recording voice against
#   ./deck/build-video.sh voice.m4a       # final cut with your narration
#
# Expects deck/out/{deck-intro,demo,deck-outro}.mp4, produced by:
#   node deck/record-deck.mjs
#   node deck/record-demo.mjs
set -euo pipefail

cd "$(dirname "$0")/out"
VOICE="${1:-}"

for f in deck-intro.mp4 demo.mp4 deck-outro.mp4; do
  [ -f "$f" ] || { echo "missing $f — run the record-*.mjs scripts first"; exit 1; }
done

printf "file '%s'\n" deck-intro.mp4 demo.mp4 deck-outro.mp4 > concat.txt

# Same codec and geometry throughout, so the segments join without re-encoding.
ffmpeg -v error -y -f concat -safe 0 -i concat.txt -c copy silent-cut.mp4
echo "silent cut  → deck/out/silent-cut.mp4  ($(ffprobe -v error -show_entries format=duration -of csv=p=0 silent-cut.mp4 | cut -d. -f1)s)"

if [ -n "$VOICE" ]; then
  [ -f "$VOICE" ] || { echo "no such audio file: $VOICE"; exit 1; }
  # loudnorm brings spoken audio to the -16 LUFS that every platform expects,
  # so it does not arrive quiet next to everything else in the viewer's day.
  ffmpeg -v error -y -i silent-cut.mp4 -i "$VOICE" \
    -filter:a "loudnorm=I=-16:TP=-1.5:LRA=11" \
    -c:v copy -c:a aac -b:a 192k -shortest trialscreen-pitch.mp4
  echo "final cut   → deck/out/trialscreen-pitch.mp4"
fi

rm -f concat.txt
