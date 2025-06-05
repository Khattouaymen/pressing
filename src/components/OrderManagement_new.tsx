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
import { Plus, Search, Package, Clock, CheckCircle, Printer, QrCode, Euro, UserCheck, Minus, X } from "lucide-react";

interface Piece {
  id: string;
  name: string;
  category: 'vetement' | 'linge' | 'accessoire';
  pressingPrice: number;
  cleaningPressingPrice: number;
  imageUrl?: string;
  isProfessional?: boolean;
}

interface OrderPiece {
  pieceId: string;
  pieceName: string;
  serviceType: 'pressing' | 'cleaning-pressing';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  clientName: string;
  clientId: string;
  pieces: OrderPiece[];
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

export const OrderManagement = () => {  // Available pieces with their prices
  const availablePieces: Piece[] = [
    { id: 'chemise', name: 'Chemise', category: 'vetement', pressingPrice: 3.50, cleaningPressingPrice: 8.00, imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop&crop=center", isProfessional: false },
    { id: 'pantalon', name: 'Pantalon', category: 'vetement', pressingPrice: 4.00, cleaningPressingPrice: 9.00, imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=300&fit=crop&crop=center", isProfessional: false },
    { id: 'veste', name: 'Veste', category: 'vetement', pressingPrice: 6.00, cleaningPressingPrice: 12.00, imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop&crop=center", isProfessional: false },
    { id: 'robe', name: 'Robe', category: 'vetement', pressingPrice: 5.00, cleaningPressingPrice: 10.00, imageUrl: "https://images.unsplash.com/photo-1566479179817-0b9e588a2c88?w=300&h=300&fit=crop&crop=center", isProfessional: false },
    { id: 'jupe', name: 'Jupe', category: 'vetement', pressingPrice: 3.50, cleaningPressingPrice: 8.00, imageUrl: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=300&h=300&fit=crop&crop=center", isProfessional: false },
    { id: 'pull', name: 'Pull/Tricot', category: 'vetement', pressingPrice: 4.50, cleaningPressingPrice: 9.50, imageUrl: "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=300&h=300&fit=crop&crop=center", isProfessional: false },
    { id: 'costume', name: 'Costume complet', category: 'vetement', pressingPrice: 12.00, cleaningPressingPrice: 20.00, imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center", isProfessional: true },
    { id: 'manteau', name: 'Manteau', category: 'vetement', pressingPrice: 8.00, cleaningPressingPrice: 15.00, imageUrl: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop&crop=center", isProfessional: false },
    { id: 'drap', name: 'Drap', category: 'linge', pressingPrice: 5.00, cleaningPressingPrice: 8.00, imageUrl: "https://images.unsplash.com/photo-1586985564150-0bf609135187?w=300&h=300&fit=crop&crop=center", isProfessional: false },
    { id: 'housse', name: 'Housse de couette', category: 'linge', pressingPrice: 6.00, cleaningPressingPrice: 10.00, imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&h=300&fit=crop&crop=center", isProfessional: false },
    { id: 'nappe', name: 'Nappe', category: 'linge', pressingPrice: 4.00, cleaningPressingPrice: 7.00, imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=300&fit=crop&crop=center", isProfessional: true },
    { id: 'rideau', name: 'Rideau', category: 'linge', pressingPrice: 8.00, cleaningPressingPrice: 12.00, imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&crop=center", isProfessional: false },    { id: 'cravate', name: 'Cravate', category: 'accessoire', pressingPrice: 2.50, cleaningPressingPrice: 5.00, imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center", isProfessional: false },
    { id: 'foulard', name: 'Foulard', category: 'accessoire', pressingPrice: 3.00, cleaningPressingPrice: 6.00, imageUrl: "https://images.unsplash.com/photo-1609709295948-17d77cb2a69e?w=300&h=300&fit=crop&crop=center", isProfessional: false }
  ];

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
  
  const [orderPieces, setOrderPieces] = useState<OrderPiece[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<string>('');
  const [selectedServiceType, setSelectedServiceType] = useState<'pressing' | 'cleaning-pressing'>('pressing');
  const [pieceQuantity, setPieceQuantity] = useState(1);
  const [isExceptionalPrice, setIsExceptionalPrice] = useState(false);
  const [exceptionalTotal, setExceptionalTotal] = useState(0);

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
      pieces: [
        { pieceId: 'chemise', pieceName: 'Chemise', serviceType: 'cleaning-pressing', quantity: 3, unitPrice: 8.00, totalPrice: 24.00 },
        { pieceId: 'pantalon', pieceName: 'Pantalon', serviceType: 'cleaning-pressing', quantity: 2, unitPrice: 9.00, totalPrice: 18.00 }
      ],
      totalAmount: 42.00,
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
        { pieceId: 'chemise', pieceName: 'Chemise', serviceType: 'pressing', quantity: 5, unitPrice: 3.50, totalPrice: 17.50 },
        { pieceId: 'veste', pieceName: 'Veste', serviceType: 'pressing', quantity: 1, unitPrice: 6.00, totalPrice: 6.00 }
      ],
      totalAmount: 23.50,
      status: "ready",
      createdAt: "2024-06-01T14:15:00",
      estimatedDate: "2024-06-03T17:00:00",
      paymentStatus: "paid",
      isExceptionalPrice: false
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

  const addPieceToOrder = () => {
    if (!selectedPieceId) return;

    const piece = availablePieces.find(p => p.id === selectedPieceId);
    if (!piece) return;

    const unitPrice = selectedServiceType === 'pressing' ? piece.pressingPrice : piece.cleaningPressingPrice;
    const totalPrice = unitPrice * pieceQuantity;

    const newOrderPiece: OrderPiece = {
      pieceId: piece.id,
      pieceName: piece.name,
      serviceType: selectedServiceType,
      quantity: pieceQuantity,
      unitPrice,
      totalPrice
    };

    setOrderPieces([...orderPieces, newOrderPiece]);
    setSelectedPieceId('');
    setPieceQuantity(1);
  };

  const removePieceFromOrder = (index: number) => {
    const newOrderPieces = orderPieces.filter((_, i) => i !== index);
    setOrderPieces(newOrderPieces);
  };

  const updatePieceQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const newOrderPieces = [...orderPieces];
    newOrderPieces[index].quantity = newQuantity;
    newOrderPieces[index].totalPrice = newOrderPieces[index].unitPrice * newQuantity;
    setOrderPieces(newOrderPieces);
  };

  const calculateOrderTotal = () => {
    if (isExceptionalPrice) {
      return exceptionalTotal;
    }
    return orderPieces.reduce((total, piece) => total + piece.totalPrice, 0);
  };

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

  const generateTrackingCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PR2024-${timestamp}${random}`;
  };

  const handleCreateOrder = () => {
    if (orderPieces.length === 0) return;

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
      ...clientInfo,
      id: trackingCode,
      pieces: orderPieces,
      totalAmount: calculateOrderTotal(),
      createdAt: new Date().toISOString(),
      status: 'received',
      paymentStatus: 'paid',
      isExceptionalPrice
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
    setOrderPieces([]);
    setSelectedPieceId('');
    setSelectedServiceType('pressing');
    setPieceQuantity(1);
    setIsExceptionalPrice(false);
    setExceptionalTotal(0);
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
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle commande</DialogTitle>
              <DialogDescription>
                Recherchez un client existant ou créez un nouveau client, puis sélectionnez les pièces à traiter
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

              <Separator />              {/* Sélection des pièces avec images */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Sélection des pièces (clients individuels)</Label>
                
                <div className="space-y-4">
                  {/* Grille de sélection visuelle des pièces */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto border rounded-lg p-3">
                    {availablePieces.filter(piece => !piece.isProfessional).map((piece) => (
                      <div
                        key={piece.id}
                        className={`cursor-pointer border rounded-lg p-3 transition-all hover:shadow-md ${
                          selectedPieceId === piece.id 
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedPieceId(piece.id)}
                      >
                        {piece.imageUrl && (
                          <img 
                            src={piece.imageUrl} 
                            alt={piece.name}
                            className="w-full h-16 object-cover rounded-md mb-2"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="text-center">
                          <div className="font-medium text-sm mb-1">{piece.name}</div>
                          <div className="text-xs text-gray-600">
                            Repassage: €{piece.pressingPrice}
                          </div>
                          <div className="text-xs text-gray-600">
                            Nettoyage: €{piece.cleaningPressingPrice}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="serviceType">Service</Label>
                      <Select value={selectedServiceType} onValueChange={(value: any) => setSelectedServiceType(value)}>
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
                      <Label htmlFor="quantity">Quantité</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={pieceQuantity}
                        onChange={(e) => setPieceQuantity(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <Button 
                        onClick={addPieceToOrder}
                        disabled={!selectedPieceId}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Aperçu de la pièce sélectionnée avec image */}
                {selectedPieceId && (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      {availablePieces.find(p => p.id === selectedPieceId)?.imageUrl && (
                        <img 
                          src={availablePieces.find(p => p.id === selectedPieceId)?.imageUrl} 
                          alt={availablePieces.find(p => p.id === selectedPieceId)?.name}
                          className="w-16 h-16 object-cover rounded-md border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">
                          {availablePieces.find(p => p.id === selectedPieceId)?.name}
                        </h4>
                        <div className="text-sm text-gray-600">
                          <div>Repassage: €{availablePieces.find(p => p.id === selectedPieceId)?.pressingPrice}</div>
                          <div>Nettoyage + Repassage: €{availablePieces.find(p => p.id === selectedPieceId)?.cleaningPressingPrice}</div>
                        </div>
                        <div className="text-sm font-medium text-blue-600 mt-1">
                          Service sélectionné: €{selectedServiceType === 'pressing' 
                            ? availablePieces.find(p => p.id === selectedPieceId)?.pressingPrice 
                            : availablePieces.find(p => p.id === selectedPieceId)?.cleaningPressingPrice} 
                          par pièce
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Liste des pièces ajoutées avec images */}
                {orderPieces.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Pièces sélectionnées:</h4>
                    <div className="space-y-2">
                      {orderPieces.map((piece, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded bg-gray-50">
                          <div className="flex items-center gap-3 flex-1">
                            {availablePieces.find(p => p.id === piece.pieceId)?.imageUrl && (
                              <img 
                                src={availablePieces.find(p => p.id === piece.pieceId)?.imageUrl} 
                                alt={piece.pieceName}
                                className="w-12 h-12 object-cover rounded-md border"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <div className="font-medium">{piece.pieceName}</div>
                              <div className="text-sm text-gray-600">
                                {getServiceLabel(piece.serviceType)} - €{piece.unitPrice} x {piece.quantity}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updatePieceQuantity(index, piece.quantity - 1)}
                                disabled={piece.quantity <= 1}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="mx-2 min-w-[2rem] text-center">{piece.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updatePieceQuantity(index, piece.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="font-medium min-w-[4rem] text-right">
                              €{piece.totalPrice.toFixed(2)}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removePieceFromOrder(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prix exceptionnel */}
                <div className="space-y-3">                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="exceptionalPrice"
                      checked={isExceptionalPrice}
                      onChange={(e) => setIsExceptionalPrice(e.target.checked)}
                      className="rounded border-gray-300"
                      aria-label="Appliquer un prix exceptionnel"
                    />
                    <Label htmlFor="exceptionalPrice">Appliquer un prix exceptionnel</Label>
                  </div>
                  
                  {isExceptionalPrice && (
                    <div>
                      <Label htmlFor="exceptionalAmount">Montant total exceptionnel</Label>
                      <Input
                        id="exceptionalAmount"
                        type="number"
                        step="0.50"
                        min="0"
                        value={exceptionalTotal}
                        onChange={(e) => setExceptionalTotal(parseFloat(e.target.value) || 0)}
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
                  <span>Nombre de pièces:</span>
                  <span>{orderPieces.reduce((total, piece) => total + piece.quantity, 0)}</span>
                </div>
                {isExceptionalPrice && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Prix exceptionnel appliqué:</span>
                    <span>Oui</span>
                  </div>
                )}
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total:</span>
                  <span>€{calculateOrderTotal().toFixed(2)}</span>
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
                    (clientMode === 'create' && (!newClient.firstName || !newClient.lastName)) ||
                    orderPieces.length === 0
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
                      <span className="text-gray-600">Pièces:</span>
                      <div className="font-medium">
                        {order.pieces.reduce((total, piece) => total + piece.quantity, 0)} pièces
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Détail:</span>
                      <div className="text-xs">
                        {order.pieces.map((piece, index) => (
                          <div key={index}>
                            {piece.quantity}x {piece.pieceName} ({getServiceLabel(piece.serviceType)})
                          </div>
                        ))}
                      </div>
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
