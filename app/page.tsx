"use client";

import { useState, useMemo, useEffect } from "react";
import ItemCard from "./components/ItemCard";
import Header from "./components/Header";
import ItemForm from "./components/ItemForm";
import { Item } from "./models/Item";
import { itemService } from "@/lib/itemService";

import LoadingSpinner from "./components/LoadingSpinner";

export default function Home() {
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // CRUD State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | undefined>(undefined);

  const fetchItems = async () => {
    try {
      const data = await itemService.getItems();
      setItems(data);
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleToggleSelect = (id: number) => {
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleCheckout = () => {
    if (selectedProductIds.size === 0) return;

    const selectedItems = items.filter((item) => selectedProductIds.has(item.id));
    
    let message = "Olá! Tenho interesse nos seguintes itens do seu marketplace:\n\n";
    selectedItems.forEach((item) => {
      message += `- [ID: ${item.id}] ${item.name}\n`;
    });
    
    message += `\nTotal: R$ ${totalValue.toFixed(2).replace(".", ",")}`;
    message += "\n\nPodemos combinar a entrega/pagamento?";

    const whatsappUrl = `https://wa.me/5519994115113?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  // CRUD Handlers
  const handleAdd = () => {
    setEditingItem(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (id: number) => {
    const itemToEdit = items.find((item) => item.id === id);
    if (itemToEdit) {
      setEditingItem(itemToEdit);
      setIsFormOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await itemService.deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      
      // Also remove from selection if it was selected
      if (selectedProductIds.has(id)) {
        setSelectedProductIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Erro ao excluir item.");
    }
  };

  const handleSave = async (itemData: Omit<Item, "id" | "created_at">) => {
    try {
      if (editingItem) {
        const updatedItem = await itemService.updateItem(editingItem.id, itemData);
        setItems((prev) => prev.map((item) => (item.id === editingItem.id ? updatedItem : item)));
      } else {
        const newItem = await itemService.createItem(itemData);
        setItems((prev) => [newItem, ...prev]);
      }
    } catch (error) {
      console.error("Error saving item:", error);
      throw error; // Re-throw to be caught by the form
    }
  };

  const totalValue = useMemo(() => {
    return items
      .filter((item) => selectedProductIds.has(item.id))
      .reduce((sum, item) => sum + item.price, 0);
  }, [selectedProductIds, items]);

  // Group items by category
  const productsByCategory = useMemo(() => {
    const groups: Record<string, Item[]> = {};
    items.forEach((product) => {
      if (!groups[product.category]) {
        groups[product.category] = [];
      }
      groups[product.category].push(product);
    });
    return groups;
  }, [items]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header 
        selectedCount={selectedProductIds.size} 
        onCheckout={handleCheckout} 
        onAdd={handleAdd}
      />

      <main className="container mx-auto px-4 pt-4">
        <div className="mb-6">
          <div className="text-gray-900 mb-2">Olá, visitante! 🙃</div>
          <div className="text-sm text-gray-600">Estou vendendo alguns itens. Se você gostar de algo, selecione o item e chame no WhatsApp!</div>
        </div>

        <div className="space-y-16">
          {Object.entries(productsByCategory).map(([category, products]) => (
            <section key={category}>
              <div className="sticky top-14 bg-gray-50 z-30 py-4 mb-2">
                <h3 className="text-2xl font-semibold text-gray-800 pl-2 border-l-4 border-blue-500">
                  {category}
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {products.map((product) => (
                  <ItemCard
                    key={product.id}
                    {...product}
                    isSelected={selectedProductIds.has(product.id)}
                    onToggleSelect={handleToggleSelect}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {selectedProductIds.size > 0 && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gray-900/90 backdrop-blur text-white px-6 py-3 rounded-full shadow-2xl border border-gray-700 flex items-center gap-3">
            <span className="text-sm font-medium text-gray-300">Total:</span>
            <span className="text-lg font-bold">
              R$ {totalValue.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>
      )}

      <ItemForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSave={handleSave} 
        initialItem={editingItem} 
      />
    </div>
  );
}