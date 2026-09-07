#!/usr/bin/env bash
#
# optimize-media.sh — compress launch photos and videos before committing them.
#
# Run this BEFORE `git add`. Large media in a git repo is permanent: every
# version you ever push stays in history, and the repo never shrinks again.
#
# Usage:
#   ./tools/optimize-media.sh raw/            # raw/ holds originals off-repo
#
# Outputs into ./Photos and ./Videos, ready to commit.
#
# Needs: ffmpeg (video + posters), ImageMagick (photos).
#   macOS:  brew install ffmpeg imagemagick
#
set -euo pipefail

SRC="${1:-raw}"
[ -d "$SRC" ] || { echo "No such folder: $SRC"; exit 1; }

mkdir -p Photos Videos

need() { command -v "$1" >/dev/null || { echo "Missing: $1"; exit 1; }; }
need ffmpeg
need magick 2>/dev/null || need convert

IM=$(command -v magick || command -v convert)

echo "── Photos ─────────────────────────────────────────────"
shopt -s nullglob nocaseglob
for f in "$SRC"/*.{jpg,jpeg,png,heic}; do
  base=$(basename "${f%.*}")
  out="Photos/${base}.jpg"
  "$IM" "$f" -auto-orient -resize '1400x1400>' -strip -quality 82 "$out"
  printf '  %-40s %s\n' "$(basename "$f")" "$(du -h "$out" | cut -f1)"
done

echo "── Videos ─────────────────────────────────────────────"
for f in "$SRC"/*.{mp4,mov,m4v}; do
  base=$(basename "${f%.*}")
  out="Videos/${base}.mp4"

  # 720p, CRF 28, faststart so playback begins before the file finishes loading
  ffmpeg -loglevel error -y -i "$f" \
    -vf "scale='min(1280,iw)':-2" \
    -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p \
    -c:a aac -b:a 128k \
    -movflags +faststart \
    "$out"

  # poster frame at 3s — without this the slide is a black box until play
  ffmpeg -loglevel error -y -i "$out" -ss 3 -vframes 1 -q:v 3 \
    "Photos/poster-${base}.jpg"

  size=$(du -m "$out" | cut -f1)
  printf '  %-40s %sM' "$(basename "$f")" "$size"
  if [ "$size" -gt 15 ]; then
    printf '  ← TOO BIG. Put this one on YouTube and use a { type: "youtube" } slide.'
  fi
  printf '\n'
done

echo
echo "Done. Now list the filenames in assets/media.js."
echo "Anything over 15 MB should go to YouTube instead of into the repo."
