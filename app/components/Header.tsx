import { ShoppingCart, Plus } from "lucide-react";

interface Props {
  selectedCount: number;
  onCheckout: () => void;
  onAdd: () => void;
}

export default function Header(props: Readonly<Props>) {
  const { selectedCount, onCheckout, onAdd } = props;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
            Marketplace
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAdd}
            className="p-2.5 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
            title="Adicionar Item"
          >
            <Plus className="w-5 h-5" />
          </button>
          
          <button
            onClick={onCheckout}
            disabled={selectedCount === 0}
            className={`px-5 py-2.5 rounded-full font-semibold text-xs transition-all transform active:scale-95 ${
              selectedCount > 0
                ? "bg-gray-900 text-white shadow-lg hover:bg-gray-800 hover:shadow-xl"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Enviar Whats ({selectedCount})
          </button>
        </div>
      </div>
    </header>
  );
}
