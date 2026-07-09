#!/usr/bin/env bash
# Phase 5: FFmpeg stitch — convert WebM clips, overlay narration, export final MP4.
# Run: bash scripts/stitch-demo.sh
# Output: scripts/demo-video-final.mp4
#
# Requires: ffmpeg (confirmed at /Users/higgi/.local/bin/ffmpeg v7.0)
#           All .webm files in scripts/demo-clips/
#           All .mp3 files in scripts/demo-audio/

set -euo pipefail

FFMPEG="/Users/higgi/.local/bin/ffmpeg"
CLIPS="scripts/demo-clips"
AUDIO="scripts/demo-audio"
WORK="scripts/demo-work"
OUT="scripts/demo-video-final.mp4"

echo "Hunter's Holistic Health - FFmpeg Stitch"
echo "========================================="

# ── check dependencies ────────────────────────────────────────────────────────
if [ ! -f "$FFMPEG" ]; then
  echo "ERROR: ffmpeg not found at $FFMPEG"
  exit 1
fi

mkdir -p "$WORK"

# ── step 1: find and convert WebM clips to MP4 ───────────────────────────────
echo ""
echo "── Step 1: Converting WebM clips to MP4 ──"

# Playwright names clips with random UUIDs. Map them by creation time order.
WEBM_FILES=($(ls -t "$CLIPS"/*.webm 2>/dev/null))

if [ ${#WEBM_FILES[@]} -eq 0 ]; then
  echo "ERROR: No .webm files found in $CLIPS/"
  echo "Run: node scripts/record-demo-video.mjs first"
  exit 1
fi

echo "Found ${#WEBM_FILES[@]} clip(s)"

# Playwright saves clips in close() order. ls -t gives newest-first.
# Reverse to get oldest-first = scene order 1..N.
ORDERED=($(ls -t "$CLIPS"/*.webm 2>/dev/null | tail -r))

SCENE_LABELS=(landing bp-tool signup-privacy feed protocol tracker leaderboard educator outro)

for i in "${!ORDERED[@]}"; do
  WEBM="${ORDERED[$i]}"
  LABEL="${SCENE_LABELS[$i]:-scene-$((i+1))}"
  OUT_MP4="$WORK/clip-$(printf '%02d' $((i+1)))-${LABEL}.mp4"

  echo "  Converting clip $((i+1)): $LABEL"
  "$FFMPEG" -y -i "$WEBM" \
    -c:v libx264 -preset fast -crf 23 \
    -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" \
    -r 30 -pix_fmt yuv420p \
    "$OUT_MP4" -loglevel error
  echo "  OK   $OUT_MP4"
done

# ── step 2: overlay audio on each clip ───────────────────────────────────────
echo ""
echo "── Step 2: Overlaying narration audio ──"

AUDIO_FILES=(
  "$AUDIO/scene-01-problem.mp3"
  "$AUDIO/scene-02-free-tools.mp3"
  "$AUDIO/scene-03-signup-privacy.mp3"
  "$AUDIO/scene-04-community.mp3"
  "$AUDIO/scene-05-protocol.mp3"
  "$AUDIO/scene-06-tracking.mp3"
  "$AUDIO/scene-07-leaderboard.mp3"
  "$AUDIO/scene-08-educator.mp3"
  "$AUDIO/scene-09-outro.mp3"
)

MIXED=()
for i in "${!AUDIO_FILES[@]}"; do
  MP4="$WORK/clip-$(printf '%02d' $((i+1)))-${SCENE_LABELS[$i]:-scene-$((i+1))}.mp4"
  AUDIO_FILE="${AUDIO_FILES[$i]}"
  MIXED_OUT="$WORK/mixed-$(printf '%02d' $((i+1))).mp4"

  if [ ! -f "$MP4" ]; then
    echo "  SKIP scene $((i+1)) - no clip found"
    continue
  fi

  if [ ! -f "$AUDIO_FILE" ]; then
    echo "  WARN scene $((i+1)) - no audio, copying video only"
    cp "$MP4" "$MIXED_OUT"
    MIXED+=("$MIXED_OUT")
    continue
  fi

  echo "  Mixing scene $((i+1))..."

  # Overlay narration audio onto silent video clip (Playwright clips have no audio track)
  "$FFMPEG" -y \
    -i "$MP4" \
    -i "$AUDIO_FILE" \
    -map "0:v" -map "1:a" \
    -c:v copy -c:a aac -b:a 192k \
    -shortest \
    "$MIXED_OUT" -loglevel error

  echo "  OK   mixed scene $((i+1))"
  MIXED+=("$MIXED_OUT")
done

# ── step 3: build concat list ─────────────────────────────────────────────────
echo ""
echo "── Step 3: Concatenating ${#MIXED[@]} scene(s) ──"

CONCAT_LIST="$WORK/concat.txt"
> "$CONCAT_LIST"
for f in "${MIXED[@]}"; do
  echo "file '$(realpath "$f")'" >> "$CONCAT_LIST"
done

cat "$CONCAT_LIST"

# ── step 4: final concat ──────────────────────────────────────────────────────
echo ""
echo "── Step 4: Exporting final video ──"

"$FFMPEG" -y \
  -f concat -safe 0 -i "$CONCAT_LIST" \
  -c:v libx264 -preset fast -crf 20 \
  -c:a aac -b:a 192k \
  -movflags +faststart \
  "$OUT" -loglevel error

FILESIZE=$(du -sh "$OUT" | cut -f1)
DURATION=$("$FFMPEG" -i "$OUT" 2>&1 | grep Duration | awk '{print $2}' | tr -d ',')

echo ""
echo "========================================="
echo "Done!"
echo "  Output: $OUT"
echo "  Size:   $FILESIZE"
echo "  Length: $DURATION"
echo ""
echo "Clean up work files: rm -rf $WORK"
