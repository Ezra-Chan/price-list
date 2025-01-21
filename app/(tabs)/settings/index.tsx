import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { List } from "@ant-design/react-native";
import { getAllStorageData } from "@/utils";
import { Alert } from "react-native";

const Item = List.Item;

export default function SettingsScreen() {
  const route = useRouter();
  const [data, setData] = useState({});

  useFocusEffect(
    useCallback(() => {
      getAllStorageData(setData);
    }, []),
  );

  const saveDataToFile = async () => {
    const fileUri = FileSystem.documentDirectory + "data.json"; // iOS和Android都可使用的路径
    try {
      // 将数据转换为 JSON 字符串
      const jsonData = JSON.stringify(data);

      // 写入文件
      await FileSystem.writeAsStringAsync(fileUri, jsonData, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // 成功提示
      Alert.alert("提示", "数据导出成功！路径：" + fileUri, [
        { text: "好的", onPress: () => console.log("Data saved to", fileUri) },
      ]);
      shareFile(fileUri);
    } catch (error) {
      console.error("Error saving file:", error);
      Alert.alert("提示", "数据导出失败！");
    }
  };

  // 分享文件
  const shareFile = async (fileUri: string) => {
    try {
      // 检查设备是否支持分享
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        // 分享文件
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("不支持分享！");
      }
    } catch (error) {
      console.error("Error sharing file:", error);
    }
  };

  return (
    <SafeAreaView className="h-full bg-white">
      <List>
        <Item
          arrow="horizontal"
          onPress={() => route.push("/settings/dictionary?type=group")}
        >
          分组
        </Item>
        <Item
          arrow="horizontal"
          onPress={() => route.push("/settings/dictionary?type=unit")}
        >
          单位
        </Item>
        <Item arrow="horizontal" onPress={saveDataToFile}>
          导出数据
        </Item>
        <Item arrow="horizontal" onPress={() => {}}>
          导入数据
        </Item>
      </List>
    </SafeAreaView>
  );
}
