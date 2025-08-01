/*
 * @Author: chenxin559
 * @Date: 2025-01-18 15:14:51
 * @LastEditors: chenxin559
 * @LastEditTime: 2025-08-01 14:48:24
 * @Description:
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";

export const getStorageData = async (
  key: string,
  func: Function = () => {},
  defaultValue: any = "[]",
  isJson = true,
) => {
  const data = (await AsyncStorage.getItem(key)) || defaultValue;
  const result = isJson ? JSON.parse(data) : data;
  func(result);
  return result;
};

export const getAllStorageData = async (func: Function = () => {}) => {
  const keys = await AsyncStorage.getAllKeys();
  const values = await AsyncStorage.multiGet(keys);
  const allData = values.reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {} as Record<string, string | null>);
  func(allData);
  return allData;
};

export const setMultiStorageData = async (obj: Record<string, any>) => {
  await AsyncStorage.multiSet(Object.entries(obj));
};

export const toFixed = (num: string | number, fixed = 2) => {
  return (+num).toFixed(fixed);
};

// 防抖
export const debounce = (func: Function, wait: number = 500) => {
  let timeout: any;
  return function (...args: any[]) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
};

export const pickFile = async (fileType: string = "application/json") => {
  const result: DocumentPicker.DocumentPickerResult =
    await DocumentPicker.getDocumentAsync({
      type: fileType,
    });
  if (result.canceled) {
    return;
  }
  return result;
};

export const importData = async (
  fileUri: string,
  func: Function = () => {},
) => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      func(content);
    } else {
      console.error("导入出错，未找到文件！");
    }
  } catch (error) {
    console.error("文件读取错误！", error);
  }
};
