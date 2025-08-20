import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider as PaperProvider } from "react-native-paper";

import HomeScreen from "./screens/HomeScreen";
import BrowseScreen from "./screens/BrowseScreen";
import PostDetailsScreen from "./screens/PostDetailsScreen";
import NewPostScreen from "./screens/NewPostScreen"; // ⬅️ added
import AuthScreen from "./screens/AuthScreen";

// Typed routes (future-proof)
export type RootStackParamList = {
  Auth: undefined; 
  Home: undefined;
  Browse: undefined;
  PostDetails: { id: string }; // ⬅️ pass doc id
  NewPost: undefined; // ⬅️ new route
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: "#6200ee",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{
              title: "Authentication",
            }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: "Community Hub",
            }}
          />
          <Stack.Screen
            name="Browse"
            component={BrowseScreen}
            options={{
              title: "Browse Posts",
              headerShown: false, // Browse has its own header
            }}
          />
          <Stack.Screen
            name="PostDetails"
            component={PostDetailsScreen}
            options={{
              title: "Post Details",
              headerShown: false, // PostDetails has its own back button
            }}
          />
          <Stack.Screen
            name="NewPost"
            component={NewPostScreen}
            options={{
              title: "Create Post",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
