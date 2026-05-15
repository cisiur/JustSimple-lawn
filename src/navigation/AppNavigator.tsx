import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { COLORS } from '../constants/theme';

export type RootTabParamList = {
  Home: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<keyof RootTabParamList, [IoniconName, IoniconName]> = {
  Home: ['leaf', 'leaf-outline'],
  Settings: ['settings', 'settings-outline'],
};

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => {
          const [active, inactive] = TAB_ICONS[route.name as keyof RootTabParamList];
          return {
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? active : inactive} size={size} color={color} />
            ),
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textSecondary,
            tabBarStyle: {
              borderTopColor: COLORS.border,
              backgroundColor: COLORS.white,
            },
            headerStyle: { backgroundColor: COLORS.white },
            headerTitleStyle: {
              color: COLORS.textPrimary,
              fontWeight: '700',
              fontSize: 17,
            },
            headerShadowVisible: false,
          };
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'JustSimple Lawn', tabBarLabel: 'Today' }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
