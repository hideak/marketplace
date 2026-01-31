import { ItemState } from "./ItemState";

export interface Item {
  id: number;
  name: string;
  price: number;
  description: string;
  state: ItemState;
  category: string;
  image_url?: string;
}