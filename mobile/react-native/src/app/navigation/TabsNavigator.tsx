import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../../features/dashboard/screens/DashboardScreen';

type TabsParamList = {
  Dashboard: undefined;
};

const Tab = createBottomTabNavigator<TabsParamList>();

export function AppTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
    </Tab.Navigator>
  );
}
