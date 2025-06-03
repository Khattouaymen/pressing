import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, Package, Clock, CheckCircle, Printer, QrCode, Coins, UserCheck, Minus, X } from "lucide-react";
import { useClients, usePieces, useOrders, Client, Piece, Order, OrderPiece } from '@/hooks/useApiDatabase';

export const OrderManagement = () => {
  // Hooks de base de données
  const { clients, loading: clientsLoading, addClient } = useClients();
  const { pieces, loading: piecesLoading } = usePieces();
  const { orders, loading: ordersLoading, addOrder, updateOrder } = useOrders();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);  const [clientMode, setClientMode] = useState<'search' | 'create' | 'guest'>('search');
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
  const [guestClient, setGuestClient] = useState({
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
  const [selectedServiceType, setSelectedServiceType] = useState<'pressing' | 'cleaning-pressing'>('pressing');  const [pieceQuantity, setPieceQuantity] = useState(1);
  const [isExceptionalPrice, setIsExceptionalPrice] = useState(false);
  const [exceptionalTotal, setExceptionalTotal] = useState(0);
  const [isPaidInAdvance, setIsPaidInAdvance] = useState(false);
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

    const piece = pieces.find(p => p.id === selectedPieceId);
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
  };  // Création d'un nouveau client
  const handleCreateClient = async () => {
    if (!newClient.firstName || !newClient.lastName || !newClient.phone) {
      toast.error('Veuillez remplir les champs obligatoires (nom, prénom, téléphone)');
      return;
    }

    if (newClient.email && !newClient.email.includes('@')) {
      toast.error('Veuillez saisir un email valide');
      return;
    }

    if (newClient.type === 'professional' && !newClient.companyName) {
      toast.error('Veuillez saisir le nom de l\'entreprise');
      return;
    }    try {
      const clientData = {
        id: `CLI${Date.now()}`, // Génération d'un ID simple
        ...newClient,
        createdAt: new Date().toISOString(),
        totalOrders: 0,
        totalSpent: 0,
        ...(newClient.type === 'individual' ? { companyName: undefined } : {}),
      };
      
      const createdClient = await addClient(clientData);
      setSelectedClient(createdClient);
      setClientMode('search');
      setNewClient({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
        type: 'individual',
        companyName: ''
      });
      toast.success(`Client ${clientData.firstName} ${clientData.lastName} créé avec succès`);
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
      toast.error('Erreur lors de la création du client');
    }
  };  // Création d'une nouvelle commande
  const handleCreateOrder = async () => {
    console.log('🚀 Début de la création de la commande');
    console.log('📝 Mode client:', clientMode);
    console.log('📝 Client sélectionné:', selectedClient);
    console.log('📝 Nouveau client:', newClient);
    console.log('📝 Client invité:', guestClient);
    console.log('📦 Pièces de la commande:', orderPieces);
    console.log('💰 Prix exceptionnel:', isExceptionalPrice, 'Montant:', exceptionalTotal);

    // Validation selon le mode
    if (clientMode === 'search' && !selectedClient) {
      console.log('❌ Erreur: Aucun client sélectionné');
      toast.error('Veuillez sélectionner un client');
      return;
    }

    if (clientMode === 'create' && (!newClient.firstName || !newClient.lastName || !newClient.phone)) {
      console.log('❌ Erreur: Informations client incomplètes');
      toast.error('Veuillez remplir les champs obligatoires du nouveau client');
      return;
    }

    if (clientMode === 'guest' && (!guestClient.firstName || !guestClient.lastName || !guestClient.phone)) {
      console.log('❌ Erreur: Informations client invité incomplètes');
      toast.error('Veuillez remplir les champs obligatoires du client');
      return;
    }

    if (orderPieces.length === 0) {
      console.log('❌ Erreur: Aucune pièce ajoutée');
      toast.error('Veuillez ajouter au moins une pièce à la commande');
      return;
    }

    if (isExceptionalPrice && exceptionalTotal <= 0) {
      console.log('❌ Erreur: Montant exceptionnel invalide');
      toast.error('Le montant exceptionnel doit être supérieur à 0');
      return;
    }    try {
      const totalAmount = isExceptionalPrice 
        ? exceptionalTotal 
        : orderPieces.reduce((sum, piece) => sum + piece.totalPrice, 0);

      // Déterminer les informations du client selon le mode
      let clientData;
      let clientName;
      
      if (clientMode === 'search') {
        // Client existant sélectionné
        clientData = selectedClient;
        clientName = `${selectedClient.firstName} ${selectedClient.lastName}`;
      } else if (clientMode === 'create') {
        // Créer d'abord le nouveau client
        const newClientData = {
          id: `CLI${Date.now()}`,
          ...newClient,
          createdAt: new Date().toISOString(),
          totalOrders: 0,
          totalSpent: 0,
          ...(newClient.type === 'individual' ? { companyName: undefined } : {}),
        };
        
        const createdClient = await addClient(newClientData);
        clientData = createdClient;
        clientName = `${newClient.firstName} ${newClient.lastName}`;
      } else {
        // Mode guest - utiliser les informations temporaires
        clientData = { id: `GUEST${Date.now()}`, ...guestClient };
        clientName = `${guestClient.firstName} ${guestClient.lastName}`;
      }

      const orderData: Order = {
        id: `PR${Date.now()}`, // Génération d'un ID simple
        clientId: clientData.id,
        clientName: clientName,
        pieces: orderPieces,
        totalAmount,
        status: 'received',
        paymentStatus: isPaidInAdvance ? 'paid' : 'pending',
        createdAt: new Date().toISOString(),
        estimatedDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48h plus tard
        isExceptionalPrice,
        ...(isExceptionalPrice ? { originalPrice: orderPieces.reduce((sum, piece) => sum + piece.totalPrice, 0) } : {}),
      };

      console.log('📋 Données de la commande à ajouter:', orderData);
      console.log('🔄 Appel de addOrder...');
      
      const result = await addOrder(orderData);
      console.log('✅ Commande créée avec succès:', result);        // Reset du formulaire
      setIsCreatingOrder(false);
      setSelectedClient(null);
      setOrderPieces([]);
      setClientSearchTerm('');
      setIsExceptionalPrice(false);
      setExceptionalTotal(0);
      setIsPaidInAdvance(false);
      setClientMode('search');
      
      // Reset des données client selon le mode
      setNewClient({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
        type: 'individual',
        companyName: ''
      });
      setGuestClient({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
        type: 'individual',
        companyName: ''
      });
      
      toast.success(`Commande ${orderData.id} créée avec succès pour ${clientName}`);
    } catch (error) {
      console.error('❌ Erreur détaillée lors de la création de la commande:', error);
      console.error('📊 Stack trace:', error.stack);
      toast.error(`Erreur lors de la création de la commande: ${error.message || error}`);
    }
  };  // Mise à jour du statut d'une commande
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const orderToUpdate = orders.find(order => order.id === orderId);
      if (!orderToUpdate) {
        throw new Error('Commande non trouvée');
      }

      // Logique automatique de paiement lors de la récupération
      let updatedOrder = { ...orderToUpdate, status: newStatus };
      
      if (newStatus === 'delivered' && orderToUpdate.paymentStatus === 'pending') {
        updatedOrder.paymentStatus = 'paid';
        toast.success(`Commande ${orderId} récupérée et marquée comme payée automatiquement`);
      } else {
        toast.success(`Statut de la commande ${orderId} mis à jour`);
      }

      await updateOrder(updatedOrder);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  // Mise à jour du statut de paiement
  const handleUpdatePaymentStatus = async (orderId: string, newPaymentStatus: Order['paymentStatus']) => {
    try {
      const orderToUpdate = orders.find(order => order.id === orderId);
      if (!orderToUpdate) {
        throw new Error('Commande non trouvée');
      }
      await updateOrder({ ...orderToUpdate, paymentStatus: newPaymentStatus });
      toast.success(`Statut de paiement mis à jour`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du paiement:', error);
      toast.error('Erreur lors de la mise à jour du paiement');
    }
  };  // Gestion de l'ouverture/fermeture du dialog
  const handleDialogOpenChange = (open: boolean) => {
    setIsCreatingOrder(open);
    if (!open) {
      // Reset quand on ferme le dialog
      setSelectedClient(null);
      setOrderPieces([]);
      setClientSearchTerm('');
      setIsExceptionalPrice(false);
      setExceptionalTotal(0);
      setIsPaidInAdvance(false);
      setClientMode('search');
      setNewClient({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
        type: 'individual',
        companyName: ''
      });
      setGuestClient({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
        type: 'individual',
        companyName: ''
      });
    }
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
      case "delivered": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
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
  };const getServiceLabel = (service: string) => {
    switch (service) {
      case "pressing": return "Repassage";
      case "cleaning-pressing": return "Nettoyage + Repassage";
      default: return service;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "received": return Package;
      case "processing": return Clock;
      case "ready": return CheckCircle;
      case "delivered": return CheckCircle;
      default: return Package;
    }
  };
  const handlePrintReceipt = (order: Order) => {
    console.log('Impression du reçu pour la commande:', order.id);
    
    // Créer le contenu HTML du reçu
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reçu - Commande ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .company { font-size: 24px; font-weight: bold; color: #333; }
          .subtitle { color: #666; margin-top: 5px; }
          .order-info { display: flex; justify-content: space-between; margin: 20px 0; }
          .section { margin: 20px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .items-table th { background-color: #f5f5f5; font-weight: bold; }
          .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
          .status-received { background-color: #dbeafe; color: #1e40af; }
          .status-processing { background-color: #fef3c7; color: #92400e; }
          .status-ready { background-color: #d1fae5; color: #065f46; }
          .status-delivered { background-color: #f3f4f6; color: #374151; }
          .payment-paid { background-color: #d1fae5; color: #065f46; }
          .payment-pending { background-color: #fef3c7; color: #92400e; }
          .payment-overdue { background-color: #fee2e2; color: #b91c1c; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company">PressingPro</div>
          <div class="subtitle">Pressing & Nettoyage à sec</div>
          <div class="subtitle">Téléphone: 01 23 45 67 89 | Email: contact@pressingpro.fr</div>
        </div>
        
        <div class="order-info">
          <div>
            <strong>Commande N°:</strong> ${order.id}<br>
            <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('fr-FR')}<br>
            <strong>Prêt le:</strong> ${new Date(order.estimatedDate).toLocaleDateString('fr-FR')}
          </div>
          <div>
            <strong>Client:</strong> ${order.clientName}<br>
            <strong>Statut:</strong> <span class="status-badge status-${order.status}">${getStatusLabel(order.status)}</span><br>
            <strong>Paiement:</strong> <span class="status-badge payment-${order.paymentStatus}">${order.paymentStatus === 'paid' ? 'Payé' : order.paymentStatus === 'pending' ? 'En attente' : 'En retard'}</span>
          </div>
        </div>
        
        <div class="section">
          <h3>Détail des pièces</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Service</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.pieces.map(piece => `                <tr>
                  <td>${piece.pieceName}</td>
                  <td>${getServiceLabel(piece.serviceType)}</td>
                  <td>${piece.quantity}</td>
                  <td>${piece.unitPrice.toFixed(2)} DH</td>
                  <td>${piece.totalPrice.toFixed(2)} DH</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        ${order.isExceptionalPrice ? `
          <div class="section">
            <p><strong>Note:</strong> Prix exceptionnel appliqué à cette commande.</p>
          </div>
        ` : ''}
          <div class="total">
          <strong>TOTAL: ${order.totalAmount.toFixed(2)} DH</strong>
        </div>
        
        <div class="footer">
          <p>Merci de votre confiance !</p>
          <p>Ce reçu a été généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        </div>
      </body>
      </html>
    `;
    
    // Ouvrir une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Attendre que le contenu soit chargé puis lancer l'impression
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      toast.error('Impossible d\'ouvrir la fenêtre d\'impression. Vérifiez les pop-ups.');
    }
  };
  const handlePrintLabels = (order: Order) => {
    console.log('Impression des étiquettes pour la commande:', order.id);
    
    // Créer le contenu HTML des étiquettes
    const labelsContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Étiquettes - Commande ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .label { 
            width: 8cm; 
            height: 5cm; 
            border: 2px solid #333; 
            margin: 10px; 
            padding: 10px; 
            display: inline-block; 
            vertical-align: top;
            page-break-inside: avoid;
            box-sizing: border-box;
          }
          .label-header { 
            text-align: center; 
            font-weight: bold; 
            font-size: 14px; 
            border-bottom: 1px solid #333; 
            padding-bottom: 5px; 
            margin-bottom: 8px;
          }
          .order-id { font-size: 18px; font-weight: bold; text-align: center; margin: 5px 0; }
          .client-name { font-size: 14px; font-weight: bold; margin: 5px 0; }
          .item-info { font-size: 12px; margin: 3px 0; }
          .dates { font-size: 11px; margin-top: 8px; border-top: 1px solid #ccc; padding-top: 5px; }
          .qr-placeholder { 
            width: 40px; 
            height: 40px; 
            border: 1px solid #333; 
            float: right; 
            margin-top: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
          }
          @media print {
            body { margin: 0; }
            .label { margin: 5px; }
          }
        </style>
      </head>
      <body>
        ${order.pieces.map((piece, index) => {
          // Générer une étiquette pour chaque pièce (en tenant compte de la quantité)
          return Array.from({ length: piece.quantity }, (_, qtyIndex) => `
            <div class="label">
              <div class="label-header">PRESSINGPRO</div>
              <div class="order-id">${order.id}</div>
              <div class="client-name">${order.clientName}</div>
              <div class="qr-placeholder">QR</div>
              <div class="item-info">
                <strong>${piece.pieceName}</strong><br>
                ${getServiceLabel(piece.serviceType)}<br>
                Pièce ${qtyIndex + 1}/${piece.quantity}
              </div>
              <div class="dates">
                Reçu: ${new Date(order.createdAt).toLocaleDateString('fr-FR')}<br>
                Prêt: ${new Date(order.estimatedDate).toLocaleDateString('fr-FR')}<br>
                Total: ${order.totalAmount.toFixed(2)} DH
              </div>
            </div>
          `).join('');
        }).join('')}
      </body>
      </html>
    `;
    
    // Ouvrir une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(labelsContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Attendre que le contenu soit chargé puis lancer l'impression
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      toast.error('Impossible d\'ouvrir la fenêtre d\'impression. Vérifiez les pop-ups.');
    }
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

  // Affichage conditionnel pendant le chargement
  if (clientsLoading || piecesLoading || ordersLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

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
                <Label className="text-base font-medium">Client</Label>                <Tabs value={clientMode} onValueChange={(value: any) => setClientMode(value)} className="w-full mt-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="search" className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Rechercher Client
                    </TabsTrigger>
                    <TabsTrigger value="create" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Nouveau Client
                    </TabsTrigger>
                    <TabsTrigger value="guest" className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Client Invité
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
                      <Button 
                      onClick={handleCreateClient}
                      disabled={!newClient.firstName || !newClient.lastName || !newClient.phone}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Créer ce client
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="guest" className="space-y-4 mt-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800 mb-2">
                        <UserCheck className="w-4 h-4" />
                        <span className="font-medium">Client Invité</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Les informations du client invité ne seront pas sauvegardées dans la base de données. 
                        Elles ne serviront que pour cette commande.
                      </p>
                    </div>
                    
                    <Tabs value={guestClient.type} onValueChange={(value: any) => setGuestClient({...guestClient, type: value})}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="individual">Particulier</TabsTrigger>
                        <TabsTrigger value="professional">Professionnel</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="individual" className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="guestFirstName">Prénom</Label>
                            <Input
                              id="guestFirstName"
                              value={guestClient.firstName}
                              onChange={(e) => setGuestClient({...guestClient, firstName: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="guestLastName">Nom</Label>
                            <Input
                              id="guestLastName"
                              value={guestClient.lastName}
                              onChange={(e) => setGuestClient({...guestClient, lastName: e.target.value})}
                            />
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="professional" className="space-y-3">
                        <div>
                          <Label htmlFor="guestCompanyName">Raison sociale</Label>
                          <Input
                            id="guestCompanyName"
                            value={guestClient.companyName}
                            onChange={(e) => setGuestClient({...guestClient, companyName: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="guestFirstNamePro">Prénom contact</Label>
                            <Input
                              id="guestFirstNamePro"
                              value={guestClient.firstName}
                              onChange={(e) => setGuestClient({...guestClient, firstName: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="guestLastNamePro">Nom contact</Label>
                            <Input
                              id="guestLastNamePro"
                              value={guestClient.lastName}
                              onChange={(e) => setGuestClient({...guestClient, lastName: e.target.value})}
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="guestPhone">Téléphone</Label>
                        <Input
                          id="guestPhone"
                          value={guestClient.phone}
                          onChange={(e) => setGuestClient({...guestClient, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="guestEmail">Email</Label>
                        <Input
                          id="guestEmail"
                          type="email"
                          value={guestClient.email}
                          onChange={(e) => setGuestClient({...guestClient, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="guestAddress">Adresse</Label>
                      <Input
                        id="guestAddress"
                        value={guestClient.address}
                        onChange={(e) => setGuestClient({...guestClient, address: e.target.value})}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <Separator />

              {/* Sélection des pièces avec images */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Sélection des pièces</Label>
                
                <div className="space-y-4">
                  {/* Grille de sélection visuelle des pièces */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto border rounded-lg p-3">
                    {pieces.map((piece) => (
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
                          <div className="font-medium text-sm mb-1">{piece.name}</div>                          <div className="text-xs text-gray-600">
                            Repassage: {piece.pressingPrice.toFixed(2)} DH
                          </div>
                          <div className="text-xs text-gray-600">
                            Nettoyage: {piece.cleaningPressingPrice.toFixed(2)} DH
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
                      {pieces.find(p => p.id === selectedPieceId)?.imageUrl && (
                        <img                          src={pieces.find(p => p.id === selectedPieceId)?.imageUrl}
                          alt={pieces.find(p => p.id === selectedPieceId)?.name}
                          className="w-16 h-16 object-cover rounded-md border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">
                          {pieces.find(p => p.id === selectedPieceId)?.name}
                        </h4>                        <div className="text-sm text-gray-600">
                          <div>Repassage: {pieces.find(p => p.id === selectedPieceId)?.pressingPrice.toFixed(2)} DH</div>
                          <div>Nettoyage + Repassage: {pieces.find(p => p.id === selectedPieceId)?.cleaningPressingPrice.toFixed(2)} DH</div>
                        </div>                        <div className="text-sm font-medium text-blue-600 mt-1">
                          Service sélectionné: {selectedServiceType === 'pressing'
                            ? pieces.find(p => p.id === selectedPieceId)?.pressingPrice.toFixed(2)
                            : pieces.find(p => p.id === selectedPieceId)?.cleaningPressingPrice.toFixed(2)} DH
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
                          <div className="flex items-center gap-3 flex-1">                            {pieces.find(p => p.id === piece.pieceId)?.imageUrl && (
                              <img
                                src={pieces.find(p => p.id === piece.pieceId)?.imageUrl}
                                alt={piece.pieceName}
                                className="w-12 h-12 object-cover rounded-md border"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <div className="font-medium">{piece.pieceName}</div>                              <div className="text-sm text-gray-600">
                                {getServiceLabel(piece.serviceType)} - {piece.unitPrice.toFixed(2)} DH x {piece.quantity}
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
                            </div>                            <div className="font-medium min-w-[4rem] text-right">
                              {piece.totalPrice.toFixed(2)} DH
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
                )}                {/* Prix exceptionnel */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="exceptionalPrice"
                      checked={isExceptionalPrice}
                      onCheckedChange={(checked) => setIsExceptionalPrice(!!checked)}
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

                  {/* Option de paiement en avance */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="paidInAdvance"
                      checked={isPaidInAdvance}
                      onCheckedChange={(checked) => setIsPaidInAdvance(!!checked)}
                    />
                    <Label htmlFor="paidInAdvance">Payé en avance</Label>
                  </div>
                  {isPaidInAdvance && (
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                      ✅ Cette commande sera marquée comme payée dès sa création
                    </div>
                  )}
                  {!isPaidInAdvance && (
                    <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                      💡 Le paiement sera automatiquement marqué comme effectué lors de la récupération
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Récapitulatif */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Récapitulatif de la commande</h4>                <div className="flex justify-between text-sm">
                  <span>Client:</span>
                  <span>
                    {clientMode === 'search' && selectedClient 
                      ? (selectedClient.companyName || `${selectedClient.firstName} ${selectedClient.lastName}`)
                      : clientMode === 'create' 
                      ? (newClient.companyName || `${newClient.firstName} ${newClient.lastName}`)
                      : clientMode === 'guest'
                      ? `${guestClient.companyName || `${guestClient.firstName} ${guestClient.lastName}`} (Invité)`
                      : 'Non sélectionné'
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Nombre de pièces:</span>
                  <span>{orderPieces.reduce((total, piece) => total + piece.quantity, 0)}</span>
                </div>                {isExceptionalPrice && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Prix exceptionnel appliqué:</span>
                    <span>Oui</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Statut de paiement:</span>
                  <span className={isPaidInAdvance ? "text-green-600 font-medium" : "text-orange-600"}>
                    {isPaidInAdvance ? "Payé en avance" : "À payer à la récupération"}
                  </span>
                </div>                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total:</span>
                  <span>{calculateOrderTotal().toFixed(2)} DH</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => handleDialogOpenChange(false)}>
                  Annuler
                </Button>                <Button 
                  onClick={handleCreateOrder}
                  disabled={
                    (clientMode === 'search' && !selectedClient) ||
                    (clientMode === 'create' && (!newClient.firstName || !newClient.lastName)) ||
                    (clientMode === 'guest' && (!guestClient.firstName || !guestClient.lastName || !guestClient.phone)) ||
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
            <SelectItem value="delivered">Récupéré</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Reçues", count: orders.filter(o => o.status === 'received').length, color: "text-blue-600" },
          { label: "En traitement", count: orders.filter(o => o.status === 'processing').length, color: "text-yellow-600" },
          { label: "Prêtes", count: orders.filter(o => o.status === 'ready').length, color: "text-green-600" },
          { label: "Récupérées", count: orders.filter(o => o.status === 'delivered').length, color: "text-gray-600" }
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
                    </Badge>                    {order.paymentStatus === 'pending' && (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        Paiement en attente
                      </Badge>
                    )}
                    {order.paymentStatus === 'paid' && (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Payé
                      </Badge>
                    )}
                    {order.paymentStatus === 'overdue' && (
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        En retard
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
                    <div>                      <span className="text-gray-600">Montant:</span>
                      <div className="font-medium flex items-center gap-2">
                        {order.totalAmount.toFixed(2)} DH
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
                  </Button>                  <Select onValueChange={(value) => handleUpdateOrderStatus(order.id, value as Order['status'])}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="processing">Mettre en traitement</SelectItem>
                      <SelectItem value="ready">Marquer prêt</SelectItem>
                      <SelectItem value="delivered">Marquer récupéré</SelectItem>
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
