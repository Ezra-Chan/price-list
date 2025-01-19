import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Provider } from "@ant-design/react-native";
import ConfigProvider, {
  useConfig,
} from "@nutui/nutui-react-native/lib/module/configprovider";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import "../global.css";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const config = useConfig();
  const [loaded] = useFonts({
    antoutline: require("@ant-design/icons-react-native/fonts/antoutline.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ConfigProvider
      theme={{
        ...config.theme,
        "$primary-color": "#108ee9",
      }}
    >
      <Provider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="priceList" />
            <Stack.Screen
              name="+not-found"
              options={{ headerBackButtonDisplayMode: "minimal" }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </Provider>
    </ConfigProvider>
  );
}
