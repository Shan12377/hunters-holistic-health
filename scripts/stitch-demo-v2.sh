#!/usr/bin/env bash
# Phase 5 v2: Stitch with crossfade transitions between scenes.
# Run: bash scripts/stitch-demo-v2.sh
# Output: scripts/demo-video-v2-final.mp4

set -euo pipefail

FFMPEG="/Users/higgi/.local/bin/ffmpeg"
CLIPS="scripts/demo-clips-v2"
AUDIO="scripts/demo-audio-v2"
WORK="scripts/demo-work-v2"
HOOK="scripts/hook/hook-clip-B-waiting-room.mp4"
OUT="scripts/demo-video-v2-final.mp4"
FADE_DUR=0.4   # crossfade duration in seconds

echo "Hunter's Holistic Health — FFmpeg Stitch v2"
echo "============================================="

[ ! -f "$FFMPEG" ] && echo "ERROR: ffmpeg not found" && exit 1

mkdir -p "$WORK"

# ── Step 1: Convert WebM clips → MP4 in scene order (oldest first) ───────────
echo ""
echo "── Step 1: Converting clips ──"

ORDERED=($(ls -t "$CLIPS"/*.webm 2>/dev/null | tail -r))
[ ${#ORDERED[@]} -eq 0 ] && echo "ERROR: No .webm files in $CLIPS/" && exit 1
echo "Found ${#ORDERED[@]} clip(s)"

SCENE_LABELS=(landing bp-tool signup-privacy meal-guard community protocol tracker educator outro)
RAW_MP4S=()

for i in "${!ORDERED[@]}"; do
  LABEL="${SCENE_LABELS[$i]:-scene-$((i+1))}"
  OUT_MP4="$WORK/raw-$(printf '%02d' $((i+1)))-${LABEL}.mp4"
  echo "  Converting clip $((i+1)): $LABEL"
  "$FFMPEG" -y -i "${ORDERED[$i]}" \
    -c:v libx264 -preset fast -crf 23 \
    -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" \
    -r 30 -pix_fmt yuv420p \
    "$OUT_MP4" -loglevel error
  RAW_MP4S+=("$OUT_MP4")
  echo "  OK   $OUT_MP4"
done

# ── Step 2: Overlay narration (freeze last frame to fill audio) ───────────────
echo ""
echo "── Step 2: Overlaying narration ──"

AUDIO_FILES=(
  "$AUDIO/scene-01-problem.mp3"
  "$AUDIO/scene-02-free-tools.mp3"
  "$AUDIO/scene-03-signup-privacy.mp3"
  "$AUDIO/scene-04-meal-guard.mp3"
  "$AUDIO/scene-05-community.mp3"
  "$AUDIO/scene-06-protocol.mp3"
  "$AUDIO/scene-07-tracking.mp3"
  "$AUDIO/scene-08-educator.mp3"
  "$AUDIO/scene-09-outro.mp3"
)

MIXED=()
for i in "${!RAW_MP4S[@]}"; do
  MP4="${RAW_MP4S[$i]}"
  AUDIO_FILE="${AUDIO_FILES[$i]:-}"
  MIXED_OUT="$WORK/mixed-$(printf '%02d' $((i+1))).mp4"

  if [ ! -f "$AUDIO_FILE" ]; then
    echo "  WARN scene $((i+1)) — no audio, copying video only"
    cp "$MP4" "$MIXED_OUT"
    MIXED+=("$MIXED_OUT")
    continue
  fi

  echo "  Mixing scene $((i+1))..."
  "$FFMPEG" -y \
    -i "$MP4" \
    -i "$AUDIO_FILE" \
    -filter_complex "[0:v]tpad=stop_mode=clone:stop_duration=120[vout]" \
    -map "[vout]" -map "1:a" \
    -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p \
    -c:a aac -b:a 192k \
    -shortest \
    "$MIXED_OUT" -loglevel error
  echo "  OK   mixed $((i+1))"
  MIXED+=("$MIXED_OUT")
done

# ── Step 3: Add silent audio to hook clip ─────────────────────────────────────
echo ""
echo "── Step 3: Preparing hook clip ──"
HOOK_WITH_AUDIO="$WORK/hook-silent.mp4"
"$FFMPEG" -y \
  -i "$HOOK" \
  -f lavfi -i anullsrc=r=44100:cl=mono \
  -map 0:v -map 1:a \
  -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p \
  -c:a aac -b:a 192k \
  -shortest \
  "$HOOK_WITH_AUDIO" -loglevel error
echo "  OK   hook with silent audio"

# ── Step 4: Concat hook + all scenes using filter_complex ─────────────────────
echo ""
echo "── Step 4: Concatenating $(( ${#MIXED[@]} + 1 )) clips (hook + ${#MIXED[@]} scenes) ──"

ALL=("$HOOK_WITH_AUDIO" "${MIXED[@]}")
N=${#ALL[@]}

INPUT_ARGS=()
FILTER=""
for i in "${!ALL[@]}"; do
  INPUT_ARGS+=(-i "${ALL[$i]}")
  FILTER+="[${i}:v][${i}:a]"
done
FILTER+="concat=n=${N}:v=1:a=1[v][a]"

"$FFMPEG" -y \
  "${INPUT_ARGS[@]}" \
  -filter_complex "$FILTER" \
  -map "[v]" -map "[a]" \
  -c:v libx264 -preset fast -crf 20 \
  -c:a aac -b:a 192k \
  -movflags +faststart \
  "$OUT" -loglevel error

FILESIZE=$(du -sh "$OUT" | cut -f1)
DURATION=$("$FFMPEG" -i "$OUT" 2>&1 | grep Duration | awk '{print $2}' | tr -d ',')

echo ""
echo "============================================="
echo "Done!"
echo "  Output:   $OUT"
echo "  Size:     $FILESIZE"
echo "  Duration: $DURATION"
