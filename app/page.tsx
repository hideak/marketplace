"use client";

import { useState, useMemo } from "react";
import ItemCard from "./components/ItemCard";
import Header from "./components/Header";
import { itemMock } from "./mocks/items";

export default function Home() {
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());

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

    const selectedItems = itemMock.filter((item) => selectedProductIds.has(item.id));
    
    let message = "Olá! Tenho interesse nos seguintes itens do marketplace:\n\n";
    selectedItems.forEach((item) => {
      message += `* R$ ${item.price.toFixed(2).replace(".", ",")} (ID: ${item.id}) ${item.name}\n`;
    });
    
    message += `\nTotal: R$ ${totalValue.toFixed(2).replace(".", ",")}`;

    const whatsappUrl = `https://wa.me/5519994115113?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const totalValue = useMemo(() => {
    return itemMock
      .filter((item) => selectedProductIds.has(item.id))
      .reduce((sum, item) => sum + item.price, 0);
  }, [selectedProductIds]);

  // Group items by category
  const productsByCategory = useMemo(() => {
    const groups: Record<string, typeof itemMock> = {};
    itemMock.forEach((product) => {
      if (!groups[product.category]) {
        groups[product.category] = [];
      }
      groups[product.category].push(product);
    });
    return groups;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header 
        selectedCount={selectedProductIds.size} 
        onCheckout={handleCheckout} 
      />

      <main className="container mx-auto px-4 pt-4">
        <div className="mb-6">
          <div className="text-gray-900 mb-2">Olá, visitante! 🙃</div>
          <div className="text-sm text-gray-600">Estou vendendo alguns itens. Se você gostar de algo, selecione o item e chame no WhatsApp!</div>
        </div>

        <div className="space-y-16">
          {Object.entries(productsByCategory).map(([category, products]) => (
            <section key={category}>
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 pl-2 border-l-4 border-blue-500">
                {category}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {products.map((product) => (
                  <ItemCard
                    key={product.id}
                    {...product}
                    isSelected={selectedProductIds.has(product.id)}
                    onToggleSelect={handleToggleSelect}
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
    </div>
  );
}
