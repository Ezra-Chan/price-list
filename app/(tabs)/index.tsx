import { useEffect, useState } from "react";
import { ScrollView, Text } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { List, SwipeAction, Collapse, Icon } from "@ant-design/react-native";
import SearchBar from "@nutui/nutui-react-native/lib/module/searchbar";
import FixedNav from "@nutui/nutui-react-native/lib/module/fixednav";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { getStorageData } from "@/utils";

import type { Group, Data, Unit } from "@/types";

const mockData = [
  {
    id: 1,
    name: "青菜",
    group: 1,
    price: "10",
    unit: 2,
    purchasePrice: "8",
    updateTime: "2021-09-01",
    historicalPrices: [
      {
        price: "10",
        purchasePrice: "8",
        time: "2021-09-01",
      },
    ],
  },
  {
    id: 2,
    name: "娃娃菜",
    group: 1,
    price: "5",
    unit: 1,
    purchasePrice: "3",
    updateTime: "2021-09-01",
    historicalPrices: [
      {
        price: "5",
        purchasePrice: "3",
        time: "2021-09-01",
      },
    ],
  },
  {
    id: 3,
    name: "老百叶",
    group: 2,
    price: "5",
    unit: 1,
    purchasePrice: "3",
    updateTime: "2021-09-01",
    historicalPrices: [
      {
        price: "5",
        purchasePrice: "3",
        time: "2021-09-01",
      },
    ],
  },
  {
    id: 4,
    name: "豆腐",
    group: 2,
    price: "5",
    unit: 1,
    purchasePrice: "3",
    updateTime: "2021-09-01",
    historicalPrices: [
      {
        price: "5",
        purchasePrice: "3",
        time: "2021-09-01",
      },
    ],
  },
];

const mockGroup = [
  {
    id: 1,
    name: "蔬菜",
  },
  {
    id: 2,
    name: "豆制品",
  },
];

const mockUnit = [
  {
    id: 1,
    name: "斤",
  },
  {
    id: 2,
    name: "公斤",
  },
];

const initData = async () => {
  await AsyncStorage.setItem("data", JSON.stringify(mockData));
  await AsyncStorage.setItem("group", JSON.stringify(mockGroup));
  await AsyncStorage.setItem("unit", JSON.stringify(mockUnit));
};
// initData();

export default function HomeScreen() {
  const [value, setValue] = useState<string>("");
  const [data, setData] = useState<Data>([]);
  const [group, setGroup] = useState<Group>([]);
  const [unit, setUnit] = useState<Record<number, string>>({});
  const [activeKey, setActiveKey] = useState<string[]>([]);
  const route = useRouter();

  useFocusEffect(() => {
    getStorageData("data", setData);
    getStorageData("group", (val: Group) => {
      setGroup(val);
      setActiveKey(val.map(_ => _.id + ""));
    });
    getStorageData("unit", (val: Unit) => {
      const unitObj: Record<number, string> = {};
      val.forEach(_ => {
        unitObj[_.id] = _.name;
      });
      setUnit(unitObj);
    });
  });

  useEffect(() => {
    setFilterData(value);
  }, [value]);

  useEffect(() => {
    setFilterGroup(data);
  }, [data]);

  const setFilterData = async (str: string) => {
    const originData: Data = await getStorageData("data");
    setData(str ? originData.filter(dt => dt.name.includes(str)) : originData);
  };

  const setFilterGroup = async (dt: Data) => {
    const originGroup: Group = await getStorageData("group");
    const dtGroups = [...new Set(dt.map(_ => _.group))];
    setGroup(originGroup.filter(g => dtGroups.includes(g.id)));
  };

  const deleteDataItem = async (id: number) => {
    const newData = data.filter(_ => _.id !== id);
    await AsyncStorage.setItem("data", JSON.stringify(newData));
    setData(newData);
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView className="h-full">
        <SearchBar
          value={value}
          onChange={setValue}
          onClear={() => setValue("")}
          placeholder="搜索"
          shape="round"
        />
        <FixedNav
          position={{ bottom: 100 }}
          onChange={() => route.push("/priceList/add")}
          slotBtn={<Icon name="plus" color="white" size={30} />}
          styles={[{ backgroundColor: "#000" }]}
        />
        <ScrollView>
          <Collapse activeKey={activeKey} onChange={setActiveKey}>
            {group.map(item => (
              <Collapse.Panel key={item.id + ""} title={item.name}>
                {data
                  .filter(_ => _.group === item.id)
                  .map(_ => (
                    <SwipeAction
                      key={_.id}
                      right={[
                        {
                          text: "删除",
                          onPress: () => deleteDataItem(_.id),
                          backgroundColor: "red",
                          color: "white",
                        },
                      ]}
                      closeOnTouchOutside
                      closeOnAction
                    >
                      <List.Item
                        extra={
                          <Text>
                            {_.price}元 / {unit[_.unit]}
                          </Text>
                        }
                        onPress={() =>
                          route.push({
                            pathname: "/priceList/[id]",
                            params: { id: _.id },
                          })
                        }
                      >
                        {_.name}
                      </List.Item>
                    </SwipeAction>
                  ))}
              </Collapse.Panel>
            ))}
          </Collapse>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
