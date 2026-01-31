import { Check, ShoppingBag, Pencil, Trash2 } from "lucide-react";
import { ItemState } from "../models/ItemState";

interface Props {
  id: number;
  name: string;
  price: number;
  state: ItemState;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const StateBadges: Record<ItemState, { label: string; className: string }> = {
  [ItemState.Pending]: { label: "⏳ Pendente", className: "bg-yellow-100 text-yellow-800" },
  [ItemState.ToSell]: { label: "💰 À Venda", className: "bg-green-100 text-green-800" },
  [ItemState.ToDonate]: { label: "🎁 Doação", className: "bg-purple-100 text-purple-800" },
  [ItemState.ToMove]: { label: "📦 Mudança", className: "bg-blue-100 text-blue-800" },
  [ItemState.ToTrash]: { label: "♻️ Descarte", className: "bg-red-100 text-red-800" },
};

export default function ItemCard(props: Readonly<Props>) {
  const { id, name, price, state, isSelected, onToggleSelect, onEdit, onDelete } = props;
  const badge = StateBadges[state];

  const handleDelete = () => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      onDelete(id);
    }
  };

  return (
    <div
      className={`relative border rounded-lg p-4 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md ${
        isSelected ? "border-blue-500 bg-blue-50/50" : "border-gray-200 bg-white"
      }`}
    >
      <div className="absolute top-5 right-5 z-10">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      <div>
        <div className="h-40 bg-gray-100 rounded-md mb-4 flex items-center justify-center overflow-hidden">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="font-semibold text-lg text-gray-900 mb-1">{name}</h3>
      </div>
      
      <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-gray-100">
        <span className="font-bold text-xl text-gray-900">
          R$ {price.toFixed(2).replace(".", ",")}
        </span>
        
        <button
          onClick={() => onToggleSelect(id)}
          className={`w-full px-4 py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
            isSelected
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {isSelected ? (
            <>
              <Check className="w-4 h-4" />
              Selecionado
            </>
          ) : (
            "Selecionar Item"
          )}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onEdit(id)}
            className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}