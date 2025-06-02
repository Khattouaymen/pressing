
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  Plus, 
  Search, 
  FileText, 
  Calendar,
  Euro,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users
} from "lucide-react";

interface ProfessionalClient {
  id: string;
  companyName: string;
  siret: string;
  contactName: string;
  email: string;
  phone: string;
  billingAddress: string;
  paymentTerms: number; // jours
  specialRate: number; // remise en %
  totalOrders: number;
  totalSpent: number;
  outstandingAmount: number;
  createdAt: string;
}

interface ProfessionalOrder {
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

export const ProfessionalDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  
  const [newClient, setNewClient] = useState({
    companyName: '',
    siret: '',
    contactName: '',
    email: '',
    phone: '',
    billingAddress: '',
    paymentTerms: 30,
    specialRate: 0
  });

  const [newOrder, setNewOrder] = useState({
    clientId: '',
    pieces: 1,
    service: 'cleaning-pressing',
    priority: 'normal' as 'normal' | 'high'
  });

  // Mock data
  const [professionalClients] = useState<ProfessionalClient[]>([
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
  ]);

  const [professionalOrders] = useState<ProfessionalOrder[]>([
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
  ]);

  const calculateTotalOutstanding = () => {
    return professionalClients.reduce((total, client) => total + client.outstandingAmount, 0);
  };

