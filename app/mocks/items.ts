import { Item } from "../models/Item";
import { ItemState } from "../models/ItemState";

export const itemMock: Item[] = [
  {
    id: 1,
    name: "Câmera Vintage",
    price: 129.99,
    description: "Uma câmera de filme 35mm totalmente funcional dos anos 80.",
    state: ItemState.ToSell,
    category: "Eletrônicos",
  },
  {
    id: 2,
    name: "Teclado Mecânico",
    price: 89.50,
    description: "Construído sob medida com switches lineares e keycaps PBT.",
    state: ItemState.ToSell,
    category: "Periféricos",
  },
  {
    id: 3,
    name: "Mochila de Couro",
    price: 159.00,
    description: "Mochila de couro legítimo feita à mão, durável e estilosa.",
    state: ItemState.ToMove,
    category: "Acessórios",
  },
  {
    id: 4,
    name: "Relógio Inteligente",
    price: 199.99,
    description: "Acompanhe seus exercícios e notificações onde estiver.",
    state: ItemState.ToSell,
    category: "Eletrônicos",
  },
  {
    id: 5,
    name: "Fones com Cancelamento de Ruído",
    price: 249.00,
    description: "Som imersivo com tecnologia de cancelamento de ruído ativo.",
    state: ItemState.Pending,
    category: "Áudio",
  },
  {
    id: 6,
    name: "Luminária de Mesa Minimalista",
    price: 45.00,
    description: "Luminária LED ajustável com design moderno e elegante.",
    state: ItemState.ToDonate,
    category: "Casa",
  },
  {
    id: 7,
    name: "Caneca de Cerâmica",
    price: 24.00,
    description: "Caneca de cerâmica feita à mão, perfeita para o seu café da manhã.",
    state: ItemState.ToSell,
    category: "Cozinha",
  },
  {
    id: 8,
    name: "Mouse Sem Fio",
    price: 35.99,
    description: "Design ergonômico com longa duração de bateria.",
    state: ItemState.ToTrash,
    category: "Periféricos",
  },
];