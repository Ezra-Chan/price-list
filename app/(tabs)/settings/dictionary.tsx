import { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Checkbox, Input, Modal, Toast } from "@ant-design/react-native";
import Button from "@nutui/nutui-react-native/lib/module/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStorageData } from "@/utils";
import { Group, Unit, DicItem, DataItem } from "@/types";

const CheckboxItem = Checkbox.CheckboxItem;
const dicMap: Record<string, string> = {
  group: "分组",
  unit: "单位",
};
type DicType = keyof typeof dicMap;

const Dictionary = () => {
  const [indeterminate, setIndeterminate] = useState(false); // 半选状态
  const [checkAll, setCheckAll] = useState(false); // 全选状态
  const [checkedList, setCheckedList] = useState(new Set()); // 选中列表
  const [dictionary, setDictionary] = useState<Group | Unit>([]); // 字典列表
  const { type } = useLocalSearchParams();
  const navigation = useNavigation();
  const dicName = dicMap[type as DicType];

  useEffect(() => {
    getStorageData(type as DicType, setDictionary);
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

  /**
   * checkbox改变事件
   */
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

  /** 新增 */
  const add = async () => {
    const num = Math.max(...dictionary.map((d: DicItem) => d.id || 0), 0) + 1;
    const newDic = [...dictionary, { id: num, name: "" }];
    setDictionary(newDic);
    await AsyncStorage.setItem(type as DicType, JSON.stringify(newDic));
  };

  const del = async () => {
    if (checkedList.size === 0) {
      return Toast.info("请先选择要删除的" + dicName);
    }
    Modal.alert("提示", `确定要删除选中的${dicName}吗？`, [
      {
        text: "取消",
        style: "cancel",
      },
      {
        text: "确定",
        onPress: async () => {
          const data = await getStorageData("data");
          const checkedDic = Array.from(checkedList);
          const keyData = data.find((d: DataItem) =>
            checkedDic.includes(d[type as DicType]),
          );
          if (keyData) {
            const dicItemName = dictionary.find(
              dic => dic.id === keyData[type as DicType],
            )?.name;
            return Toast.fail("删除失败，" + dicItemName + " 已被使用");
          }
          const rest = dictionary.filter(
            (d: DicItem) => !checkedList.has(d.id),
          );
          setDictionary(rest);
          await AsyncStorage.setItem(type as DicType, JSON.stringify(rest));
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
    if (index !== -1) {
      const newDic = [...dictionary];
      newDic[index].name = name;
      setDictionary(newDic);
      await AsyncStorage.setItem(type as DicType, JSON.stringify(newDic));
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
