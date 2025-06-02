import { useState, useEffect } from 'react';
import { 
  DbClient, 
  DbPiece, 
  DbOrder, 
  DbOrderPiece, 
  DbProfessionalClient, 
  DbProfessionalOrder 
} from '@/lib/database';

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
  createdAt: string;
  estimatedDate: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
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

// API simulée côté client (en attendant un vrai backend)
class ClientDatabaseAPI {
  private storageKey = 'pressing_data';

  private getStoredData() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    return this.getInitialData();
  }

  private setStoredData(data: any) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  private getInitialData() {
    return {
      clients: [
        {
          id: "CLI001",
          firstName: "Marie",
          lastName: "Dubois",
          phone: "06 12 34 56 78",
          email: "marie.dubois@email.com",
          address: "123 Rue de la Paix, 75001 Paris",
          createdAt: "2024-01-15",
          totalOrders: 24,
          totalSpent: 456.80,
          type: 'individual'
        },
        {
          id: "CLI002",
          firstName: "Pierre",
          lastName: "Martin",
          phone: "06 98 76 54 32",
          email: "pierre.martin@email.com",
          address: "456 Avenue des Champs, 75008 Paris",
          createdAt: "2024-02-20",
          totalOrders: 12,
          totalSpent: 234.50,
          type: 'individual'
        },
        {
          id: "PRO001",
          firstName: "Jean",
          lastName: "Directeur",
          phone: "01 23 45 67 89",
          email: "contact@hotelroyal.com",
          address: "789 Boulevard Haussmann, 75009 Paris",
          createdAt: "2024-01-10",
          totalOrders: 156,
          totalSpent: 12456.00,
          type: 'professional',
          companyName: "Hotel Royal",
          siret: "12345678901234"
        }
      ],
      pieces: [
        { id: 'P001', name: 'Chemise', category: 'vetement', pressingPrice: 3.50, cleaningPressingPrice: 8.00, imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop&crop=center" },
        { id: 'P002', name: 'Pantalon', category: 'vetement', pressingPrice: 4.00, cleaningPressingPrice: 9.50, imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=300&h=300&fit=crop&crop=center" },
        { id: 'P003', name: 'Veste', category: 'vetement', pressingPrice: 6.50, cleaningPressingPrice: 15.00, imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop&crop=center" },
        { id: 'P004', name: 'Robe', category: 'vetement', pressingPrice: 5.00, cleaningPressingPrice: 12.00, imageUrl: "https://images.unsplash.com/photo-1566479179817-0b9e588a2c88?w=300&h=300&fit=crop&crop=center" },
        { id: 'P005', name: 'Manteau', category: 'vetement', pressingPrice: 8.00, cleaningPressingPrice: 18.00, imageUrl: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop&crop=center" },
        { id: 'P006', name: 'Costume', category: 'vetement', pressingPrice: 12.00, cleaningPressingPrice: 25.00, imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center" },
        { id: 'P007', name: 'Nappe', category: 'linge', pressingPrice: 3.00, cleaningPressingPrice: 7.50, imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=300&fit=crop&crop=center" },
        { id: 'P008', name: 'Cravate', category: 'accessoire', pressingPrice: 2.50, cleaningPressingPrice: 6.00, imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center" },
        { id: 'P009', name: 'Jupe', category: 'vetement', pressingPrice: 3.50, cleaningPressingPrice: 8.00, imageUrl: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=300&h=300&fit=crop&crop=center" },
        { id: 'P010', name: 'Pull/Tricot', category: 'vetement', pressingPrice: 4.50, cleaningPressingPrice: 9.50, imageUrl: "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=300&h=300&fit=crop&crop=center" },
        { id: 'P011', name: 'Housse de couette', category: 'linge', pressingPrice: 6.00, cleaningPressingPrice: 10.00, imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&h=300&fit=crop&crop=center" },
        { id: 'P012', name: 'Costume (complet)', category: 'vetement', pressingPrice: 15.00, cleaningPressingPrice: 30.00, imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop&crop=center" },
        { id: 'P013', name: 'Rideau', category: 'linge', pressingPrice: 8.00, cleaningPressingPrice: 12.00, imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&crop=center" },
        { id: 'P014', name: 'Foulard', category: 'accessoire', pressingPrice: 3.00, cleaningPressingPrice: 6.00, imageUrl: "https://images.unsplash.com/photo-1609709295948-17d77cb2a69e?w=300&h=300&fit=crop&crop=center" }
      ],
      orders: [
        {
          id: "PR2024-001234",
          clientName: "Marie Dubois",
          clientId: "CLI001",
          pieces: [
            { pieceId: 'P001', pieceName: 'Chemise', serviceType: 'cleaning-pressing', quantity: 3, unitPrice: 8.00, totalPrice: 24.00 },
            { pieceId: 'P002', pieceName: 'Pantalon', serviceType: 'cleaning-pressing', quantity: 2, unitPrice: 9.50, totalPrice: 19.00 }
          ],
          totalAmount: 43.00,
          status: "processing",
          createdAt: "2024-06-02T10:30:00",
          estimatedDate: "2024-06-04T17:00:00",
          paymentStatus: "paid",
          isExceptionalPrice: false
        },
        {
          id: "PR2024-001235",
          clientName: "Pierre Martin",
          clientId: "CLI002",
          pieces: [
            { pieceId: 'P001', pieceName: 'Chemise', serviceType: 'pressing', quantity: 5, unitPrice: 3.50, totalPrice: 17.50 },
            { pieceId: 'P003', pieceName: 'Veste', serviceType: 'pressing', quantity: 1, unitPrice: 6.50, totalPrice: 6.50 }
          ],
          totalAmount: 24.00,
          status: "ready",
          createdAt: "2024-06-01T14:15:00",
          estimatedDate: "2024-06-03T17:00:00",
          paymentStatus: "paid",
          isExceptionalPrice: false
        }
      ],
      professionalClients: [
        {
          id: "PRO001",
          companyName: "Hotel Royal",
          siret: "12345678901234",
          contactName: "Jean Directeur",
          email: "contact@hotelroyal.com",
          phone: "01 23 45 67 89",
          billingAddress: "789 Boulevard Haussmann, 75009 Paris",
          paymentTerms: 30,
          specialRate: 15,
          totalOrders: 156,
          totalSpent: 12456.00,
          outstandingAmount: 1234.50,
          createdAt: "2024-01-10"
        },
        {
          id: "PRO002",
          companyName: "Restaurant Le Gourmet",
          siret: "98765432109876",
          contactName: "Marie Chef",
          email: "contact@legourmet.fr",
          phone: "01 98 76 54 32",
          billingAddress: "456 Rue de la Gastronomie, 75007 Paris",
          paymentTerms: 15,
          specialRate: 10,
          totalOrders: 89,
          totalSpent: 5632.00,
          outstandingAmount: 0,
          createdAt: "2024-02-15"
        }
      ],
      professionalOrders: [
        {
          id: "PRO2024-001236",
          clientId: "PRO001",
          clientName: "Hotel Royal",
          pieces: 24,
          service: "cleaning-pressing",
          totalAmount: 180.00,
          status: "processing",
          paymentStatus: "pending",
          createdAt: "2024-06-02T09:00:00",
          deliveryDate: "2024-06-05T10:00:00",
          dueDate: "2024-07-02T00:00:00",
          priority: "high"
        },
        {
          id: "PRO2024-001237",
          clientId: "PRO002",
          clientName: "Restaurant Le Gourmet",
          pieces: 12,
          service: "pressing",
          totalAmount: 35.00,
          status: "ready",
          paymentStatus: "paid",
          createdAt: "2024-06-01T14:00:00",
          deliveryDate: "2024-06-03T16:00:00",
          dueDate: "2024-06-16T00:00:00",
          priority: "normal"
        }
      ]
    };
  }

  // Méthodes pour les clients
  async getAllClients(): Promise<Client[]> {
    const data = this.getStoredData();
    return data.clients;
  }

  async getClientById(id: string): Promise<Client | undefined> {
    const data = this.getStoredData();
    return data.clients.find((client: Client) => client.id === id);
  }

  async addClient(client: Omit<Client, 'totalOrders' | 'totalSpent'>): Promise<Client> {
    const data = this.getStoredData();
    const newClient = {
      ...client,
      totalOrders: 0,
      totalSpent: 0
    };
    data.clients.push(newClient);
    this.setStoredData(data);
    return newClient;
  }
  // Méthodes pour les pièces
  async getAllPieces(): Promise<Piece[]> {
    const data = this.getStoredData();
    return data.pieces;
  }

  async addPiece(piece: Piece): Promise<Piece> {
    const data = this.getStoredData();
    data.pieces.push(piece);
    this.setStoredData(data);
    return piece;
  }

  async updatePiece(piece: Piece): Promise<Piece> {
    const data = this.getStoredData();
    const index = data.pieces.findIndex(p => p.id === piece.id);
    if (index !== -1) {
      data.pieces[index] = piece;
      this.setStoredData(data);
    }
    return piece;
  }

  async deletePiece(pieceId: string): Promise<void> {
    const data = this.getStoredData();
    data.pieces = data.pieces.filter(p => p.id !== pieceId);
    this.setStoredData(data);
  }

  async getPieceById(id: string): Promise<Piece | undefined> {
    const data = this.getStoredData();
    return data.pieces.find((piece: Piece) => piece.id === id);
  }

  // Méthodes pour les commandes
  async getAllOrders(): Promise<Order[]> {
    const data = this.getStoredData();
    return data.orders;
  }
  async addOrder(order: Order): Promise<Order> {
    const data = this.getStoredData();
    data.orders.push(order);
    this.setStoredData(data);
    return order;
  }

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
    const data = this.getStoredData();
    const orderIndex = data.orders.findIndex((order: Order) => order.id === orderId);
    if (orderIndex === -1) {
      throw new Error(`Commande avec l'ID ${orderId} non trouvée`);
    }
    
    data.orders[orderIndex] = { ...data.orders[orderIndex], ...updates };
    this.setStoredData(data);
    return data.orders[orderIndex];
  }

  // Méthodes pour les clients professionnels
  async getAllProfessionalClients(): Promise<ProfessionalClient[]> {
    const data = this.getStoredData();
    return data.professionalClients;
  }
  async addProfessionalClient(client: Omit<ProfessionalClient, 'totalOrders' | 'totalSpent' | 'outstandingAmount'>): Promise<ProfessionalClient> {
    const data = this.getStoredData();
    const newClient = {
      ...client,
      totalOrders: 0,
      totalSpent: 0,
      outstandingAmount: 0
    };
    data.professionalClients.push(newClient);
    this.setStoredData(data);
    return newClient;
  }

  async updateProfessionalClient(client: ProfessionalClient): Promise<ProfessionalClient> {
    const data = this.getStoredData();
    const index = data.professionalClients.findIndex(c => c.id === client.id);
    if (index !== -1) {
      data.professionalClients[index] = client;
      this.setStoredData(data);
    }
    return client;
  }

  async deleteProfessionalClient(clientId: string): Promise<void> {
    const data = this.getStoredData();
    data.professionalClients = data.professionalClients.filter(c => c.id !== clientId);
    this.setStoredData(data);
  }

  // Méthodes pour les commandes professionnelles
  async getAllProfessionalOrders(): Promise<ProfessionalOrder[]> {
    const data = this.getStoredData();
    return data.professionalOrders;
  }

  async addProfessionalOrder(order: ProfessionalOrder): Promise<ProfessionalOrder> {
    const data = this.getStoredData();
    data.professionalOrders.push(order);
    this.setStoredData(data);
    return order;
  }

  async updateProfessionalOrder(order: ProfessionalOrder): Promise<ProfessionalOrder> {
    const data = this.getStoredData();
    const index = data.professionalOrders.findIndex(o => o.id === order.id);
    if (index !== -1) {
      data.professionalOrders[index] = order;
      this.setStoredData(data);
    }
    return order;
  }

  async deleteProfessionalOrder(orderId: string): Promise<void> {
    const data = this.getStoredData();
    data.professionalOrders = data.professionalOrders.filter(o => o.id !== orderId);
    this.setStoredData(data);
  }
}

// Instance singleton
const dbAPI = new ClientDatabaseAPI();

// Hooks personnalisés
export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await dbAPI.getAllClients();
        setClients(data);
      } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);

  const addClient = async (client: Omit<Client, 'totalOrders' | 'totalSpent'>) => {
    try {
      const newClient = await dbAPI.addClient(client);
      setClients(prev => [...prev, newClient]);
      return newClient;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du client:', error);
      throw error;
    }
  };

  return { clients, loading, addClient };
};

export const usePieces = () => {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPieces = async () => {
      try {
        const data = await dbAPI.getAllPieces();
        setPieces(data);
      } catch (error) {
        console.error('Erreur lors du chargement des pièces:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPieces();
  }, []);

  const addPiece = async (piece: Piece) => {
    try {
      const newPiece = await dbAPI.addPiece(piece);
      setPieces(prev => [...prev, newPiece]);
      return newPiece;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la pièce:', error);
      throw error;
    }
  };

  const updatePiece = async (piece: Piece) => {
    try {
      const updatedPiece = await dbAPI.updatePiece(piece);
      setPieces(prev => prev.map(p => p.id === piece.id ? updatedPiece : p));
      return updatedPiece;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la pièce:', error);
      throw error;
    }
  };

  const deletePiece = async (pieceId: string) => {
    try {
      await dbAPI.deletePiece(pieceId);
      setPieces(prev => prev.filter(p => p.id !== pieceId));
    } catch (error) {
      console.error('Erreur lors de la suppression de la pièce:', error);
      throw error;
    }
  };

  return { pieces, loading, addPiece, updatePiece, deletePiece };
};

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await dbAPI.getAllOrders();
        setOrders(data);
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);
  const addOrder = async (order: Order) => {
    try {
      const newOrder = await dbAPI.addOrder(order);
      setOrders(prev => [...prev, newOrder]);
      return newOrder;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la commande:', error);
      throw error;
    }
  };

  const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    try {
      const updatedOrder = await dbAPI.updateOrder(orderId, updates);
      setOrders(prev => prev.map(order => order.id === orderId ? updatedOrder : order));
      return updatedOrder;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
      throw error;
    }
  };

  return { orders, loading, addOrder, updateOrder };
};

export const useProfessionalClients = () => {
  const [clients, setClients] = useState<ProfessionalClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await dbAPI.getAllProfessionalClients();
        setClients(data);
      } catch (error) {
        console.error('Erreur lors du chargement des clients professionnels:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);
  const addClient = async (client: Omit<ProfessionalClient, 'totalOrders' | 'totalSpent' | 'outstandingAmount'>) => {
    try {
      const newClient = await dbAPI.addProfessionalClient(client);
      setClients(prev => [...prev, newClient]);
      return newClient;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du client professionnel:', error);
      throw error;
    }
  };

  const updateClient = async (client: ProfessionalClient) => {
    try {
      const updatedClient = await dbAPI.updateProfessionalClient(client);
      setClients(prev => prev.map(c => c.id === client.id ? updatedClient : c));
      return updatedClient;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client professionnel:', error);
      throw error;
    }
  };

  const deleteClient = async (clientId: string) => {
    try {
      await dbAPI.deleteProfessionalClient(clientId);
      setClients(prev => prev.filter(c => c.id !== clientId));
    } catch (error) {
      console.error('Erreur lors de la suppression du client professionnel:', error);
      throw error;
    }
  };

  return { clients, loading, addClient, updateClient, deleteClient };
};

export const useProfessionalOrders = () => {
  const [orders, setOrders] = useState<ProfessionalOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await dbAPI.getAllProfessionalOrders();
        setOrders(data);
      } catch (error) {
        console.error('Erreur lors du chargement des commandes professionnelles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);
  const addOrder = async (order: ProfessionalOrder) => {
    try {
      const newOrder = await dbAPI.addProfessionalOrder(order);
      setOrders(prev => [...prev, newOrder]);
      return newOrder;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la commande professionnelle:', error);
      throw error;
    }
  };

  const updateOrder = async (order: ProfessionalOrder) => {
    try {
      const updatedOrder = await dbAPI.updateProfessionalOrder(order);
      setOrders(prev => prev.map(o => o.id === order.id ? updatedOrder : o));
      return updatedOrder;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la commande professionnelle:', error);
      throw error;
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await dbAPI.deleteProfessionalOrder(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande professionnelle:', error);
      throw error;
    }
  };

  return { orders, loading, addOrder, updateOrder, deleteOrder };
};

export default dbAPI;
