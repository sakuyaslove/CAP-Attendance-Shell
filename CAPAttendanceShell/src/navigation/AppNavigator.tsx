import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PrivacyScreen from '../screens/PrivacyScreen';
import ShellWebView from '../screens/ShellWebView';

export type RootStackParamList = {
  Shell: undefined;
  Privacy: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = (): React.ReactElement => (
  <Stack.Navigator>
    <Stack.Screen
      name="Shell"
      component={ShellWebView}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Privacy"
      component={PrivacyScreen}
      options={{ title: 'Privacy' }}
    />
  </Stack.Navigator>
);

export default AppNavigator;
