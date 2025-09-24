import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  type CameraDevice,
  useCameraDevices,
  useCameraPermission,
} from 'react-native-vision-camera';
import { BarcodeFormat, useScanBarcodes } from 'vision-camera-code-scanner';

type ScannerModalProps = {
  visible: boolean;
  onClose: () => void;
  onCode: (value: string) => void;
};

const SUPPORTED_FORMATS = [
  BarcodeFormat.CODE_128,
  BarcodeFormat.EAN_13,
  BarcodeFormat.UPC_A,
  BarcodeFormat.QR_CODE,
];

const ScannerModal = ({
  visible,
  onClose,
  onCode,
}: ScannerModalProps): React.ReactElement => {
  const insets = useSafeAreaInsets();
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraDevices = useCameraDevices();
  const device = useMemo<CameraDevice | undefined>(() => {
    return (
      cameraDevices.find(candidate => candidate.position === 'back') ??
      cameraDevices[0]
    );
  }, [cameraDevices]);
  const [isRequesting, setIsRequesting] = useState(false);
  const [barcodeFrameProcessor, barcodes] = useScanBarcodes(SUPPORTED_FORMATS, {
    checkInverted: true,
  });
  const frameProcessor = useMemo(
    () => ({
      frameProcessor: barcodeFrameProcessor,
      type: 'readonly' as const,
    }),
    [barcodeFrameProcessor],
  );
  const hasProcessedScan = useRef(false);
  const [clipboardError, setClipboardError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      hasProcessedScan.current = false;
      setClipboardError(null);
    }
  }, [visible]);

  useEffect(() => {
    const ensurePermission = async () => {
      if (!visible || hasPermission) {
        return;
      }
      setIsRequesting(true);
      try {
        await requestPermission();
      } finally {
        setIsRequesting(false);
      }
    };
    ensurePermission().catch(() => setIsRequesting(false));
  }, [hasPermission, requestPermission, visible]);

  useEffect(() => {
    if (!visible || hasProcessedScan.current) {
      return;
    }
    const matched = barcodes.find(barcode => barcode.displayValue);
    if (matched?.displayValue) {
      hasProcessedScan.current = true;
      onCode(matched.displayValue.trim());
    }
  }, [barcodes, onCode, visible]);

  const handlePasteClipboard = useCallback(async () => {
    try {
      const value = await Clipboard.getString();
      if (!value) {
        setClipboardError('Clipboard is empty');
        return;
      }
      hasProcessedScan.current = true;
      onCode(value.trim());
    } catch (error) {
      setClipboardError('Unable to read clipboard');
    }
  }, [onCode]);

  const previewContent = useMemo(() => {
    if (!hasPermission) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera permission required</Text>
          <Text style={styles.permissionCopy}>
            Enable camera access in system settings to scan barcodes. You can
            still paste codes from the clipboard.
          </Text>
        </View>
      );
    }

    if (!device || isRequesting) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingLabel}>Preparing camera...</Text>
        </View>
      );
    }

    return (
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={visible && hasPermission}
        frameProcessor={frameProcessor}
      />
    );
  }, [device, frameProcessor, hasPermission, isRequesting, visible]);

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <View
        style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}
      >
        <View style={styles.preview}>{previewContent}</View>
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>Scan a barcode</Text>
          <Text style={styles.overlayCopy}>
            Align the code inside the frame. Supported: CODE_128, EAN_13, UPC_A,
            QR.
          </Text>
          <View style={styles.buttonsRow}>
            <Pressable
              testID="scanner-paste"
              style={styles.secondaryButton}
              onPress={handlePasteClipboard}
            >
              <Text style={styles.secondaryButtonLabel}>Paste clipboard</Text>
            </Pressable>
            <Pressable
              testID="scanner-cancel"
              style={styles.primaryButton}
              onPress={onClose}
            >
              <Text style={styles.primaryButtonLabel}>Cancel</Text>
            </Pressable>
          </View>
          {clipboardError ? (
            <Text style={styles.errorText}>{clipboardError}</Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  preview: {
    flex: 1,
    overflow: 'hidden',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 12,
  },
  permissionCopy: {
    fontSize: 16,
    color: '#e5e7eb',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingLabel: {
    fontSize: 16,
    color: '#f9fafb',
  },
  overlay: {
    position: 'absolute',
    bottom: Platform.select({ ios: 30, android: 24 }),
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    gap: 12,
  },
  overlayTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#f9fafb',
  },
  overlayCopy: {
    fontSize: 15,
    color: '#e5e7eb',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonLabel: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.8)',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
  },
  secondaryButtonLabel: {
    color: '#f9fafb',
    fontWeight: '500',
    fontSize: 16,
  },
  errorText: {
    color: '#fca5a5',
    marginTop: 6,
    fontSize: 14,
  },
});

export default ScannerModal;
