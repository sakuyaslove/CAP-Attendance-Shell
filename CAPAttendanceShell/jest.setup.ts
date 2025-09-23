import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = {
    __esModule: true,
    default: {},
    View: 'View',
    ScrollView: 'ScrollView',
    createAnimatedComponent: <T>(Component: T) => Component,
    useSharedValue: <T>(initial: T) => ({ value: initial }),
    useAnimatedStyle: () => ({}),
    withTiming: <T>(value: T) => value,
    withSpring: <T>(value: T) => value,
    Easing: {
      linear: () => undefined,
      ease: () => undefined,
      out: () => undefined,
      inOut: () => undefined,
    },
    runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
    runOnUI: (fn: (...args: unknown[]) => unknown) => fn,
    cancelAnimation: () => undefined,
  };
  return Reanimated;
});

jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

jest.mock('react-native-toast-message', () => {
  const Toast = Object.assign(() => null, {
    show: jest.fn(),
    hide: jest.fn(),
  });
  return Toast;
});

jest.mock('react-native-vision-camera', () => ({
  Camera: () => null,
  useCameraDevices: () => ({ back: {}, external: {} }),
  useCameraPermission: () => ({ hasPermission: true, requestPermission: jest.fn(), status: 'granted' }),
}));

jest.mock('vision-camera-code-scanner', () => ({
  BarcodeFormat: {
    CODE_128: 'CODE_128',
    EAN_13: 'EAN_13',
    UPC_A: 'UPC_A',
    QR_CODE: 'QR_CODE',
  },
  useScanBarcodes: () => [jest.fn(), []],
}));
