# EXE-EDITOR-

## Offline Expo Video Editor

A starter React Native (Expo) app that uses `ffmpeg-kit-react-native` for local video/audio processing and offline export.

### What it includes

- `App.tsx` with video + audio picker UI
- volume mixing sliders for original video and MP3 audio
- audio trim controls for MP3 overlay start/end
- speed presets (0.5x, 1x, 2x)
- aspect ratio presets (9:16, 16:9, 1:1)
- offline FFmpeg export using on-device processing
- `upload-apk-dropbox.sh` helper script for Dropbox upload

### Packages installed

- `expo` ~57.0.1
- `ffmpeg-kit-react-native` ^6.0.2
- `expo-document-picker` ~57.0.1
- `expo-file-system` ~57.0.0
- `expo-media-library` ~57.0.3
- `@react-native-community/slider` ^4.3.0

### Setup

```bash
npm install --legacy-peer-deps
```

### Run locally

```bash
npx expo start
```

### Android APK build

This project is configured for EAS build. Use the following commands after authenticating with Expo:

```bash
npx eas login --no-browser
npx eas build --platform android --profile production --local
```

If your environment requires remote build, use:

```bash
npx eas build --platform android --profile production
```

### APK upload to Dropbox

Set your Dropbox API token and run the helper script:

```bash
export DROPBOX_TOKEN="your_dropbox_token"
./upload-apk-dropbox.sh path/to/app.apk /Apps/EXE-EDITOR/app.apk
```

### Notes

- The app is built to work on Android 14/15 devices and modern tablets.
- The export flow saves the output video to the device gallery using `expo-media-library`.
- EAS login is required for APK generation in this environment.
