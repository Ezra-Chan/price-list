import { View, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { Checkbox, Input, Toast } from "@ant-design/react-native";
import Button from "@nutui/nutui-react-native/lib/module/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStorageData } from "@/utils";
import { Group, GroupItem } from "@/types";

const CheckboxItem = Checkbox.CheckboxItem;

const GroupDic = () => {
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkAll, setCheckAll] = useState(false);
  const [checkedList, setCheckedList] = useState(new Set());
  const [groups, setGroups] = useState<Group>([]);

  useEffect(() => {
    getStorageData("group", setGroups);
  }, []);

  const onCheckAllChange = (e: { target: { checked: boolean } }) => {
    setCheckedList(
      e.target.checked
        ? new Set(groups.map((g: GroupItem) => g.id))
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
    setIndeterminate(!!checkedList.size && checkedList.size < groups.length);
    setCheckAll(checkedList.size === groups.length);
  };

  const add = () => {
    const num = Math.max(...groups.map((g: GroupItem) => g.id || 0)) + 1;
    setGroups([...groups, { id: num, name: "" }]);
  };

  const del = async () => {
    if (checkedList.size === 0) {
      return Toast.info({
        content: "请先选择要删除的分组",
        duration: 1,
        mask: false,
      });
    }
    const rest = groups.filter((g: GroupItem) => !checkedList.has(g.id));
    setGroups(rest);
    await AsyncStorage.setItem("group", JSON.stringify(rest));
    setCheckedList(new Set()); // 清空选中状态
    setIndeterminate(false);
    setCheckAll(false);
    Toast.success({
      content: "删除成功",
      duration: 1,
      mask: false,
    });
  };

  const edit = async (id: number, name: string) => {
    const index = groups.findIndex((g: GroupItem) => g.id === id);
    const newGroup = [...groups];
    if (index !== -1) {
      newGroup[index].name = name;
      setGroups(newGroup);
      await AsyncStorage.setItem("group", JSON.stringify(newGroup));
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
        {groups.map((g: GroupItem) => (
          <CheckboxItem
            key={g.id}
            onChange={e => onChange(g.id, e)}
            checked={checkedList.has(g.id)}
          >
            <Input
              value={g.name}
              onChange={e => edit(g.id, e.target.value)}
              allowClear
            />
          </CheckboxItem>
        ))}
      </View>
    </ScrollView>
  );
};

export default GroupDic;
