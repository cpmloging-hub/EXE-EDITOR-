export default {
  expo: {
    name: "EXE Editor",
    slug: "exe-editor",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    splash: {
      backgroundColor: "#000000"
    },
    plugins: [
      "ffmpeg-kit-react-native"
    ],
    android: {
      package: "com.example.exeeditor",
      versionCode: 1,
      permissions: [
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_MEDIA_LOCATION"
      ]
    },
    ios: {
      bundleIdentifier: "com.example.exeeditor"
    }
  }
};
