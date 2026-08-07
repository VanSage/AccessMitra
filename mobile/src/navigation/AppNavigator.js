import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import { RouteList, RouteDetail } from '../screens/RoutesScreen';
import ReportScreen from '../screens/ReportScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();
const RoutesStack = createNativeStackNavigator();

function RoutesStackNavigator() {
  return (
    <RoutesStack.Navigator screenOptions={{ headerShown: false }}>
      <RoutesStack.Screen name="RouteList" component={RouteList} />
      <RoutesStack.Screen name="RouteDetail" component={RouteDetail} />
    </RoutesStack.Navigator>
  );
}

const ICONS = { Home: '🏠', Routes: '🗺️', Report: '🚧', Community: '🤝', Profile: '👤' };

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: colors.panel },
          headerTitleStyle: { color: colors.ink },
          tabBarActiveTintColor: colors.navy,
          tabBarInactiveTintColor: colors.sub,
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>{ICONS[route.name]}</Text>,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Discover' }} />
        <Tab.Screen name="Routes" component={RoutesStackNavigator} options={{ headerShown: false, title: 'Routes' }} />
        <Tab.Screen name="Report" component={ReportScreen} options={{ title: 'Report a barrier' }} />
        <Tab.Screen name="Community" component={CommunityScreen} options={{ title: 'Community' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
