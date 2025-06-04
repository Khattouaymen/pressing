
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Building2, 
  ClipboardList, 
  TrendingUp, 
  Clock, 
  Coins,
  Package,
  CheckCircle,
  AlertCircle,
  Plus,
  Shirt,
  Loader2,
  RefreshCw
} from "lucide-react";
import { ClientManagement } from "@/components/ClientManagement";
import { OrderManagement } from "@/components/OrderManagement";
import { ProfessionalDashboard } from "@/components/ProfessionalDashboard";
import { PieceManagement } from "@/components/PieceManagement";
import { useOrders, useClients, useProfessionalOrders, useProfessionalClients } from "@/hooks/useApiDatabase";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Use the working hooks that all other sections use successfully
  const { orders, loading: ordersLoading } = useOrders();
  const { clients, loading: clientsLoading } = useClients();
  const { orders: professionalOrders, loading: profOrdersLoading } = useProfessionalOrders();
  const { clients: professionalClients, loading: profClientsLoading } = useProfessionalClients();

  // Calculate stats from working data
  const loading = ordersLoading || clientsLoading || profOrdersLoading || profClientsLoading;

  const calculateStats = () => {
    if (loading) {
      return {
        todayOrders: 0,
        pendingOrders: 0,
        completedToday: 0,
        revenue: 0,
        individualClients: 0,
        professionalClients: 0
      };
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Combine all orders
    const allOrders = [
      ...orders.map((order: any) => ({ ...order, type: 'individual' })),
      ...professionalOrders.map((order: any) => ({ ...order, type: 'professional' }))
    ];

    // Calculate stats using the same logic but with working data
    const todayOrders = allOrders.filter(order => 
      order.createdAt.startsWith(today)
    ).length;

    const pendingOrders = allOrders.filter(order => 
      order.status === 'processing' || order.status === 'received'
    ).length;

    const completedToday = allOrders.filter(order => 
      order.createdAt.startsWith(today) && order.status === 'ready'
    ).length;

    const revenue = allOrders
      .filter(order => order.createdAt.startsWith(today))
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      todayOrders,
      pendingOrders,
      completedToday,
      revenue,
      individualClients: clients.length,
      professionalClients: professionalClients.length
    };
  };

  const getRecentOrders = () => {
    if (loading) return [];
    
    const allOrders = [
      ...orders.map((order: any) => ({ ...order, type: 'individual' })),
      ...professionalOrders.map((order: any) => ({ ...order, type: 'professional' }))
    ];

    return allOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(order => ({
        id: order.id,
        clientName: order.clientName,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      }));
  };

  const stats = calculateStats();
  const recentOrders = getRecentOrders();
  const getStatusColor = (status: string) => {
    switch (status) {
      case "received": return "bg-blue-100 text-blue-800";
      case "processing": return "bg-yellow-100 text-yellow-800";
      case "ready": return "bg-green-100 text-green-800";
      case "delivered": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "received": return "Reçu";
      case "processing": return "En traitement";
      case "ready": return "Prêt";
      case "delivered": return "Récupéré";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PressingPro</h1>
              <p className="text-sm text-gray-600">Système de gestion de pressing</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Système opérationnel
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Commandes
            </TabsTrigger>
            <TabsTrigger value="pieces" className="flex items-center gap-2">
              <Shirt className="w-4 h-4" />
              Pièces
            </TabsTrigger>
            <TabsTrigger value="professional" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Professionnels
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Commandes du jour</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayOrders}</div>
                  <p className="text-xs text-muted-foreground">+12% par rapport à hier</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En attente</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                  <p className="text-xs text-muted-foreground">À traiter en priorité</p>
                </CardContent>
              </Card>

              <Card>                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
                  <Coins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.revenue} DH</div>
                  <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clients actifs</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.individualClients + stats.professionalClients}</div>
                  <p className="text-xs text-muted-foreground">{stats.individualClients} particuliers, {stats.professionalClients} pro</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Commandes récentes</CardTitle>
                <CardDescription>Aperçu des dernières commandes reçues</CardDescription>
              </CardHeader>              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <p className="text-gray-500">Chargement des commandes...</p>
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Aucune commande récente</p>
                    </div>
                  ) : (
                    recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{order.id}</p>
                            <p className="text-sm text-gray-600">{order.clientName}</p>
                          </div>
                          <div>
                            <p className="text-sm">Service pressing</p>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusLabel(order.status)}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{order.totalAmount?.toFixed(2)} DH</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients">
            <ClientManagement />
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="pieces">
            <PieceManagement />
          </TabsContent>

          <TabsContent value="professional">
            <ProfessionalDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
