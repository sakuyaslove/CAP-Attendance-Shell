import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type HeaderButtonProps = {
  icon: string;
  label?: string;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
  testID?: string;
};

const HeaderButton = ({
  icon,
  label,
  onPress,
  disabled,
  accessibilityLabel,
  testID,
}: HeaderButtonProps): React.ReactElement => {
  return (
    <Pressable
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled ? styles.disabled : undefined,
        pressed && !disabled ? styles.pressed : undefined,
      ]}
    >
      <MaterialIcons
        name={icon}
        size={20}
        color={disabled ? '#9ca3af' : '#111827'}
      />
      {label ? (
        <Text
          style={[styles.label, disabled ? styles.labelDisabled : undefined]}
        >
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(17, 24, 39, 0.06)',
    gap: 6,
  },
  pressed: {
    opacity: 0.6,
  },
  disabled: {
    backgroundColor: 'rgba(156, 163, 175, 0.18)',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  labelDisabled: {
    color: '#9ca3af',
  },
});

export default HeaderButton;
