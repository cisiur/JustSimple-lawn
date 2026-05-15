import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { configureNotificationHandler } from './src/notifications/notificationService';
import { configureRevenueCat } from './src/premium/premiumService';

// Initialise services once at startup
configureNotificationHandler();
configureRevenueCat(); // no-op in Expo Go; activates automatically in dev/production build

export default function App() {
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
