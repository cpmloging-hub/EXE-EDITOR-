import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, Alert, ActivityIndicator, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import * as DocumentPicker from 'expo-document-picker';
import FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { FFmpegKit } from 'ffmpeg-kit-react-native';

const aspectPresets = [
  { label: '9:16', value: '9:16' },
  { label: '16:9', value: '16:9' },
  { label: '1:1', value: '1:1' }
];

const speedPresets = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '2x', value: 2 }
];

export default function App() {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [videoVolume, setVideoVolume] = useState(1);
  const [musicVolume, setMusicVolume] = useState(1);
  const [musicStart, setMusicStart] = useState(0);
  const [musicEnd, setMusicEnd] = useState(10);
  const [speed, setSpeed] = useState(1);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isExporting, setIsExporting] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    MediaLibrary.requestPermissionsAsync().then(result => {
      setPermissionsGranted(result.granted);
    });
  }, []);

  const pickVideo = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'video/*', copyToCacheDirectory: true });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const pickAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setAudioUri(result.assets[0].uri);
    }
  };

  const getAspectFilter = () => {
    if (!videoUri) return '';
    switch (aspectRatio) {
      case '9:16':
        return 'crop=in_w:in_h:0:0,scale=720:1280';
      case '1:1':
        return 'crop=in_h:in_h:0:0,scale=1080:1080';
      default:
        return 'scale=1920:1080';
    }
  };

  const quotePath = (path: string) => `"${path.replace(/"/g, '\\"')}"`;

  const buildFFmpegCommand = (outputPath: string) => {
    if (!videoUri || !audioUri) throw new Error('Missing video or audio file');

    const aspectFilter = getAspectFilter();
    const videoSpeed = speed !== 1 ? `setpts=${1 / speed}*PTS` : '';
    const audioSpeed = speed !== 1 ? `atempo=${speed}` : '';

    const audioTrim = `atrim=start=${musicStart}:end=${musicEnd},asetpts=N/SR/TB`;
    const audioFilter = `${audioTrim},volume=${musicVolume}${audioSpeed ? `,${audioSpeed}` : ''}`;
    const videoVolumeFilter = `volume=${videoVolume}`;

    const filterComplex = `[0:v]${videoSpeed}${aspectFilter ? `,${aspectFilter}` : ''}[v]; [0:a]${videoVolumeFilter}[a0]; [1:a]${audioFilter}[a1]; [a0][a1]amix=inputs=2:duration=first:dropout_transition=2[a]`;

    return `-y -i ${quotePath(videoUri)} -i ${quotePath(audioUri)} -filter_complex ${quotePath(filterComplex)} -map [v] -map [a] -c:v libx264 -c:a aac -b:a 192k -preset fast ${quotePath(outputPath)}`;
  };

  const exportVideo = async () => {
    if (!videoUri || !audioUri) {
      Alert.alert('Missing files', 'Please select both a video and an audio track.');
      return;
    }
    if (!permissionsGranted) {
      Alert.alert('Permissions', 'Please grant media library permissions and try again.');
      return;
    }

    setIsExporting(true);
    const outputFilename = `edited_${Date.now()}.mp4`;
    const cacheDir = (FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory || '';
    const outputPath = `${cacheDir}${outputFilename}`;
    const command = buildFFmpegCommand(outputPath);

    try {
      await FFmpegKit.execute(command);
      const asset = await MediaLibrary.createAssetAsync(outputPath);
      await MediaLibrary.createAlbumAsync('EXE Editor', asset, false);
      Alert.alert('Export complete', 'Video saved to your gallery.');
    } catch (error) {
      console.error(error);
      Alert.alert('Export failed', 'An error occurred while processing the video.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Offline Video Editor</Text>
      <Button title={videoUri ? 'Change Video' : 'Pick Video'} onPress={pickVideo} />
      <Text style={styles.fileText}>{videoUri ?? 'No video selected'}</Text>
      <Button title={audioUri ? 'Change Audio' : 'Pick Audio'} onPress={pickAudio} />
      <Text style={styles.fileText}>{audioUri ?? 'No audio selected'}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Volume Mix</Text>
        <Text>Video Audio: {videoVolume.toFixed(2)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={2}
          value={videoVolume}
          onValueChange={setVideoVolume}
          minimumTrackTintColor="#1EB1FC"
          maximumTrackTintColor="#d3d3d3"
        />
        <Text>Music Audio: {musicVolume.toFixed(2)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={2}
          value={musicVolume}
          onValueChange={setMusicVolume}
          minimumTrackTintColor="#1EB1FC"
          maximumTrackTintColor="#d3d3d3"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Music Trim</Text>
        <Text>Start: {musicStart.toFixed(1)} sec</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={60}
          step={0.5}
          value={musicStart}
          onValueChange={setMusicStart}
        />
        <Text>End: {musicEnd.toFixed(1)} sec</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={180}
          step={0.5}
          value={musicEnd}
          onValueChange={setMusicEnd}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Speed</Text>
        <View style={styles.presetRow}>
          {speedPresets.map(preset => (
            <Button key={preset.value} title={preset.label} onPress={() => setSpeed(preset.value)} />
          ))}
        </View>
        <Text style={styles.settingText}>Selected: {speed.toFixed(1)}x</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aspect Ratio</Text>
        <View style={styles.presetRow}>
          {aspectPresets.map(preset => (
            <Button key={preset.value} title={preset.label} onPress={() => setAspectRatio(preset.value)} />
          ))}
        </View>
        <Text style={styles.settingText}>{aspectRatio}</Text>
      </View>

      <View style={styles.exportSection}>
        <Button title={isExporting ? 'Exporting...' : 'Export Offline'} onPress={exportVideo} disabled={isExporting} />
        {isExporting && <ActivityIndicator style={styles.loader} size="large" color="#1EB1FC" />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212'
  },
  contentContainer: {
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16
  },
  fileText: {
    color: '#CCCCCC',
    marginBottom: 16
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 8
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 12
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8
  },
  settingText: {
    color: '#E0E0E0',
    marginTop: 8
  },
  exportSection: {
    marginTop: 20
  },
  loader: {
    marginTop: 16
  }
});
