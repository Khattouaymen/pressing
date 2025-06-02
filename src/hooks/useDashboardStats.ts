import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3001/api';

interface DashboardStats {
  todayOrders: number;
  pendingOrders: number;
  completedToday: number;
  revenue: number;
  individualClients: number;
  professionalClients: number;
}

interface RecentOrder {
  id: string;
  clientName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todayOrders: 0,
    pendingOrders: 0,
    completedToday: 0,
    revenue: 0,
    individualClients: 0,
    professionalClients: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Récupérer toutes les commandes
      const ordersResponse = await fetch(`${API_BASE_URL}/orders`);
      const orders = await ordersResponse.json();
      
      // Récupérer toutes les commandes professionnelles
      const profOrdersResponse = await fetch(`${API_BASE_URL}/professional-orders`);
      const profOrders = await profOrdersResponse.json();
      
      // Récupérer tous les clients
      const clientsResponse = await fetch(`${API_BASE_URL}/clients`);
      const clients = await clientsResponse.json();
      
      // Récupérer tous les clients professionnels
      const profClientsResponse = await fetch(`${API_BASE_URL}/professional-clients`);
      const profClients = await profClientsResponse.json();
      
      // Calculer les statistiques
      const today = new Date().toISOString().split('T')[0];
      
      // Combiner toutes les commandes
      const allOrders = [
        ...orders.map((order: any) => ({ ...order, type: 'individual' })),
        ...profOrders.map((order: any) => ({ ...order, type: 'professional' }))
      ];
      
      // Commandes du jour
      const todayOrders = allOrders.filter(order => 
        order.createdAt.startsWith(today)
      ).length;
      
      // Commandes en attente
      const pendingOrders = allOrders.filter(order => 
        order.status === 'En traitement' || order.status === 'Reçu'
      ).length;
      
      // Commandes complétées aujourd'hui
      const completedToday = allOrders.filter(order => 
        order.createdAt.startsWith(today) && order.status === 'Prêt'
      ).length;
      
      // Chiffre d'affaires du jour
      const revenue = allOrders
        .filter(order => order.createdAt.startsWith(today))
        .reduce((sum, order) => sum + order.totalAmount, 0);
      
      // Compter les clients
      const individualClients = clients.length;
      const professionalClients = profClients.length;
      
      // Commandes récentes (les 5 dernières)
      const sortedOrders = allOrders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(order => ({
          id: order.id,
          clientName: order.clientName,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt
        }));
      
      setStats({
        todayOrders,
        pendingOrders,
        completedToday,
        revenue,
        individualClients,
        professionalClients
      });
      
      setRecentOrders(sortedOrders);
      
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, recentOrders, loading, refreshStats: fetchStats };
};
