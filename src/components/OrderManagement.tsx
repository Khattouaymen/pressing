
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, Package, Clock, CheckCircle, Printer, QrCode, Euro } from "lucide-react";

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

export const OrderManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
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
    const trackingCode = generateTrackingCode();
    console.log('Creating order:', {
      ...newOrder,
      id: trackingCode,
      totalAmount: calculateTotal(),
      createdAt: new Date().toISOString(),
      status: 'received',
      paymentStatus: 'paid'
    });
    
    // Reset form
    setNewOrder({
      clientId: '',
      clientName: '',
      service: 'pressing',
      pieces: 1,
      isExceptionalPrice: false,
      exceptionalAmount: 0
    });
    setIsCreatingOrder(false);
  };

  const handlePrintReceipt = (order: Order) => {
    console.log('Printing receipt for order:', order.id);
    // Ici on intégrerait l'impression
  };

  const handlePrintLabels = (order: Order) => {
    console.log('Printing labels for order:', order.id);
    // Ici on intégrerait l'impression des étiquettes
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
        
        <Dialog open={isCreatingOrder} onOpenChange={setIsCreatingOrder}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Commande
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle commande</DialogTitle>
              <DialogDescription>
                Enregistrez une nouvelle commande pour un client
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Sélection client */}
              <div>
                <Label htmlFor="client">Client</Label>
                <Select value={newOrder.clientId} onValueChange={(value) => setNewOrder({...newOrder, clientId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLI001">Marie Dubois (CLI001)</SelectItem>
                    <SelectItem value="CLI002">Pierre Martin (CLI002)</SelectItem>
                    <SelectItem value="PRO001">Hotel Royal (PRO001)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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

              <Separator />

              {/* Récapitulatif */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Récapitulatif de la commande</h4>
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
