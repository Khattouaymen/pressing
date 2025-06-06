import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, Package, User, Building2 } from "lucide-react";
import { useOrders, useProfessionalOrders } from '@/hooks/useApiDatabase';

interface ClientOrderHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  client: {
    id: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    type: 'individual' | 'professional';
    phone: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
  };
}

export const ClientOrderHistory: React.FC<ClientOrderHistoryProps> = ({
  isOpen,
  onClose,
  client
}) => {
  const { orders: individualOrders, loading: individualLoading } = useOrders();
  const { orders: professionalOrders, loading: professionalLoading } = useProfessionalOrders();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filtrer les commandes par client
  const clientOrders = React.useMemo(() => {
    let allOrders = [];
    
    if (client.type === 'individual') {
      // Pour les clients individuels, filtrer par clientId
      allOrders = individualOrders.filter(order => order.clientId === client.id);
    } else {
      // Pour les clients professionnels, filtrer par clientId
      allOrders = professionalOrders.filter(order => order.clientId === client.id);
    }
    
    // Appliquer les filtres de recherche et de statut
    return allOrders.filter(order => {
      const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [individualOrders, professionalOrders, client.id, client.type, searchTerm, statusFilter]);

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

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid": return "text-green-600 border-green-200";
      case "pending": return "text-orange-600 border-orange-200";
      case "overdue": return "text-red-600 border-red-200";
      default: return "text-gray-600 border-gray-200";
    }
  };

  const getPaymentStatusLabel = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid": return "Payé";
      case "pending": return "En attente";
      case "overdue": return "En retard";
      default: return paymentStatus;
    }
  };

  const loading = individualLoading || professionalLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {client.type === 'professional' ? (
              <Building2 className="w-5 h-5" />
            ) : (
              <User className="w-5 h-5" />
            )}
            Historique des commandes - {client.companyName || `${client.firstName} ${client.lastName}`}
          </DialogTitle>
          <DialogDescription>
            Consultez toutes les commandes de ce client
          </DialogDescription>
        </DialogHeader>

        {/* Informations du client */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Type:</span>
              <div className="font-medium flex items-center gap-2">
                <Badge variant={client.type === 'professional' ? 'default' : 'secondary'}>
                  {client.type === 'professional' ? 'Professionnel' : 'Particulier'}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-gray-600">Téléphone:</span>
              <div className="font-medium">{client.phone}</div>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <div className="font-medium">{client.email}</div>
            </div>
          </div>
          <Separator className="my-3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total commandes:</span>
              <span className="font-bold text-blue-600">{client.totalOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Montant total dépensé:</span>
              <span className="font-bold text-green-600">{client.totalSpent.toFixed(2)} DH</span>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher par code de commande..."
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

        {/* Liste des commandes */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p>Chargement de l'historique...</p>
            </div>
          ) : clientOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune commande trouvée pour ce client</p>
              {(searchTerm || statusFilter !== "all") && (
                <p className="text-sm mt-2">Essayez de modifier vos filtres de recherche</p>
              )}
            </div>
          ) : (
            clientOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-bold text-lg">{order.id}</h3>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                        <Badge variant="outline" className={getPaymentStatusColor(order.paymentStatus)}>
                          {getPaymentStatusLabel(order.paymentStatus)}
                        </Badge>
                        {order.isExceptionalPrice && (
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            Prix exceptionnel
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Créée le:</span>
                          <div className="font-medium flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Date prévue:</span>
                          <div className="font-medium">
                            {new Date(order.estimatedDate || order.deliveryDate).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Pièces:</span>
                          <div className="font-medium">
                            {client.type === 'professional' ? 
                              `${order.pieces} pièces` : 
                              `${order.pieces.reduce((total, piece) => total + piece.quantity, 0)} pièces`
                            }
                          </div>
                        </div>
                      </div>

                      {/* Détail des pièces pour les commandes individuelles */}
                      {client.type === 'individual' && order.pieces && order.pieces.length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600 font-medium">Détail des pièces:</span>
                          <div className="mt-2 text-xs space-y-1">
                            {order.pieces.map((piece, index) => (
                              <div key={index} className="flex justify-between">
                                <span>{piece.quantity}x {piece.pieceName}</span>
                                <span className="text-gray-600">
                                  ({piece.serviceType === 'pressing' ? 'Repassage' : 'Nettoyage + Repassage'})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                      <div className="text-right">
                      <div className={`text-2xl font-bold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                        {order.totalAmount.toFixed(2)} DH
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Résumé en bas */}
        {!loading && clientOrders.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{clientOrders.length} commande(s) affichée(s)</span>              <span>
                Total affiché: <strong className="text-green-600">
                  {clientOrders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)} DH
                </strong>
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
