import { useState, useEffect } from 'react';
import { getDatabase } from '@/lib/database';
import type { 
  DbClient, 
  DbPiece, 
  DbOrder, 
  DbProfessionalClient, 
  DbProfessionalOrder 
} from '@/lib/database';

// Types pour l'interface (réutilisation des types existants)
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

// Hooks SQLite
export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClients = async () => {
    try {
      setLoading(true);
      const db = getDatabase();
      const dbClients = db.getAllClients();
      setClients(dbClients);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (clientData: Omit<Client, 'id' | 'totalOrders' | 'totalSpent'>) => {
    try {
      const db = getDatabase();
      const newClient: DbClient = {
        ...clientData,
        id: Date.now().toString(),
        totalOrders: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString()
      };
      db.insertClient(newClient);
      await loadClients();
      return newClient;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du client:', error);
      throw error;
    }
  };

  const updateClient = async (client: Client) => {
    try {
      const db = getDatabase();
      db.updateClient(client);
      await loadClients();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client:', error);
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const db = getDatabase();
      db.deleteClient(id);
      await loadClients();
    } catch (error) {
      console.error('Erreur lors de la suppression du client:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  return { clients, loading, addClient, updateClient, deleteClient };
}

export function usePieces() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [loading, setLoading] = useState(true);
  const loadPieces = async () => {
    try {
      setLoading(true);
      const db = getDatabase();
      const dbPieces = db.getAllPieces();
      // Conversion explicite des types
      const pieces: Piece[] = dbPieces.map(piece => ({
        ...piece,
        category: piece.category as 'vetement' | 'linge' | 'accessoire'
      }));
      setPieces(pieces);
    } catch (error) {
      console.error('Erreur lors du chargement des pièces:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPiece = async (pieceData: Omit<Piece, 'id'>) => {
    try {
      const db = getDatabase();
      const newPiece: DbPiece = {
        ...pieceData,
        id: Date.now().toString(),
        imageUrl: pieceData.imageUrl || ''
      };
      db.insertPiece(newPiece);
      await loadPieces();
      return newPiece;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la pièce:', error);
      throw error;
    }
  };

  const updatePiece = async (piece: Piece) => {
    try {
      const db = getDatabase();
      const dbPiece: DbPiece = {
        ...piece,
        imageUrl: piece.imageUrl || ''
      };
      db.updatePiece(dbPiece);
      await loadPieces();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la pièce:', error);
      throw error;
    }
  };

  const deletePiece = async (id: string) => {
    try {
      const db = getDatabase();
      db.deletePiece(id);
      await loadPieces();
    } catch (error) {
      console.error('Erreur lors de la suppression de la pièce:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadPieces();
  }, []);

  return { pieces, loading, addPiece, updatePiece, deletePiece };
}

export function useProfessionalClients() {
  const [clients, setClients] = useState<ProfessionalClient[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClients = async () => {
    try {
      setLoading(true);
      const db = getDatabase();
      const dbClients = db.getAllProfessionalClients();
      setClients(dbClients);
    } catch (error) {
      console.error('Erreur lors du chargement des clients professionnels:', error);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (clientData: Omit<ProfessionalClient, 'id' | 'totalOrders' | 'totalSpent' | 'outstandingAmount'>) => {
    try {
      const db = getDatabase();
      const newClient: DbProfessionalClient = {
        ...clientData,
        id: Date.now().toString(),
        totalOrders: 0,
        totalSpent: 0,
        outstandingAmount: 0,
        createdAt: new Date().toISOString()
      };
      db.insertProfessionalClient(newClient);
      await loadClients();
      return newClient;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du client professionnel:', error);
      throw error;
    }
  };

  const updateClient = async (client: ProfessionalClient) => {
    try {
      const db = getDatabase();
      db.updateProfessionalClient(client);
      await loadClients();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client professionnel:', error);
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const db = getDatabase();
      db.deleteProfessionalClient(id);
      await loadClients();
    } catch (error) {
      console.error('Erreur lors de la suppression du client professionnel:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  return { clients, loading, addClient, updateClient, deleteClient };
}

export function useProfessionalOrders() {
  const [orders, setOrders] = useState<ProfessionalOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const db = getDatabase();
      const dbOrders = db.getAllProfessionalOrders();
      setOrders(dbOrders);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes professionnelles:', error);
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (orderData: Omit<ProfessionalOrder, 'id'>) => {
    try {
      const db = getDatabase();
      const newOrder: DbProfessionalOrder = {
        ...orderData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      db.insertProfessionalOrder(newOrder);
      await loadOrders();
      return newOrder;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la commande professionnelle:', error);
      throw error;
    }
  };

  const updateOrder = async (order: ProfessionalOrder) => {
    try {
      const db = getDatabase();
      db.updateProfessionalOrder(order);
      await loadOrders();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la commande professionnelle:', error);
      throw error;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const db = getDatabase();
      db.deleteProfessionalOrder(id);
      await loadOrders();
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande professionnelle:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return { orders, loading, addOrder, updateOrder, deleteOrder };
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const db = getDatabase();
      const dbOrders = db.getAllOrders();
      
      // Convertir les commandes DB en format interface avec les pièces
      const ordersWithPieces = dbOrders.map(order => {
        const orderPieces = db.getOrderPieces(order.id);
        return {
          ...order,
          pieces: orderPieces.map(piece => ({
            pieceId: piece.pieceId,
            pieceName: piece.pieceName,
            serviceType: piece.serviceType,
            quantity: piece.quantity,
            unitPrice: piece.unitPrice,
            totalPrice: piece.totalPrice
          }))
        };
      });
      
      setOrders(ordersWithPieces);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id'>) => {
    try {
      const db = getDatabase();
      const orderId = Date.now().toString();
      
      const newOrder: DbOrder = {
        id: orderId,
        clientId: orderData.clientId,
        clientName: orderData.clientName,
        totalAmount: orderData.totalAmount,
        status: orderData.status,
        paymentStatus: orderData.paymentStatus,
        createdAt: new Date().toISOString(),
        estimatedDate: orderData.estimatedDate,
        isExceptionalPrice: orderData.isExceptionalPrice
      };
      
      db.insertOrder(newOrder);
      
      // Insérer les pièces de la commande
      orderData.pieces.forEach(piece => {
        const orderPiece = {
          id: `${orderId}_${piece.pieceId}_${Date.now()}`,
          orderId: orderId,
          pieceId: piece.pieceId,
          pieceName: piece.pieceName,
          serviceType: piece.serviceType,
          quantity: piece.quantity,
          unitPrice: piece.unitPrice,
          totalPrice: piece.totalPrice
        };
        db.insertOrderPiece(orderPiece);
      });
      
      await loadOrders();
      return { ...newOrder, pieces: orderData.pieces };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la commande:', error);
      throw error;
    }
  };

  const updateOrder = async (order: Order) => {
    try {
      const db = getDatabase();
      const dbOrder: DbOrder = {
        id: order.id,
        clientId: order.clientId,
        clientName: order.clientName,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        estimatedDate: order.estimatedDate,
        isExceptionalPrice: order.isExceptionalPrice
      };
      
      db.updateOrder(dbOrder);
      await loadOrders();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
      throw error;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const db = getDatabase();
      db.deleteOrder(id);
      await loadOrders();
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return { orders, loading, addOrder, updateOrder, deleteOrder };
}