  const getOverdueOrders = () => {
    return professionalOrders.filter(order => 
      order.paymentStatus === 'pending' && new Date(order.dueDate) < new Date()
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received": return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ready": return "bg-green-100 text-green-800 border-green-200";
      case "delivered": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleAddClient = () => {
    console.log('Adding professional client:', newClient);
    setIsAddingClient(false);
    setNewClient({
      companyName: '',
      siret: '',
      contactName: '',
      email: '',
      phone: '',
      billingAddress: '',
      paymentTerms: 30,
      specialRate: 0
    });
  };

  const handleCreateOrder = () => {
    console.log('Creating professional order:', newOrder);
    setIsCreatingOrder(false);
    setNewOrder({
      clientId: '',
      pieces: 1,
      service: 'cleaning-pressing',
      priority: 'normal'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Espace Professionnel</h2>
          <p className="text-gray-600">Gestion des clients et commandes B2B</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isAddingClient} onOpenChange={setIsAddingClient}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Building2 className="w-4 h-4 mr-2" />
                Nouveau Client Pro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Ajouter un client professionnel</DialogTitle>
                <DialogDescription>
                  Créez un nouveau profil client pour une entreprise
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Raison sociale</Label>
                  <Input
                    id="companyName"
                    value={newClient.companyName}
                    onChange={(e) => setNewClient({...newClient, companyName: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="siret">SIRET</Label>
                  <Input
                    id="siret"
                    value={newClient.siret}
                    onChange={(e) => setNewClient({...newClient, siret: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactName">Contact principal</Label>
                    <Input
                      id="contactName"
                      value={newClient.contactName}
                      onChange={(e) => setNewClient({...newClient, contactName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="billingAddress">Adresse de facturation</Label>
                  <Input
                    id="billingAddress"
                    value={newClient.billingAddress}
                    onChange={(e) => setNewClient({...newClient, billingAddress: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentTerms">Délai de paiement (jours)</Label>
                    <Input
                      id="paymentTerms"
                      type="number"
                      value={newClient.paymentTerms}
                      onChange={(e) => setNewClient({...newClient, paymentTerms: parseInt(e.target.value) || 30})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialRate">Remise négociée (%)</Label>
                    <Input
                      id="specialRate"
                      type="number"
                      min="0"
                      max="50"
                      value={newClient.specialRate}
                      onChange={(e) => setNewClient({...newClient, specialRate: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddingClient(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddClient}>
                    Créer le client
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreatingOrder} onOpenChange={setIsCreatingOrder}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Commande Pro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Créer une commande professionnelle</DialogTitle>
                <DialogDescription>
                  Enregistrez une nouvelle commande B2B
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="client">Client professionnel</Label>
                  <Select value={newOrder.clientId} onValueChange={(value) => setNewOrder({...newOrder, clientId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionalClients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="service">Service</Label>
                  <Select value={newOrder.service} onValueChange={(value) => setNewOrder({...newOrder, service: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pressing">Repassage</SelectItem>
                      <SelectItem value="cleaning-pressing">Nettoyage + Repassage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="pieces">Nombre de pièces</Label>
                  <Input
                    id="pieces"
                    type="number"
                    min="1"
                    value={newOrder.pieces}
                    onChange={(e) => setNewOrder({...newOrder, pieces: parseInt(e.target.value) || 1})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">Priorité</Label>
                  <Select value={newOrder.priority} onValueChange={(value: any) => setNewOrder({...newOrder, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normale</SelectItem>
                      <SelectItem value="high">Prioritaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreatingOrder(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateOrder}>
                    Créer la commande
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats B2B */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients Professionnels</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{professionalClients.length}</div>
            <p className="text-xs text-muted-foreground">Clients actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes en cours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {professionalOrders.filter(o => o.status !== 'delivered').length}
            </div>
            <p className="text-xs text-muted-foreground">À traiter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impayés</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              €{calculateTotalOutstanding().toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {getOverdueOrders().length} factures en retard
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA Professionnel</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{professionalClients.reduce((total, client) => total + client.totalSpent, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Total cumulé</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">Clients Professionnels</TabsTrigger>
          <TabsTrigger value="orders">Commandes B2B</TabsTrigger>
          <TabsTrigger value="billing">Facturation</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {professionalClients.map((client) => (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{client.companyName}</CardTitle>
                    {client.outstandingAmount > 0 && (
                      <Badge variant="destructive">
                        €{client.outstandingAmount.toFixed(2)} dû
                      </Badge>
                    )}
                  </div>
                  <CardDescription>SIRET: {client.siret}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <strong>Contact:</strong> {client.contactName}
                  </div>
                  <div className="text-sm">
                    <strong>Email:</strong> {client.email}
                  </div>
                  <div className="text-sm">
                    <strong>Téléphone:</strong> {client.phone}
                  </div>
                  <div className="text-sm">
                    <strong>Délai de paiement:</strong> {client.paymentTerms} jours
                  </div>
                  <div className="text-sm">
                    <strong>Remise négociée:</strong> {client.specialRate}%
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-sm">
                    <span><strong>{client.totalOrders}</strong> commandes</span>
                    <span><strong>€{client.totalSpent.toFixed(2)}</strong> CA total</span>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    Voir l'historique
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="space-y-4">
            {professionalOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg">{order.id}</h3>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status === 'received' ? 'Reçu' : 
                           order.status === 'processing' ? 'En traitement' :
                           order.status === 'ready' ? 'Prêt' : 'Livré'}
                        </Badge>
                        <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                          {order.paymentStatus === 'paid' ? 'Payé' :
                           order.paymentStatus === 'pending' ? 'En attente' : 'En retard'}
                        </Badge>
                        {order.priority === 'high' && (
                          <Badge variant="destructive">Prioritaire</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Client:</span>
                          <div className="font-medium">{order.clientName}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Service:</span>
                          <div className="font-medium">
                            {order.service === 'pressing' ? 'Repassage' : 'Nettoyage + Repassage'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Pièces:</span>
                          <div className="font-medium">{order.pieces} pièces</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Montant:</span>
                          <div className="font-medium">€{order.totalAmount.toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Livraison:</span>
                          <div className="font-medium">{new Date(order.deliveryDate).toLocaleDateString('fr-FR')}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Échéance:</span>
                          <div className="font-medium">{new Date(order.dueDate).toLocaleDateString('fr-FR')}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Bon de livraison
                      </Button>
                      <Select>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Actions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="processing">En traitement</SelectItem>
                          <SelectItem value="ready">Prêt</SelectItem>
                          <SelectItem value="delivered">Livré</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Facturation en attente</CardTitle>
              <CardDescription>Commandes livrées en attente de facturation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Aucune facture en attente
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
