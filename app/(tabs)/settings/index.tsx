/*
 * @Author: chenxin559
 * @Date: 2025-01-16 15:45:23
 * @LastEditors: chenxin559
 * @LastEditTime: 2025-08-01 15:38:55
 * @Description: 设置页面
 */
import { useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import { List, Toast, Modal } from "@ant-design/react-native";
import { getAllStorageData, pickFile, setMultiStorageData } from "@/utils";

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
      Toast.success("数据导出成功");
      await Clipboard.setStringAsync(jsonData);
      shareFile(fileUri);
    } catch (error) {
      console.error("Error saving file:", error);
      Toast.fail("数据导出失败");
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
        Toast.fail("设备不支持分享");
      }
    } catch (error) {
      console.error("Error sharing file:", error);
    }
  };

  /** 导入数据 */
  const importDataFromFile = async () => {
    const res = await pickFile();
    if (res) {
      const { assets } = res;
      if (assets.length > 0) {
        const fileUri = assets[0].uri;
        try {
          const fileContent = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          const jsonData = JSON.parse(fileContent);
          await setMultiStorageData(jsonData);
          Toast.success("数据导入成功");
        } catch (error) {}
      }
    }
  };

  /** 清除数据 */
  const clearData = async () => {
    Modal.alert("提示", "确认要清除数据吗？", [
      { text: "取消", onPress: () => console.log("cancel"), style: "cancel" },
      {
        text: "确认",
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            Toast.success("数据清除成功");
          } catch (error) {
            console.error("Error clearing data:", error);
          }
        },
      },
    ]);
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
        <Item arrow="horizontal" onPress={importDataFromFile}>
          导入数据
        </Item>
        <Item arrow="horizontal" onPress={clearData}>
          清除数据
        </Item>
      </List>
    </SafeAreaView>
  );
}
