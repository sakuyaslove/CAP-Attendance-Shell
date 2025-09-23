import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

type LoadingProgressBarProps = {
  progress: number;
  visible: boolean;
};

const LoadingProgressBar = ({
  progress,
  visible,
}: LoadingProgressBarProps): React.ReactElement | null => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(animatedWidth, {
        toValue: progress,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(0);
    }
  }, [animatedWidth, progress, visible]);

  if (!visible) {
    return null;
  }

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bar, { width: widthInterpolation }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 3,
    backgroundColor: '#e5e7eb',
  },
  bar: {
    height: 3,
    backgroundColor: '#2563eb',
  },
});

export default LoadingProgressBar;
