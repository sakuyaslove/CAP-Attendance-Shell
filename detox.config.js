module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/jest.config.js',
  artifacts: {
    plugins: {
      log: { enabled: true },
      screenshot: { shouldTakeAutomaticSnapshots: true },
    },
  },
  apps: {
    'ios.sim.debug': {
      type: 'ios.app',
      binaryPath:
        'ios/build/Build/Products/Debug-iphonesimulator/CAPAttendanceShell.app',
      build:
        'xcodebuild -workspace ios/CAPAttendanceShell.xcworkspace -scheme CAPAttendanceShell -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.emu.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build:
        'cd android && gradlew.bat assembleDebug assembleAndroidTest -DtestBuildType=debug',
    },
  },
  devices: {
    'ios.simulator': {
      type: 'ios.simulator',
      device: { type: 'iPhone 15' },
    },
    'android.emulator': {
      type: 'android.emulator',
      device: { avdName: 'Pixel_6_Pro_API_34' },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'ios.simulator',
      app: 'ios.sim.debug',
    },
    'android.emu.debug': {
      device: 'android.emulator',
      app: 'android.emu.debug',
    },
  },
};
