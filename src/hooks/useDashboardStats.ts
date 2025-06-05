import { useState, useEffect } from 'react';

// Dynamic API base URL detection - same as useApiDatabase.ts
const getApiBaseUrl = (): string => {
  const currentHost = window.location.hostname;
  const currentOrigin = window.location.origin;
  
  console.log('Dashboard: Detecting API URL from origin:', currentOrigin);
  
  // Check if we're accessing via dev tunnels
  if (currentOrigin.includes('devtunnels.ms')) {
    // Extract the tunnel prefix and construct API URL
    // From https://j9cqjllv-8080.uks1.devtunnels.ms to https://j9cqjllv-3001.uks1.devtunnels.ms
    const tunnelBase = currentOrigin.replace('-8080', '-3001');
    const apiUrl = `${tunnelBase}/api`;
    console.log('Dashboard: Tunnel environment detected, using API URL:', apiUrl);
    return apiUrl;
  }
  
  // Default to localhost for local development
  const localUrl = 'http://localhost:3001/api';
  console.log('Dashboard: Local environment detected, using API URL:', localUrl);
  return localUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Debug logging
console.log('Dashboard API Base URL configured:', API_BASE_URL);

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
  });  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async (retryAttempt = 1) => {
    try {
      setLoading(true);
      console.log(`🔄 Dashboard: Fetching stats (attempt ${retryAttempt}) from:`, API_BASE_URL);
      console.log('🌐 Dashboard: Current window.location:', window.location.href);
      
      // Add a delay for tunnel connections on first attempt
      if (window.location.origin.includes('devtunnels.ms') && retryAttempt === 1) {
        console.log('⏳ Dashboard: Tunnel detected, adding initial delay...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Récupérer toutes les commandes avec gestion d'erreur améliorée
      console.log('Fetching orders...');
      const ordersResponse = await fetch(`${API_BASE_URL}/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Orders response status:', ordersResponse.status);
      if (!ordersResponse.ok) {
        throw new Error(`Failed to fetch orders: ${ordersResponse.status} ${ordersResponse.statusText}`);
      }
      const orders = await ordersResponse.json();
      console.log('Orders fetched:', orders.length);
      
      // Récupérer toutes les commandes professionnelles
      console.log('Fetching professional orders...');
      const profOrdersResponse = await fetch(`${API_BASE_URL}/professional-orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Professional orders response status:', profOrdersResponse.status);
      if (!profOrdersResponse.ok) {
        throw new Error(`Failed to fetch professional orders: ${profOrdersResponse.status} ${profOrdersResponse.statusText}`);
      }
      const profOrders = await profOrdersResponse.json();
      console.log('Professional orders fetched:', profOrders.length);
      
      // Récupérer tous les clients
      console.log('Fetching clients...');
      const clientsResponse = await fetch(`${API_BASE_URL}/clients`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Clients response status:', clientsResponse.status);
      if (!clientsResponse.ok) {
        throw new Error(`Failed to fetch clients: ${clientsResponse.status} ${clientsResponse.statusText}`);
      }
      const clients = await clientsResponse.json();
      console.log('Clients fetched:', clients.length);
      
      // Récupérer tous les clients professionnels
      console.log('Fetching professional clients...');
      const profClientsResponse = await fetch(`${API_BASE_URL}/professional-clients`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Professional clients response status:', profClientsResponse.status);
      if (!profClientsResponse.ok) {
        throw new Error(`Failed to fetch professional clients: ${profClientsResponse.status} ${profClientsResponse.statusText}`);
      }
      const profClients = await profClientsResponse.json();
      console.log('Professional clients fetched:', profClients.length);
      
      console.log('Dashboard data fetched successfully:', {
        orders: orders.length,
        profOrders: profOrders.length,
        clients: clients.length,
        profClients: profClients.length
      });
      
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
        order.status === 'processing' || order.status === 'received'
      ).length;
      
      // Commandes complétées aujourd'hui
      const completedToday = allOrders.filter(order => 
        order.createdAt.startsWith(today) && order.status === 'ready'
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
      console.error('❌ Erreur lors du chargement des statistiques:', error);
      console.error('❌ API URL used:', API_BASE_URL);
      console.error('❌ Current location:', window.location.href);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Set default values in case of error
      setStats({
        todayOrders: 0,
        pendingOrders: 0,
        completedToday: 0,
        revenue: 0,
        individualClients: 0,
        professionalClients: 0
      });
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, recentOrders, loading, refreshStats: fetchStats };
};
