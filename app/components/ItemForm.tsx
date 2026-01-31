import { useState, useEffect, useRef } from "react";
import { Item } from "../models/Item";
import { ItemState } from "../models/ItemState";
import { X, Camera, Image as ImageIcon } from "lucide-react";
import { StateBadges } from "./ItemCard";
import { compressImage } from "@/lib/imageUtils";
import { itemService } from "@/lib/itemService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<Item, "id" | "created_at">) => Promise<void>;
  initialItem?: Item;
}

export default function ItemForm({ isOpen, onClose, onSave, initialItem }: Readonly<Props>) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState<ItemState>(ItemState.ToSell);
  const [imageFile, setImageFile] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setPrice(initialItem.price.toString());
      setDescription(initialItem.description);
      setCategory(initialItem.category);
      setState(initialItem.state);
      setImagePreview(initialItem.image_url || null);
    } else {
      setName("");
      setPrice("");
      setDescription("");
      setCategory("");
      setState(ItemState.ToSell);
      setImagePreview(null);
    }
    setImageFile(null);
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBlob = await compressImage(file);
        setImageFile(compressedBlob);
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(compressedBlob);
        setImagePreview(previewUrl);
      } catch (error) {
        console.error("Error processing image:", error);
        alert("Erro ao processar imagem.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let imageUrl = initialItem?.image_url;

      if (imageFile) {
        imageUrl = await itemService.uploadImage(imageFile);
      }

      await onSave({
        name,
        price: parseFloat(price),
        description,
        category,
        state,
        image_url: imageUrl,
      });
      onClose();
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Erro ao salvar item. Verifique o console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {initialItem ? "Editar Item" : "Novo Item"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image Upload Area */}
          <div className="flex justify-center">
             <div 
              className="relative w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors overflow-hidden group"
             >
                {imagePreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-gray-900 font-medium hover:bg-gray-100 transition-colors"
                      >
                        <ImageIcon className="w-5 h-5" />
                        Galeria
                      </button>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-gray-900 font-medium hover:bg-gray-100 transition-colors"
                      >
                        <Camera className="w-5 h-5" />
                        Câmera
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white p-3 rounded-full shadow-sm mb-2">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-500 font-medium mb-3">Adicionar Foto</span>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Galeria
                      </button>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                        Câmera
                      </button>
                    </div>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                <input 
                  type="file" 
                  accept="image/*"
                  capture="environment"
                  className="hidden" 
                  ref={cameraInputRef}
                  onChange={handleImageChange}
                />
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Item
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Ex: Cadeira de Escritório"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço (R$)
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Ex: Móveis"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value as ItemState)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              {Object.entries(StateBadges).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Descreva o item..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Salvando..." : "Salvar Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
