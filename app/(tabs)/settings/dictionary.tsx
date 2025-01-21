import { useState, useEffect } from "react";
import { View, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Checkbox, Input, Toast } from "@ant-design/react-native";
import Button from "@nutui/nutui-react-native/lib/module/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStorageData } from "@/utils";
import { Group, Unit, DicItem } from "@/types";

const CheckboxItem = Checkbox.CheckboxItem;
const dicMap: Record<string, string> = {
  group: "分组",
  unit: "单位",
};

const Dictionary = () => {
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkAll, setCheckAll] = useState(false);
  const [checkedList, setCheckedList] = useState(new Set());
  const [dictionary, setDictionary] = useState<Group | Unit>([]);
  const { type } = useLocalSearchParams();
  const navigation = useNavigation();
  const dicName = dicMap[type as string];

  useEffect(() => {
    getStorageData(type as string, setDictionary);
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: dicName,
      headerBackTitle: "设置",
    });
  }, [navigation]);

  const onCheckAllChange = (e: { target: { checked: boolean } }) => {
    setCheckedList(
      e.target.checked
        ? new Set(dictionary.map((d: DicItem) => d.id))
        : new Set(),
    );
    setIndeterminate(false);
    setCheckAll(e.target.checked);
  };

  const onChange = (value: any, e: { target: { checked: boolean } }) => {
    if (e.target.checked) {
      checkedList.add(value);
    } else {
      checkedList.delete(value);
    }

    setCheckedList(new Set(checkedList));
    setIndeterminate(
      !!checkedList.size && checkedList.size < dictionary.length,
    );
    setCheckAll(checkedList.size === dictionary.length);
  };

  const add = async () => {
    const num = Math.max(...dictionary.map((d: DicItem) => d.id || 0), 0) + 1;
    const newDic = [...dictionary, { id: num, name: "" }];
    setDictionary(newDic);
    await AsyncStorage.setItem(type as string, JSON.stringify(newDic));
  };

  const del = async () => {
    if (checkedList.size === 0) {
      return Toast.info({
        content: "请先选择要删除的" + dicName,
        duration: 1,
        mask: false,
      });
    }
    Alert.alert("提示", `确定要删除选中的${dicName}吗？`, [
      {
        text: "取消",
        style: "cancel",
      },
      {
        text: "确定",
        onPress: async () => {
          const rest = dictionary.filter(
            (d: DicItem) => !checkedList.has(d.id),
          );
          setDictionary(rest);
          await AsyncStorage.setItem(type as string, JSON.stringify(rest));
          setCheckedList(new Set()); // 清空选中状态
          setIndeterminate(false);
          setCheckAll(false);
          Toast.success({
            content: "删除成功",
            duration: 1,
            mask: false,
          });
        },
      },
    ]);
  };

  const edit = async (id: number, name: string) => {
    const index = dictionary.findIndex((d: DicItem) => d.id === id);
    const newDic = [...dictionary];
    if (index !== -1) {
      newDic[index].name = name;
      setDictionary(newDic);
      await AsyncStorage.setItem(type as string, JSON.stringify(newDic));
    }
  };

  return (
    <ScrollView keyboardShouldPersistTaps="always">
      <View className="h-14 bg-white flex-row justify-evenly items-center">
        <Button type="info" plain size="small" onPress={add}>
          添加
        </Button>
        <Button type="danger" plain size="small" onPress={del}>
          删除
        </Button>
      </View>
      <CheckboxItem
        indeterminate={indeterminate}
        onChange={onCheckAllChange}
        checked={checkAll}
      >
        全选
      </CheckboxItem>
      <View className="pl-5 bg-white">
        {dictionary.map((d: DicItem) => (
          <CheckboxItem
            key={d.id}
            onChange={e => onChange(d.id, e)}
            checked={checkedList.has(d.id)}
          >
            <Input
              value={d.name}
              onChange={(e: any) => edit(d.id, e.target.value)}
              allowClear
            />
          </CheckboxItem>
        ))}
      </View>
    </ScrollView>
  );
};

export default Dictionary;
