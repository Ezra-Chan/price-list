import React, { useEffect, useState } from "react";
import { ScrollView, View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Form,
  Button,
  Input,
  Picker,
  Toast,
  WhiteSpace,
} from "@ant-design/react-native";
import Table from "@nutui/nutui-react-native/lib/module/table";
import dayjs from "dayjs";
import { getStorageData, toFixed } from "@/utils";
import { DataItem, Unit, Group, HistoricalPrice } from "@/types";

const columns = [
  {
    title: "日期",
    key: "time",
    align: "center",
  },
  {
    title: "进价",
    key: "purchasePrice",
    align: "center",
  },
  {
    title: "售价",
    key: "price",
    align: "center",
  },
];

const Item = () => {
  const [units, setUnits] = useState<Unit>([]);
  const [groups, setGroups] = useState<Group>([]);
  const [historyData, setHistoryData] = useState<HistoricalPrice[]>([]);
  const [unitVisible, setUnitVisible] = useState(false);
  const [groupVisible, setGroupVisible] = useState(false);
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const isAdd = id === "add";

  const [form] = Form.useForm();

  useEffect(() => {
    navigation.setOptions({
      title: isAdd ? "新增" : "编辑",
      headerBackTitle: "价目表",
    });
  }, [navigation]);

  useEffect(() => {
    getStorageData("unit", setUnits);
    getStorageData("group", setGroups);
  }, []);

  useEffect(() => {
    initFormData();
  }, [units, groups]);

  const initFormData = async () => {
    let initValue = {};
    if (isAdd) {
      initValue = {
        unit: [units[0]?.id],
        group: [groups[0]?.id],
      };
    } else {
      const data = await getStorageData("data");
      const item = data.find((_: DataItem) => _.id + "" === id);
      if (!item) {
        Toast.fail("商品不存在");
        navigation.goBack();
        return;
      }
      initValue = {
        ...item,
        unit: item.unit ? [item.unit] : [],
        group: item.group ? [item.group] : [],
      };
      setHistoryData(item.historicalPrices);
    }
    form.setFieldsValue(initValue);
  };

  const handleSave = async () => {
    const { price, purchasePrice, unit, group, ...rest } =
      form.getFieldsValue();
    const time = dayjs().format("YYYY-MM-DD");
    const data = await getStorageData("data");
    const num = Math.max(...data.map((_: DataItem) => _.id || 0));
    const unitName = unit[0] ? units.find(_ => _.id === unit[0])?.name : "";
    if (isAdd) {
      const isSame = data.some((d: DataItem) => d.name === rest.name);
      if (isSame) {
        return Toast.fail("商品名称已存在");
      }
      const dataItem = {
        ...rest,
        id: num + 1,
        price: toFixed(price),
        purchasePrice: toFixed(purchasePrice),
        unit: unit[0],
        group: group[0],
        updateTime: time,
        historicalPrices: [
          {
            price: `${toFixed(price)}元 / ${unitName}`,
            purchasePrice: `${toFixed(purchasePrice)}元 / ${unitName}`,
            time,
          },
        ],
      };
      data.push(dataItem);
      await AsyncStorage.setItem("data", JSON.stringify(data));
      form.resetFields();
      initFormData();
      Toast.success({ content: "新增成功", duration: 1, mask: false });
    } else {
      const index = data.findIndex((_: DataItem) => _.id + "" === id);
      const item = data[index];
      if (!item) {
        Toast.fail("商品不存在");
        navigation.goBack();
        return;
      }
      const dataItem = {
        ...item,
        ...rest,
        price: toFixed(price),
        purchasePrice: toFixed(purchasePrice),
        unit: unit[0],
        group: group[0],
        updateTime: time,
        historicalPrices: [
          {
            price: `${toFixed(price)}元 / ${unitName}`,
            purchasePrice: `${toFixed(purchasePrice)}元 / ${unitName}`,
            time,
          },
          ...item.historicalPrices,
        ],
      };
      data[index] = dataItem;
      await AsyncStorage.setItem("data", JSON.stringify(data));
      Toast.success({ content: "保存成功", duration: 1, mask: false });
      navigation.goBack();
    }
  };

  return (
    <View className="h-full">
      <ScrollView keyboardShouldPersistTaps="always">
        <Form
          name="basic"
          form={form}
          onFinish={handleSave}
          labelStyle={{ width: 100 }}
        >
          <Form.Item
            label="商品名称"
            name="name"
            rules={[{ required: true, message: "商品名称不能为空" }]}
          >
            <Input allowClear={true} disabled={!isAdd} textAlign="right" />
          </Form.Item>
          <Form.Item
            label="商品售价"
            name="price"
            rules={[{ required: true, message: "商品售价不能为空" }]}
          >
            <Input
              type="number"
              allowClear={true}
              suffix="元"
              textAlign="right"
            />
          </Form.Item>
          <Form.Item label="商品进价" name="purchasePrice">
            <Input
              type="number"
              allowClear={true}
              suffix="元"
              textAlign="right"
            />
          </Form.Item>
          <Form.Item
            label="单位"
            name="unit"
            rules={[{ required: true, message: "单位不能为空" }]}
            arrow="horizontal"
            onPress={() => setUnitVisible(true)}
          >
            <Picker
              data={units.map(_ => ({ label: _.name, value: _.id }))}
              cascade={false}
              cols={1}
              onVisibleChange={setUnitVisible}
              visible={unitVisible}
            >
              {({ extra, value, toggle }) => (
                <Input
                  value={value?.length ? extra : undefined}
                  placeholder="请选择单位"
                  textAlign="right"
                  readOnly
                  onPress={toggle}
                />
              )}
            </Picker>
          </Form.Item>
          <Form.Item
            label="分组"
            name="group"
            rules={[{ required: true, message: "分组不能为空" }]}
            arrow="horizontal"
            onPress={() => setGroupVisible(true)}
          >
            <Picker
              data={groups.map(_ => ({ label: _.name, value: _.id }))}
              cascade={false}
              cols={1}
              onVisibleChange={setGroupVisible}
              visible={groupVisible}
            >
              {({ extra, value, toggle }) => (
                <Input
                  value={value?.length ? extra : undefined}
                  placeholder="请选择分组"
                  textAlign="right"
                  readOnly
                  onPress={toggle}
                />
              )}
            </Picker>
          </Form.Item>
          <Form.Item>
            <Button type="primary" onPress={() => form.submit()}>
              保存
            </Button>
          </Form.Item>
        </Form>
        {!isAdd && (
          <>
            <WhiteSpace size="xl" />
            <Text className="ml-2 text-gray-500 text-lg">历史价格</Text>
            <WhiteSpace />
            <Table columns={columns} data={historyData} />
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default Item;
