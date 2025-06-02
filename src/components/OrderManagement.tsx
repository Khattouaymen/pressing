
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, Package, Clock, CheckCircle, Printer, QrCode, Euro, UserCheck } from "lucide-react";

interface Order {
  id: string;
  clientName: string;
  clientId: string;
  service: 'pressing' | 'cleaning-pressing';
  pieces: number;
  totalAmount: number;
  status: 'received' | 'processing' | 'ready' | 'collected';
  createdAt: string;
  estimatedDate: string;
  paymentStatus: 'paid' | 'pending';
  isExceptionalPrice: boolean;
  originalPrice?: number;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  type: 'individual' | 'professional';
  companyName?: string;
}

export const OrderManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [clientMode, setClientMode] = useState<'search' | 'create'>('search');
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    type: 'individual' as 'individual' | 'professional',
    companyName: ''
  });
  const [newOrder, setNewOrder] = useState({
    clientId: '',
    clientName: '',
    service: 'pressing' as 'pressing' | 'cleaning-pressing',
    pieces: 1,
    isExceptionalPrice: false,
    exceptionalAmount: 0
  });

  // Prix standards
  const STANDARD_PRICES = {
    pressing: 3.50,
    'cleaning-pressing': 8.00
  };

  // Mock clients data
  const [clients] = useState<Client[]>([
    {
      id: "CLI001",
      firstName: "Marie",
      lastName: "Dubois",
      phone: "06 12 34 56 78",
      email: "marie.dubois@email.com",
      address: "123 Rue de la Paix, 75001 Paris",
      type: 'individual'
    },
    {
      id: "CLI002",
      firstName: "Pierre",
      lastName: "Martin",
      phone: "06 98 76 54 32",
      email: "pierre.martin@email.com",
      address: "456 Avenue des Champs, 75008 Paris",
      type: 'individual'
    },
    {
      id: "PRO001",
      firstName: "Jean",
      lastName: "Directeur",
      phone: "01 23 45 67 89",
      email: "contact@hotelroyal.com",
      address: "789 Boulevard Haussmann, 75009 Paris",
      type: 'professional',
      companyName: "Hotel Royal"
    }
  ]);

  // Mock data
  const [orders] = useState<Order[]>([
    {
      id: "PR2024-001234",
      clientName: "Marie Dubois",
      clientId: "CLI001",
      service: "cleaning-pressing",
      pieces: 6,
      totalAmount: 48.00,
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
      service: "pressing",
      pieces: 8,
      totalAmount: 28.00,
      status: "ready",
      createdAt: "2024-06-01T14:15:00",
      estimatedDate: "2024-06-03T17:00:00",
      paymentStatus: "paid",
      isExceptionalPrice: false
    },
    {
      id: "PRO2024-001236",
      clientName: "Hotel Royal",
      clientId: "PRO001",
      service: "cleaning-pressing",
      pieces: 24,
      totalAmount: 180.00,
      status: "received",
      createdAt: "2024-06-02T09:00:00",
      estimatedDate: "2024-06-05T10:00:00",
      paymentStatus: "pending",
      isExceptionalPrice: true,
      originalPrice: 192.00
    }
  ]);

  // Filter clients for search
  const searchResults = clients.filter(client =>
    clientSearchTerm && (
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.phone.includes(clientSearchTerm) ||
      (client.companyName && client.companyName.toLowerCase().includes(clientSearchTerm.toLowerCase()))
    )
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received": return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ready": return "bg-green-100 text-green-800 border-green-200";
      case "collected": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "received": return "Reçu";
      case "processing": return "En traitement";
      case "ready": return "Prêt";
      case "collected": return "Récupéré";
      default: return status;
    }
  };

  const getServiceLabel = (service: string) => {
    switch (service) {
      case "pressing": return "Repassage";
      case "cleaning-pressing": return "Nettoyage + Repassage";
      default: return service;
    }
  };

  const calculateTotal = () => {
    if (newOrder.isExceptionalPrice) {
      return newOrder.exceptionalAmount;
    }
    return STANDARD_PRICES[newOrder.service] * newOrder.pieces;
  };

  const generateTrackingCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PR2024-${timestamp}${random}`;
  };

  const handleCreateOrder = () => {
    let clientInfo;
    
    if (clientMode === 'search' && selectedClient) {
      clientInfo = {
        clientId: selectedClient.id,
        clientName: selectedClient.companyName || `${selectedClient.firstName} ${selectedClient.lastName}`
      };
    } else {
      // Créer nouveau client
      const newClientId = `CLI${String(clients.length + 1).padStart(3, '0')}`;
      clientInfo = {
        clientId: newClientId,
        clientName: newClient.companyName || `${newClient.firstName} ${newClient.lastName}`
      };
      console.log('Nouveau client créé:', { ...newClient, id: newClientId });
    }

    const trackingCode = generateTrackingCode();
    console.log('Creating order:', {
      ...newOrder,
      ...clientInfo,
      id: trackingCode,
      totalAmount: calculateTotal(),
      createdAt: new Date().toISOString(),
      status: 'received',
      paymentStatus: 'paid'
    });
    
    resetForm();
    setIsCreatingOrder(false);
  };

  const resetForm = () => {
    setClientMode('search');
    setClientSearchTerm("");
    setSelectedClient(null);
    setNewClient({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      type: 'individual',
      companyName: ''
    });
    setNewOrder({
      clientId: '',
      clientName: '',
      service: 'pressing',
      pieces: 1,
      isExceptionalPrice: false,
      exceptionalAmount: 0
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsCreatingOrder(open);
    if (!open) {
      resetForm();
    }
  };

  const handlePrintReceipt = (order: Order) => {
    console.log('Printing receipt for order:', order.id);
  };

  const handlePrintLabels = (order: Order) => {
    console.log('Printing labels for order:', order.id);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Commandes</h2>
          <p className="text-gray-600">Créez et suivez les commandes de pressing</p>
        </div>
        
        <Dialog open={isCreatingOrder} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Commande
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle commande</DialogTitle>
              <DialogDescription>
                Recherchez un client existant ou créez un nouveau client, puis enregistrez la commande
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Sélection/Création client */}
              <div>
                <Label className="text-base font-medium">Client</Label>
                <Tabs value={clientMode} onValueChange={(value: any) => setClientMode(value)} className="w-full mt-2">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="search" className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Rechercher Client
                    </TabsTrigger>
                    <TabsTrigger value="create" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Nouveau Client
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="search" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="clientSearch">Rechercher un client existant</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="clientSearch"
                          placeholder="Nom, téléphone, email ou entreprise..."
                          value={clientSearchTerm}
                          onChange={(e) => setClientSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    {clientSearchTerm && (
                      <div className="max-h-48 overflow-y-auto border rounded-lg">
                        {searchResults.length > 0 ? (
                          <div className="space-y-1 p-2">
                            {searchResults.map((client) => (
                              <div
                                key={client.id}
                                className={`p-3 border rounded cursor-pointer transition-colors ${
                                  selectedClient?.id === client.id
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'hover:bg-gray-50'
                                }`}
                                onClick={() => setSelectedClient(client)}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">
                                      {client.firstName} {client.lastName}
                                    </p>
                                    {client.companyName && (
                                      <p className="text-sm text-blue-600">{client.companyName}</p>
                                    )}
                                    <p className="text-sm text-gray-600">{client.phone}</p>
                                  </div>
                                  <Badge variant={client.type === 'professional' ? 'default' : 'secondary'}>
                                    {client.type === 'professional' ? 'Pro' : 'Particulier'}
                                  </Badge>
                                </div>
                                {selectedClient?.id === client.id && (
                                  <div className="mt-2 flex items-center text-sm text-blue-600">
                                    <UserCheck className="w-4 h-4 mr-1" />
                                    Client sélectionné
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            Aucun client trouvé
                          </div>
                        )}
                      </div>
                    )}
                    
                    {!clientSearchTerm && (
                      <div className="text-center text-gray-500 py-6">
                        Commencez à taper pour rechercher un client
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="create" className="space-y-4 mt-4">
                    <Tabs value={newClient.type} onValueChange={(value: any) => setNewClient({...newClient, type: value})}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="individual">Particulier</TabsTrigger>
                        <TabsTrigger value="professional">Professionnel</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="individual" className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="firstName">Prénom</Label>
                            <Input
                              id="firstName"
                              value={newClient.firstName}
                              onChange={(e) => setNewClient({...newClient, firstName: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Nom</Label>
                            <Input
                              id="lastName"
                              value={newClient.lastName}
                              onChange={(e) => setNewClient({...newClient, lastName: e.target.value})}
                            />
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="professional" className="space-y-3">
                        <div>
                          <Label htmlFor="companyName">Raison sociale</Label>
                          <Input
                            id="companyName"
                            value={newClient.companyName}
                            onChange={(e) => setNewClient({...newClient, companyName: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="firstNamePro">Prénom contact</Label>
                            <Input
                              id="firstNamePro"
                              value={newClient.firstName}
                              onChange={(e) => setNewClient({...newClient, firstName: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastNamePro">Nom contact</Label>
                            <Input
                              id="lastNamePro"
                              value={newClient.lastName}
                              onChange={(e) => setNewClient({...newClient, lastName: e.target.value})}
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          value={newClient.phone}
                          onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                        />
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
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Adresse</Label>
                      <Input
                        id="address"
                        value={newClient.address}
                        onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <Separator />

              {/* Détails de la commande */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Détails de la commande</Label>
                
                {/* Service */}
                <div>
                  <Label htmlFor="service">Type de service</Label>
                  <Select value={newOrder.service} onValueChange={(value: any) => setNewOrder({...newOrder, service: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pressing">
                        <div className="flex justify-between items-center w-full">
                          <span>Repassage uniquement</span>
                          <span className="text-gray-500 ml-4">€{STANDARD_PRICES.pressing}/pièce</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="cleaning-pressing">
                        <div className="flex justify-between items-center w-full">
                          <span>Nettoyage + Repassage</span>
                          <span className="text-gray-500 ml-4">€{STANDARD_PRICES['cleaning-pressing']}/pièce</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Nombre de pièces */}
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

                {/* Prix exceptionnel */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="exceptionalPrice"
                      checked={newOrder.isExceptionalPrice}
                      onChange={(e) => setNewOrder({...newOrder, isExceptionalPrice: e.target.checked})}
                    />
                    <Label htmlFor="exceptionalPrice">Appliquer un prix exceptionnel</Label>
                  </div>
                  
                  {newOrder.isExceptionalPrice && (
                    <div>
                      <Label htmlFor="exceptionalAmount">Montant exceptionnel</Label>
                      <Input
                        id="exceptionalAmount"
                        type="number"
                        step="0.50"
                        min="0"
                        value={newOrder.exceptionalAmount}
                        onChange={(e) => setNewOrder({...newOrder, exceptionalAmount: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Récapitulatif */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Récapitulatif de la commande</h4>
                <div className="flex justify-between text-sm">
                  <span>Client:</span>
                  <span>
                    {clientMode === 'search' && selectedClient 
                      ? (selectedClient.companyName || `${selectedClient.firstName} ${selectedClient.lastName}`)
                      : clientMode === 'create' 
                      ? (newClient.companyName || `${newClient.firstName} ${newClient.lastName}`)
                      : 'Non sélectionné'
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service:</span>
                  <span>{getServiceLabel(newOrder.service)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Nombre de pièces:</span>
                  <span>{newOrder.pieces}</span>
                </div>
                {!newOrder.isExceptionalPrice && (
                  <div className="flex justify-between text-sm">
                    <span>Prix unitaire:</span>
                    <span>€{STANDARD_PRICES[newOrder.service]}</span>
                  </div>
                )}
                {newOrder.isExceptionalPrice && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Prix exceptionnel appliqué:</span>
                    <span>Oui</span>
                  </div>
                )}
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total:</span>
                  <span>€{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => handleDialogOpenChange(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleCreateOrder}
                  disabled={
                    (clientMode === 'search' && !selectedClient) ||
                    (clientMode === 'create' && (!newClient.firstName || !newClient.lastName))
                  }
                >
                  Créer la commande
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher par code de suivi ou nom du client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="received">Reçu</SelectItem>
            <SelectItem value="processing">En traitement</SelectItem>
            <SelectItem value="ready">Prêt</SelectItem>
            <SelectItem value="collected">Récupéré</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Reçues", count: orders.filter(o => o.status === 'received').length, color: "text-blue-600" },
          { label: "En traitement", count: orders.filter(o => o.status === 'processing').length, color: "text-yellow-600" },
          { label: "Prêtes", count: orders.filter(o => o.status === 'ready').length, color: "text-green-600" },
          { label: "Récupérées", count: orders.filter(o => o.status === 'collected').length, color: "text-gray-600" }
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Liste des commandes */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">{order.id}</h3>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                    {order.paymentStatus === 'pending' && (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        Paiement en attente
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Client:</span>
                      <div className="font-medium">{order.clientName}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Service:</span>
                      <div className="font-medium">{getServiceLabel(order.service)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Pièces:</span>
                      <div className="font-medium">{order.pieces} pièces</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Créée le:</span>
                      <div className="font-medium">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Prêt le:</span>
                      <div className="font-medium">{new Date(order.estimatedDate).toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Montant:</span>
                      <div className="font-medium flex items-center gap-2">
                        €{order.totalAmount.toFixed(2)}
                        {order.isExceptionalPrice && (
                          <Badge variant="outline" className="text-xs">
                            Prix exceptionnel
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrintReceipt(order)}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Reçu
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrintLabels(order)}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Étiquettes
                  </Button>
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="processing">Mettre en traitement</SelectItem>
                      <SelectItem value="ready">Marquer prêt</SelectItem>
                      <SelectItem value="collected">Marquer récupéré</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
