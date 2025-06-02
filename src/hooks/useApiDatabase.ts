import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3001/api';

// Types pour l'interface
export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  type: 'individual' | 'professional';
  companyName?: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  siret?: string;
}

export interface Piece {
  id: string;
  name: string;
  category: 'vetement' | 'linge' | 'accessoire';
  pressingPrice: number;
  cleaningPressingPrice: number;
  imageUrl?: string;
  description?: string;
}

export interface OrderPiece {
  pieceId: string;
  pieceName: string;
  serviceType: 'pressing' | 'cleaning-pressing';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  clientName: string;
  clientId: string;
  pieces: OrderPiece[];
  totalAmount: number;
  status: 'received' | 'processing' | 'ready' | 'delivered';
  paymentStatus: 'paid' | 'pending' | 'overdue';
  createdAt: string;
  estimatedDate: string;
  isExceptionalPrice: boolean;
}

export interface ProfessionalClient {
  id: string;
  companyName: string;
  siret: string;
  contactName: string;
  email: string;
  phone: string;
  billingAddress: string;
  paymentTerms: number;
  specialRate: number;
  totalOrders: number;
  totalSpent: number;
  outstandingAmount: number;
  createdAt: string;
}

export interface ProfessionalOrder {
  id: string;
  clientId: string;
  clientName: string;
  pieces: number;
  service: string;
  totalAmount: number;
  status: 'received' | 'processing' | 'ready' | 'delivered';
  paymentStatus: 'paid' | 'pending' | 'overdue';
  createdAt: string;
  deliveryDate: string;
  dueDate: string;
  priority: 'normal' | 'high';
}

// Hook générique pour les appels API
const useApi = <T>(endpoint: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error(`Erreur lors du chargement de ${endpoint}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: Omit<T, 'id'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const result = await response.json();
      await fetchData();
      return result;
    } catch (error) {
      console.error(`Erreur lors de la création dans ${endpoint}:`, error);
      throw error;
    }
  };

  const update = async (item: T) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}/${(item as any).id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      await fetchData();
    } catch (error) {
      console.error(`Erreur lors de la mise à jour dans ${endpoint}:`, error);
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      await fetchData();
    } catch (error) {
      console.error(`Erreur lors de la suppression dans ${endpoint}:`, error);
      throw error;
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, loading, create, update, remove };
};

// Hooks spécialisés
export const useClients = () => {
  const { data: clients, loading, create, update, remove } = useApi<Client>('/clients');
  return { 
    clients, 
    loading, 
    addClient: create, 
    updateClient: update, 
    deleteClient: remove 
  };
};

export const usePieces = () => {
  const { data: pieces, loading, create, update, remove } = useApi<Piece>('/pieces');
  return { 
    pieces, 
    loading, 
    addPiece: create, 
    updatePiece: update, 
    deletePiece: remove 
  };
};

export const useOrders = () => {
  const { data: orders, loading, create, update, remove } = useApi<Order>('/orders');
  return { 
    orders, 
    loading, 
    addOrder: create, 
    updateOrder: update, 
    deleteOrder: remove 
  };
};

export const useProfessionalClients = () => {
  const { data: clients, loading, create, update, remove } = useApi<ProfessionalClient>('/professional-clients');
  return { 
    clients, 
    loading, 
    addClient: create, 
    updateClient: update, 
    deleteClient: remove 
  };
};

export const useProfessionalOrders = () => {
  const { data: orders, loading, create, update, remove } = useApi<ProfessionalOrder>('/professional-orders');
  return { 
    orders, 
    loading, 
    addOrder: create, 
    updateOrder: update, 
    deleteOrder: remove 
  };
};
