import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  BackHandler,
} from 'react-native';
import HapticFeedback from 'react-native-haptic-feedback';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { WebView } from 'react-native-webview';
import type {
  WebViewErrorEvent,
  WebViewNavigation,
  WebViewProgressEvent,
} from 'react-native-webview/lib/WebViewTypes';
import AppHeader from '../components/AppHeader';
import LoadingProgressBar from '../components/LoadingProgressBar';
import ScannerModal from '../components/ScannerModal';
import {
  ATTENDANCE_URL,
  ENABLE_ATTENDANCE_BUTTON,
  HOME_URL,
} from '../config/appConfig';
import {
  buildFillCommand,
  INJECT_BEFORE_LOAD,
} from '../injection/injectedScripts';
import { RootStackParamList } from '../navigation/AppNavigator';

const ALLOWED_HOST = 'www.capnhq.gov';
const MOCK_TEST_HTML = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" /></head><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 16px"><h1>CAP Attendance Shell Mock</h1><p data-testid="mock-description">This page is only used during automated tests.</p><input id="first" type="text" placeholder="First input" autofocus /><input id="second" type="text" placeholder="Second input" style="margin-top:12px" /><textarea id="notes" style="margin-top:12px" placeholder="Notes"></textarea><script>document.getElementById('first').focus();</script></body></html>`;

type WebSource = { uri: string } | { html: string; baseUrl?: string };

const ShellWebView = (): React.ReactElement => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const webViewRef = useRef<WebView>(null);
  const [homeSource, setHomeSource] = useState<WebSource>({ uri: HOME_URL });
  const [attendanceUrl, setAttendanceUrl] = useState(ATTENDANCE_URL);
  const [currentUrl, setCurrentUrl] = useState(HOME_URL);
  const [lastInjectedScript, setLastInjectedScript] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [offline, setOffline] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    const subscription = NetInfo.addEventListener((state: NetInfoState) => {
      setOffline(!state.isConnected);
    });
    return () => subscription();
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      },
    );
    return () => backHandler.remove();
  }, [canGoBack]);

  const applyTestConfig = useCallback((url: string | null) => {
    if (!url) {
      return;
    }
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'capshell:' || parsed.hostname !== 'test') {
        return;
      }
      const mode = parsed.searchParams.get('mode');
      const homeParam = parsed.searchParams.get('home');
      const attendanceParam = parsed.searchParams.get('attendance');

      if (homeParam) {
        setHomeSource({ uri: homeParam });
        setCurrentUrl(homeParam);
      } else if (mode === 'mock') {
        setHomeSource({
          html: MOCK_TEST_HTML,
          baseUrl: 'https://www.capnhq.gov/',
        });
        setCurrentUrl('https://www.capnhq.gov/mock');
      }

      if (attendanceParam) {
        setAttendanceUrl(attendanceParam);
      }
    } catch (error) {
      console.warn('CapShell test config parse failed', error);
    }
  }, []);

  useEffect(() => {
    const handleInitial = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        applyTestConfig(initialUrl);
      } catch (error) {
        console.warn('CapShell failed to read initial URL', error);
      }
    };

    handleInitial().catch(() => undefined);
    const subscription = Linking.addEventListener('url', event => {
      applyTestConfig(event.url);
    });
    return () => subscription.remove();
  }, [applyTestConfig]);

  const isAllowedUrl = useCallback((url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' && parsed.hostname === ALLOWED_HOST;
    } catch (error) {
      return false;
    }
  }, []);

  const onNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setLastError(null);
    if (navState.url) {
      setCurrentUrl(navState.url);
    }
  }, []);

  const handleShouldStartLoad = useCallback(
    (request: WebViewNavigation) => {
      const { url } = request;
      if (!url) {
        return false;
      }

      if (!url.startsWith('http')) {
        Linking.openURL(url).catch(() => {
          Toast.show({ type: 'error', text1: 'Unable to open link' });
        });
        return false;
      }

      if (!isAllowedUrl(url)) {
        Toast.show({
          type: 'info',
          text1: 'External link',
          text2: 'Opening in your browser.',
        });
        Linking.openURL(url).catch(() => {
          Toast.show({
            type: 'error',
            text1: 'Unable to open link externally',
          });
        });
        return false;
      }

      return true;
    },
    [isAllowedUrl],
  );

  const handleLoadStart = useCallback(() => {
    setProgress(0.05);
    setLoading(true);
    setLastError(null);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    setRefreshing(false);
    setProgress(1);
  }, []);

  const handleLoadProgress = useCallback((event: WebViewProgressEvent) => {
    const nextProgress = event.nativeEvent.progress || 0;
    setProgress(nextProgress);
  }, []);

  const handleError = useCallback((event: WebViewErrorEvent) => {
    const description = event.nativeEvent.description || 'Unable to load page.';
    setLastError(description);
    setLoading(false);
    setRefreshing(false);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setLastError(null);
    webViewRef.current?.reload();
  }, []);

  const handleAttendance = useCallback(() => {
    setLastError(null);
    const command = `window.location.href = \"${attendanceUrl}\"; true;`;
    setLastInjectedScript(
      JSON.stringify({ type: 'navigate', target: attendanceUrl, js: command }),
    );
    webViewRef.current?.injectJavaScript(command);
  }, [attendanceUrl]);

  const handleScannerResult = useCallback((value: string) => {
    setScannerVisible(false);
    const script = buildFillCommand(value);
    setLastInjectedScript(
      JSON.stringify({ type: 'fill', payload: value, js: script }),
    );
    webViewRef.current?.injectJavaScript(script);
    HapticFeedback.trigger('impactMedium', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    Toast.show({ type: 'success', text1: 'Code pasted' });
  }, []);

  const refreshControl = useMemo(() => {
    if (Platform.OS !== 'ios') {
      return undefined;
    }
    return <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />;
  }, [handleRefresh, refreshing]);

  const errorView = useMemo(() => {
    if (!lastError) {
      return null;
    }
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{lastError}</Text>
        <Text style={styles.errorHint}>
          Check your connection or try again.
        </Text>
        <Text style={styles.errorAction} onPress={handleRefresh}>
          Retry
        </Text>
      </View>
    );
  }, [handleRefresh, lastError]);

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'right', 'left', 'bottom']}
    >
      <AppHeader
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onBack={() => webViewRef.current?.goBack()}
        onForward={() => webViewRef.current?.goForward()}
        onRefresh={handleRefresh}
        onAttendance={handleAttendance}
        onScan={() => setScannerVisible(true)}
        onPrivacy={() => navigation.navigate('Privacy')}
        showAttendance={ENABLE_ATTENDANCE_BUTTON}
      />
      <LoadingProgressBar
        progress={progress}
        visible={loading && progress < 1}
      />
      {offline ? (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>
            You appear to be offline. Reconnect and reload.
          </Text>
        </View>
      ) : null}
      <Text
        testID="current-url-indicator"
        style={styles.debugText}
        accessible={false}
      >
        {currentUrl}
      </Text>
      <Text
        testID="injection-debug"
        style={styles.debugText}
        accessible={false}
      >
        {lastInjectedScript}
      </Text>
      <View style={styles.webViewContainer}>
        {errorView}
        {!lastError ? (
          <WebView
            ref={webViewRef}
            testID="cap-shell-webview"
            source={homeSource}
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            javaScriptEnabled
            domStorageEnabled
            applicationNameForUserAgent="CAPAttendanceShell"
            injectedJavaScriptBeforeContentLoaded={INJECT_BEFORE_LOAD}
            onNavigationStateChange={onNavigationStateChange}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onLoadProgress={handleLoadProgress}
            onError={handleError}
            allowsBackForwardNavigationGestures
            pullToRefreshEnabled={Platform.OS === 'android'}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" />
              </View>
            )}
            setSupportMultipleWindows={false}
            decelerationRate="normal"
            cacheEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            originWhitelist={['https://*']}
            {...(Platform.OS === 'ios' && refreshControl
              ? ({ refreshControl } as Record<string, unknown>)
              : {})}
          />
        ) : null}
      </View>
      <ScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onCode={handleScannerResult}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  offlineBanner: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fee2e2',
    borderBottomColor: '#fca5a5',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  offlineBannerText: {
    textAlign: 'center',
    color: '#b91c1c',
    fontSize: 14,
  },
  debugText: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  webViewContainer: {
    flex: 1,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 8,
    backgroundColor: '#ffffff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  errorMessage: {
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
  },
  errorAction: {
    marginTop: 16,
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
});

export default ShellWebView;
