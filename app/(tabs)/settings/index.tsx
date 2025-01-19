import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { List } from "@ant-design/react-native";
import { getStorageData } from "@/utils";
import { Group, Unit, Data } from "@/types";

const Item = List.Item;

export default function SettingsScreen() {
  const route = useRouter();
  const [data, setData] = useState({});

  useEffect(() => {
    getStorageData("group", (val: Group) => setData({ ...data, group: val }));
    getStorageData("unit", (val: Unit) => setData({ ...data, unit: val }));
    getStorageData("data", (val: Data) => setData({ ...data, data: val }));
  }, []);

  return (
    <SafeAreaView className="h-full">
      <ScrollView>
        <List>
          <Item
            arrow="horizontal"
            onPress={() => route.push("/settings/group")}
          >
            分组
          </Item>
          <Item arrow="horizontal" onPress={() => route.push("/settings/unit")}>
            单位
          </Item>
          <Item
            arrow="horizontal"
            onPress={() => {
              alert(JSON.stringify(data));
            }}
          >
            导出数据
          </Item>
          <Item arrow="horizontal" onPress={() => {}}>
            导入数据
          </Item>
        </List>
      </ScrollView>
    </SafeAreaView>
  );
}
