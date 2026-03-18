"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ItemCard, { StateBadges } from "./components/ItemCard";
import Header from "./components/Header";
import ItemForm from "./components/ItemForm";
import { Item } from "./models/Item";
import { ItemState } from "./models/ItemState";
import { itemService } from "@/lib/itemService";

import LoadingSpinner from "./components/LoadingSpinner";

function HomeContent() {
  const searchParams = useSearchParams();
  const isAdmin = searchParams.has("admin");
  
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStates, setFilterStates] = useState<Set<ItemState>>(new Set());
  
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

  // Group items by category and sort them
  const productsByCategory = useMemo(() => {
    const groups: Record<string, Item[]> = {};
    
    // Filter items
    const filteredItems = items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesState = filterStates.size === 0 || filterStates.has(item.state);
      
      // Hide Pending and ToMove for non-admin
      const isVisible = isAdmin || (
        item.state !== ItemState.Pending && 
        item.state !== ItemState.ToMove
      );
      
      return matchesSearch && matchesState && isVisible;
    });

    // Create groups
    filteredItems.forEach((product) => {
      if (!groups[product.category]) {
        groups[product.category] = [];
      }
      groups[product.category].push(product);
    });

    // Sort items within each group and sort the categories themselves
    const sortedGroups: Record<string, Item[]> = {};
    Object.keys(groups)
      .sort((a, b) => a.localeCompare(b))
      .forEach((category) => {
        sortedGroups[category] = groups[category].sort((a, b) => 
          a.name.localeCompare(b.name)
        );
      });

    return sortedGroups;
  }, [items, searchTerm, filterStates, isAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const toggleFilterState = (state: ItemState) => {
    setFilterStates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(state)) {
        newSet.delete(state);
      } else {
        newSet.add(state);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header 
        selectedCount={selectedProductIds.size} 
        onCheckout={handleCheckout} 
        onAdd={handleAdd}
        isAdmin={isAdmin}
      />

      <main className="container mx-auto px-4 pt-4">
        <div className="mb-6">
          <div className="text-gray-900 mb-2 font-medium">Olá, visitante! 🙃</div>
          <div className="text-sm text-gray-600 mb-6">Estou vendendo alguns itens. Se você gostar de algo, selecione o item e chame no WhatsApp!</div>

          <div className="space-y-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div>
              <label htmlFor="search" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Buscar por nome</label>
              <input
                id="search"
                type="text"
                placeholder="Ex: Teclado, Cadeira..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800 placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Filtrar por Estado</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStates(new Set())}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    filterStates.size === 0
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Todos
                </button>
                {Object.entries(StateBadges)
                  .filter(([key]) => isAdmin || (
                    key !== ItemState.Pending && 
                    key !== ItemState.ToMove
                  ))
                  .map(([key, { label }]) => {
                    const state = key as ItemState;
                    const isActive = filterStates.has(state);
                    return (
                      <button
                        key={state}
                        onClick={() => toggleFilterState(state)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isActive
                            ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-100"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-16">
          {Object.keys(productsByCategory).length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4 text-gray-300">🔍</div>
              <h3 className="text-xl font-medium text-gray-600">Nenhum item encontrado</h3>
              <p className="text-gray-400">Tente ajustar sua busca ou filtros.</p>
            </div>
          ) : (
            Object.entries(productsByCategory).map(([category, products]) => (
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
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
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

      {isAdmin && (
        <ItemForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          onSave={handleSave} 
          initialItem={editingItem} 
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
