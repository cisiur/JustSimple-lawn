import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { configureNotificationHandler } from './src/notifications/notificationService';

// Configure foreground notification behaviour once at startup
configureNotificationHandler();

// TODO: REVENUECAT — uncomment after installing react-native-purchases and creating dev build:
// import Purchases from 'react-native-purchases';
// import Constants from 'expo-constants';
// import { Platform } from 'react-native';
// const rcKey = Platform.OS === 'android'
//   ? Constants.expoConfig?.extra?.revenueCatKeyAndroid
//   : Constants.expoConfig?.extra?.revenueCatKeyIos;
// if (rcKey) Purchases.configure({ apiKey: rcKey });

export default function App() {
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
