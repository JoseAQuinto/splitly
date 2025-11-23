// App.tsx
import "react-native-url-polyfill/auto";
import "react-native-get-random-values";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { supabase } from "./src/lib/supabase";
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import GroupScreen from "./src/screens/GroupScreen";
import NewGroupScreen from "./src/screens/NewGroupScreen";

// Rutas de Screens
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Group: { groupId: string; groupName: string };
  NewGroup: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [logged, setLogged] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLogged(!!data.session);
      setLoading(false);
    });

    const result = supabase.auth.onAuthStateChange((_event, session) => {
      setLogged(!!session);
    });

    return () => result.data.subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      {logged ? (
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{ headerTitle: "Splitmate" }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Group" component={GroupScreen} />
          <Stack.Screen
            name="NewGroup"
            component={NewGroupScreen}
            options={{ title: "Nuevo grupo" }}
          />

        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
