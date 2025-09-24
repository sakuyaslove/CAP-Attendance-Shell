import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PrivacyScreen = (): React.ReactElement => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy & Data Handling</Text>
        <Text style={styles.paragraph}>
          CAP Attendance Shell keeps all authentication and attendance workflows
          inside a secure embedded browser session. The app never proxies
          requests, stores credentials, or modifies the third-party site beyond
          injecting values that you explicitly capture.
        </Text>
        <Text style={styles.subtitle}>Barcode Scanning</Text>
        <Text style={styles.paragraph}>
          Scanning runs entirely on-device using the camera. Detected codes are
          passed straight into the currently focused input field inside the
          WebView. No scan results leave your device, and there are no
          background uploads or analytics.
        </Text>
        <Text style={styles.subtitle}>Permissions</Text>
        <Text style={styles.paragraph}>
          Camera access is requested only when you open the scanner. You can
          revoke permission at any time from your system settings. Without
          camera permission you can still paste values from the clipboard as a
          manual fallback.
        </Text>
        <Text style={styles.subtitle}>Storage</Text>
        <Text style={styles.paragraph}>
          Cookies and local storage provided by capnhq.gov persist just like the
          system browser so you stay signed in. The app does not read or export
          that data.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '500',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2f2f2f',
  },
});

export default PrivacyScreen;
