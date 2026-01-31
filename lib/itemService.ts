import { supabase } from './supabaseClient';
import { Item } from '@/app/models/Item';
import { ItemState } from '@/app/models/ItemState';

export const itemService = {
  async getItems() {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map((item) => ({
      ...item,
      state: item.state as ItemState,
    })) as Item[];
  },

  async uploadImage(file: Blob): Promise<string> {
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
    const { error } = await supabase.storage
      .from('item-images')
      .upload(fileName, file, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from('item-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  },

  async createItem(item: Omit<Item, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('items')
      .insert([item])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateItem(id: number, updates: Partial<Omit<Item, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteItem(id: number) {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
