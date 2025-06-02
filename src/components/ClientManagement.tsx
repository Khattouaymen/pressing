
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Users, Building2, Phone, Mail, MapPin, Calendar } from "lucide-react";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  type: 'individual' | 'professional';
  companyName?: string;
  siret?: string;
}

export const ClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingClient, setIsAddingClient] = useState(false);
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

  // Mock data
  const [clients] = useState<Client[]>([
    {
      id: "CLI001",
      firstName: "Marie",
      lastName: "Dubois",
      phone: "06 12 34 56 78",
      email: "marie.dubois@email.com",
      address: "123 Rue de la Paix, 75001 Paris",
      createdAt: "2024-01-15",
      totalOrders: 24,
      totalSpent: 456.80,
      type: 'individual'
    },
    {
      id: "CLI002",
      firstName: "Pierre",
      lastName: "Martin",
      phone: "06 98 76 54 32",
      email: "pierre.martin@email.com",
      address: "456 Avenue des Champs, 75008 Paris",
      createdAt: "2024-02-20",
      totalOrders: 12,
      totalSpent: 234.50,
      type: 'individual'
    },
    {
      id: "PRO001",
      firstName: "Jean",
      lastName: "Directeur",
      phone: "01 23 45 67 89",
      email: "contact@hotelroyal.com",
      address: "789 Boulevard Haussmann, 75009 Paris",
      createdAt: "2024-01-10",
      totalOrders: 156,
      totalSpent: 12456.00,
      type: 'professional',
      companyName: "Hotel Royal",
      siret: "12345678901234"
    }
  ]);

  const filteredClients = clients.filter(client =>
    `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    (client.companyName && client.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const individualClients = filteredClients.filter(c => c.type === 'individual');
  const professionalClients = filteredClients.filter(c => c.type === 'professional');

  const handleAddClient = () => {
    console.log('Adding client:', newClient);
    setIsAddingClient(false);
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
          <span><strong>€{client.totalSpent.toFixed(2)}</strong> dépensé</span>
        </div>
        
        <Button variant="outline" className="w-full mt-3">
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
        
        <Dialog open={isAddingClient} onOpenChange={setIsAddingClient}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau client</DialogTitle>
              <DialogDescription>
                Créez un nouveau profil client particulier ou professionnel
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
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
          <CardContent>
            <div className="text-2xl font-bold">{professionalClients.length}</div>
            <p className="text-xs text-muted-foreground">
              Total: {clients.filter(c => c.type === 'professional').length} clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Client Lists */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tous les clients ({filteredClients.length})</TabsTrigger>
          <TabsTrigger value="individual">Particuliers ({individualClients.length})</TabsTrigger>
          <TabsTrigger value="professional">Professionnels ({professionalClients.length})</TabsTrigger>
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
            {professionalClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
