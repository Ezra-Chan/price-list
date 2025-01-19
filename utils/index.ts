import AsyncStorage from "@react-native-async-storage/async-storage";

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
