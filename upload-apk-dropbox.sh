#!/bin/bash
# Upload an APK to Dropbox using a Bearer token stored in $DROPBOX_TOKEN.
# Usage: ./upload-apk-dropbox.sh path/to/app.apk /Apps/EXE-EDITOR/app.apk

set -euo pipefail

if [[ -z "${DROPBOX_TOKEN:-}" ]]; then
  echo "ERROR: DROPBOX_TOKEN is not set. Export your Dropbox API token first."
  exit 1
fi

APK_PATH="$1"
DROPBOX_PATH="$2"

if [[ ! -f "$APK_PATH" ]]; then
  echo "ERROR: APK file not found: $APK_PATH"
  exit 1
fi

curl -X POST https://content.dropboxapi.com/2/files/upload \
  --header "Authorization: Bearer $DROPBOX_TOKEN" \
  --header "Dropbox-API-Arg: {\"path\": \"$DROPBOX_PATH\", \"mode\": \"overwrite\", \"autorename\": false, \"mute\": false}" \
  --header "Content-Type: application/octet-stream" \
  --data-binary @"$APK_PATH"

echo "Uploaded $APK_PATH to Dropbox path $DROPBOX_PATH"
