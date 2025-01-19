import React from "react";
import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-between p-40">
        <Text className="font-medium text-2xl">该页面不存在</Text>
        <Link href="/" className="border border-black p-2 rounded">
          <Text>返回主页</Text>
        </Link>
      </View>
    </>
  );
}
