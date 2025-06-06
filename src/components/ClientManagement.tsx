import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Users, Building2, Phone, Mail, MapPin, Calendar, UserCheck } from "lucide-react";
import { useClients, useProfessionalClients, Client } from '@/hooks/useApiDatabase';
import { ClientOrderHistory } from './ClientOrderHistory';

export const ClientManagement = () => {
  // Hooks de base de données
  const { clients, loading, addClient } = useClients();
  const { clients: professionalClients, loading: loadingProfessionalClients } = useProfessionalClients();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [clientFormMode, setClientFormMode] = useState<'search' | 'create'>('search');
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [selectedExistingClient, setSelectedExistingClient] = useState<Client | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<any>(null);
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    type: 'individual' as 'individual' | 'professional',
    companyName: '',
    siret: ''
  });
  // Affichage conditionnel pendant le chargement
  if (loading || loadingProfessionalClients) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p>Chargement des clients...</p>
        </div>
      </div>
    );
  }
  // Adapter les clients professionnels pour avoir la même structure que les clients individuels
  const adaptedProfessionalClients = professionalClients.map(profClient => ({
    id: profClient.id,
    firstName: profClient.contactName.split(' ')[0] || '',
    lastName: profClient.contactName.split(' ').slice(1).join(' ') || '',
    phone: profClient.phone,
    email: profClient.email,
    address: profClient.billingAddress,
    type: 'professional' as const,
    companyName: profClient.companyName,
    createdAt: profClient.createdAt,
    totalOrders: profClient.totalOrders,
    totalSpent: profClient.totalSpent,
    siret: profClient.siret
  }));

  const allClients = [...clients, ...adaptedProfessionalClients];

  const filteredClients = allClients.filter(client =>
    `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    (client.companyName && client.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const searchResults = clients.filter(client =>
    clientSearchTerm && (
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.phone.includes(clientSearchTerm) ||
      (client.companyName && client.companyName.toLowerCase().includes(clientSearchTerm.toLowerCase()))
    )
  );

  const individualClients = filteredClients.filter(c => c.type === 'individual');
  const professionalClientsFiltered = filteredClients.filter(c => c.type === 'professional');
  const handleAddClient = async () => {
    try {
      if (clientFormMode === 'create') {
        // Validation des champs requis
        if (!newClient.firstName || !newClient.lastName || !newClient.phone) {
          toast.error('Veuillez remplir tous les champs obligatoires (nom, prénom, téléphone)');
          return;
        }

        if (newClient.email && !newClient.email.includes('@')) {
          toast.error('Veuillez saisir un email valide');
          return;
        }

        if (newClient.type === 'professional' && !newClient.companyName) {
          toast.error('Veuillez saisir le nom de l\'entreprise');
          return;
        }        const clientData = {
          id: `CLI${Date.now()}`,
          ...newClient,
          totalOrders: 0,
          totalSpent: 0,
          createdAt: new Date().toISOString(),
          ...(newClient.type === 'individual' ? { companyName: undefined, siret: undefined } : {}),
        };
        
        await addClient(clientData);
        toast.success(`Client ${clientData.firstName} ${clientData.lastName} créé avec succès`);
      }
      setIsAddingClient(false);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du client:', error);
      toast.error('Erreur lors de l\'ajout du client');
    }
  };

  const resetForm = () => {
    setClientFormMode('search');
    setClientSearchTerm("");
    setSelectedExistingClient(null);
    setNewClient({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      type: 'individual',
      companyName: '',
      siret: ''
    });
  };
  const handleDialogOpenChange = (open: boolean) => {
    setIsAddingClient(open);
    if (!open) {
      resetForm();
    }
  };

  const handleViewHistory = (client: Client) => {
    setSelectedClientForHistory(client);
    setIsHistoryModalOpen(true);
  };

  const ClientCard = ({ client }: { client: Client }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {client.firstName} {client.lastName}
            </CardTitle>
            {client.companyName && (
              <CardDescription className="font-medium text-blue-600">
                {client.companyName}
              </CardDescription>
            )}
          </div>
          <Badge variant={client.type === 'professional' ? 'default' : 'secondary'}>
            {client.type === 'professional' ? 'Pro' : 'Particulier'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="w-4 h-4 mr-2" />
          {client.phone}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          {client.email}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          {client.address}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          Client depuis le {new Date(client.createdAt).toLocaleDateString('fr-FR')}
        </div>
        
        <div className="pt-3 border-t flex justify-between text-sm">
          <span><strong>{client.totalOrders}</strong> commandes</span>
          <span><strong>{client.totalSpent.toFixed(2)} DH</strong> dépensé</span>
        </div>
          <Button variant="outline" className="w-full mt-3" onClick={() => handleViewHistory(client)}>
          Voir l'historique
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Clients</h2>
          <p className="text-gray-600">Gérez vos clients particuliers et professionnels</p>
        </div>
        
        <Dialog open={isAddingClient} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Client / Rechercher
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Rechercher ou Créer un Client</DialogTitle>
              <DialogDescription>
                Recherchez un client existant ou créez un nouveau profil client
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <Tabs value={clientFormMode} onValueChange={(value: any) => setClientFormMode(value)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="search" className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Rechercher Client
                  </TabsTrigger>
                  <TabsTrigger value="create" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Créer Nouveau
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="search" className="space-y-4">
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
                    <div className="max-h-60 overflow-y-auto border rounded-lg">
                      {searchResults.length > 0 ? (
                        <div className="space-y-2 p-2">
                          {searchResults.map((client) => (
                            <div
                              key={client.id}
                              className={`p-3 border rounded cursor-pointer transition-colors ${
                                selectedExistingClient?.id === client.id
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'hover:bg-gray-50'
                              }`}
                              onClick={() => setSelectedExistingClient(client)}
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
                                  <p className="text-sm text-gray-600">{client.email}</p>
                                </div>
                                <Badge variant={client.type === 'professional' ? 'default' : 'secondary'}>
                                  {client.type === 'professional' ? 'Pro' : 'Particulier'}
                                </Badge>
                              </div>
                              {selectedExistingClient?.id === client.id && (
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
                          Aucun client trouvé. Créez un nouveau client dans l'onglet "Créer Nouveau".
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!clientSearchTerm && (
                    <div className="text-center text-gray-500 py-8">
                      Commencez à taper pour rechercher un client existant
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="create" className="space-y-4">
                  <Tabs value={newClient.type} onValueChange={(value: any) => setNewClient({...newClient, type: value})}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="individual">Particulier</TabsTrigger>
                      <TabsTrigger value="professional">Professionnel</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="individual" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
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
                    
                    <TabsContent value="professional" className="space-y-4">
                      <div>
                        <Label htmlFor="companyName">Raison sociale</Label>
                        <Input
                          id="companyName"
                          value={newClient.companyName}
                          onChange={(e) => setNewClient({...newClient, companyName: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">Prénom contact</Label>
                          <Input
                            id="firstName"
                            value={newClient.firstName}
                            onChange={(e) => setNewClient({...newClient, firstName: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Nom contact</Label>
                          <Input
                            id="lastName"
                            value={newClient.lastName}
                            onChange={(e) => setNewClient({...newClient, lastName: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="siret">SIRET</Label>
                        <Input
                          id="siret"
                          value={newClient.siret}
                          onChange={(e) => setNewClient({...newClient, siret: e.target.value})}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                  
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
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => handleDialogOpenChange(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleAddClient}
                  disabled={clientFormMode === 'search' ? !selectedExistingClient : false}
                >
                  {clientFormMode === 'search' ? 'Sélectionner Client' : 'Créer Client'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Rechercher par nom, email, téléphone ou entreprise..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients Particuliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{individualClients.length}</div>
            <p className="text-xs text-muted-foreground">
              Total: {clients.filter(c => c.type === 'individual').length} clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients Professionnels</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>            <div className="text-2xl font-bold">{professionalClientsFiltered.length}</div>
            <p className="text-xs text-muted-foreground">
              Total: {adaptedProfessionalClients.length} clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Client Lists */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tous les clients ({filteredClients.length})</TabsTrigger>
          <TabsTrigger value="individual">Particuliers ({individualClients.length})</TabsTrigger>
          <TabsTrigger value="professional">Professionnels ({professionalClientsFiltered.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="individual">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {individualClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="professional">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionalClientsFiltered.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>        </TabsContent>
      </Tabs>

      {/* Modal d'historique des commandes */}
      {selectedClientForHistory && (
        <ClientOrderHistory
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          client={selectedClientForHistory}
        />
      )}
    </div>
  );
};
