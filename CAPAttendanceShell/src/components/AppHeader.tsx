import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import HeaderButton from './HeaderButton';

type AppHeaderProps = {
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onAttendance: () => void;
  onScan: () => void;
  onPrivacy: () => void;
  showAttendance: boolean;
};

const AppHeader = ({
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onRefresh,
  onAttendance,
  onScan,
  onPrivacy,
  showAttendance,
}: AppHeaderProps): React.ReactElement => (
  <View style={styles.container}>
    <View style={styles.row}>
      <View style={styles.sideGroup}>
        <HeaderButton
          testID="header-back"
          icon="arrow-back"
          label="Back"
          onPress={onBack}
          disabled={!canGoBack}
          accessibilityLabel="Go back"
        />
        <HeaderButton
          testID="header-forward"
          icon="arrow-forward"
          label="Forward"
          onPress={onForward}
          disabled={!canGoForward}
          accessibilityLabel="Go forward"
        />
        <HeaderButton
          testID="header-refresh"
          icon="refresh"
          label="Refresh"
          onPress={onRefresh}
          accessibilityLabel="Refresh page"
        />
      </View>
      <Text style={styles.title}>CAP Attendance Shell</Text>
      <View style={styles.sideGroup}>
        {showAttendance ? (
          <HeaderButton
            testID="header-attendance"
            icon="assignment"
            label="Take Attendance"
            onPress={onAttendance}
            accessibilityLabel="Open CAP attendance"
          />
        ) : null}
        <HeaderButton
          testID="header-scan"
          icon="qr-code-scanner"
          label="Scan"
          onPress={onScan}
          accessibilityLabel="Scan barcode"
        />
        <HeaderButton
          testID="header-privacy"
          icon="shield"
          label="Privacy"
          onPress={onPrivacy}
          accessibilityLabel="View privacy details"
        />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d1d5db',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 12,
  },
  sideGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
});

export default AppHeader;
