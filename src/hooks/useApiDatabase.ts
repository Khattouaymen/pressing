import { useState, useEffect } from 'react';

// Dynamic API base URL detection
const getApiBaseUrl = (): string => {
  const currentHost = window.location.hostname;
  const currentOrigin = window.location.origin;
  
  console.log('Detecting API URL from origin:', currentOrigin);
  
  // Check if we're accessing via dev tunnels
  if (currentOrigin.includes('devtunnels.ms')) {
    // Extract the tunnel prefix and construct API URL
    // From https://j9cqjllv-8080.uks1.devtunnels.ms to https://j9cqjllv-3001.uks1.devtunnels.ms
    const tunnelBase = currentOrigin.replace('-8080', '-3001');
    const apiUrl = `${tunnelBase}/api`;
    console.log('Tunnel environment detected, using API URL:', apiUrl);
    return apiUrl;
  }
  
  // Default to localhost for local development
  const localUrl = 'http://localhost:3001/api';
  console.log('Local environment detected, using API URL:', localUrl);
  return localUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Test API connectivity
const testApiConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('API connection test:', response.ok ? 'SUCCESS' : 'FAILED', response.status);
    return response.ok;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

// Test the connection on startup
setTimeout(() => {
  testApiConnection();
}, 1000);

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
  isProfessional?: boolean; // Nouveau champ pour identifier les pièces B2B
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
  selectedPieces?: Array<{pieceId: string, quantity: number}>;
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
      console.log(`Fetching data from: ${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`Successfully fetched ${result.length || 0} items from ${endpoint}`);
      setData(result);
    } catch (error) {
      console.error(`❌ Erreur lors du chargement de ${endpoint}:`, error);
      console.error('Current API URL:', API_BASE_URL);
      console.error('Full URL attempted:', `${API_BASE_URL}${endpoint}`);
      
      // Set empty array on error so UI doesn't break
      setData([]);
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
