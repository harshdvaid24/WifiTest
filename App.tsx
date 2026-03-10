import React, {useEffect, useState} from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSettingsStore} from './src/store/settingsStore';
import {useSensorStore} from './src/store/sensorStore';

import {SplashScreen} from './src/screens/SplashScreen';
import {PermissionsScreen} from './src/screens/PermissionsScreen';
import {RouterSetupScreen} from './src/screens/RouterSetupScreen';
import {CalibrationScreen} from './src/screens/CalibrationScreen';
import {DashboardScreen} from './src/screens/DashboardScreen';
import {SignalDebugScreen} from './src/screens/SignalDebugScreen';
import {HistoryScreen} from './src/screens/HistoryScreen';
import {SmartHomeScreen} from './src/screens/SmartHomeScreen';
import {SettingsScreen} from './src/screens/SettingsScreen';

type OnboardingStackParams = {
  Splash: undefined;
  Permissions: undefined;
  RouterSetup: undefined;
  Calibration: undefined;
};

type MainTabParams = {
  Dashboard: undefined;
  Debug: undefined;
  History: undefined;
  SmartHome: undefined;
  Settings: undefined;
};

type RootStackParams = {
  Onboarding: undefined;
  Main: undefined;
};

const RootStack = createStackNavigator<RootStackParams>();
const OnboardingStack = createStackNavigator<OnboardingStackParams>();
const MainTab = createBottomTabNavigator<MainTabParams>();

function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator screenOptions={{headerShown: false}}>
      <OnboardingStack.Screen name="Splash">
        {({navigation}) => (
          <SplashScreen onComplete={() => navigation.navigate('Permissions')} />
        )}
      </OnboardingStack.Screen>
      <OnboardingStack.Screen name="Permissions">
        {({navigation}) => (
          <PermissionsScreen
            onComplete={() => navigation.navigate('RouterSetup')}
          />
        )}
      </OnboardingStack.Screen>
      <OnboardingStack.Screen name="RouterSetup">
        {({navigation}) => (
          <RouterSetupScreen
            onComplete={() => navigation.navigate('Calibration')}
          />
        )}
      </OnboardingStack.Screen>
      <OnboardingStack.Screen name="Calibration">
        {({navigation}) => (
          <CalibrationScreen
            onComplete={() => {
              useSettingsStore.getState().setOnboardingDone(true);
              navigation.getParent()?.reset({
                index: 0,
                routes: [{name: 'Main'}],
              });
            }}
          />
        )}
      </OnboardingStack.Screen>
    </OnboardingStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 8,
        },
      }}>
      <MainTab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{tabBarLabel: 'Live'}}
      />
      <MainTab.Screen
        name="Debug"
        component={SignalDebugScreen}
        options={{tabBarLabel: 'Signal'}}
      />
      <MainTab.Screen
        name="History"
        component={HistoryScreen}
        options={{tabBarLabel: 'History'}}
      />
      <MainTab.Screen
        name="SmartHome"
        component={SmartHomeScreen}
        options={{tabBarLabel: 'SmartAC'}}
      />
      <MainTab.Screen name="Settings">
        {({navigation}) => (
          <SettingsScreen
            onRecalibrate={() => {
              navigation.getParent()?.navigate('Onboarding', {
                screen: 'Calibration',
              });
            }}
            onResetRouter={() => {
              navigation.getParent()?.navigate('Onboarding', {
                screen: 'RouterSetup',
              });
            }}
          />
        )}
      </MainTab.Screen>
    </MainTab.Navigator>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const loadFromStorage = useSettingsStore(s => s.loadFromStorage);
  const onboardingDone = useSettingsStore(s => s.onboardingDone);
  const initOrchestrator = useSensorStore(s => s.initOrchestrator);

  useEffect(() => {
    async function init() {
      loadFromStorage();
      await initOrchestrator();
      setReady(true);
    }
    init();
  }, [loadFromStorage, initOrchestrator]);

  if (!ready) return null;

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <RootStack.Navigator screenOptions={{headerShown: false}}>
        {!onboardingDone ? (
          <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <RootStack.Screen name="Main" component={MainNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
