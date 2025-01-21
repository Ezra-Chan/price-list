export interface GroupItem {
  id: number;
  name: string;
}

export type Group = GroupItem[];

export interface UnitItem {
  id: number;
  name: string;
}

export type Unit = UnitItem[];

export interface DicItem {
  id: number;
  name: string;
}

export interface HistoricalPrice {
  price: string;
  purchasePrice: string;
  time: string;
}

export interface DataItem {
  id: number;
  name: string;
  group: number;
  price: string;
  unit: number;
  purchasePrice: string;
  updateTime: string;
  historicalPrices: HistoricalPrice;
}

export type Data = DataItem[];
