import { Stack } from "expo-router";

export default function SettingLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, headerBackTitle: "minimal" }}
      />
      <Stack.Screen
        name="group"
        options={{ headerBackTitle: "设置", title: "分组" }}
      />
      <Stack.Screen
        name="unit"
        options={{ headerBackTitle: "设置", title: "单位" }}
      />
    </Stack>
  );
}
