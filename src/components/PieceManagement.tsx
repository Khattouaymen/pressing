import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit3, Trash2, Shirt, Euro } from "lucide-react";
import { usePieces, Piece } from '@/hooks/useApiDatabase';

export const PieceManagement = () => {
  // Hooks de base de données
  const { pieces, loading, addPiece, updatePiece, deletePiece } = usePieces();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingPiece, setIsAddingPiece] = useState(false);
  const [editingPiece, setEditingPiece] = useState<Piece | null>(null);
  const [newPiece, setNewPiece] = useState({
    name: '',
    category: 'vetement' as 'vetement' | 'linge' | 'accessoire',
    pressingPrice: 0,
    cleaningPressingPrice: 0,
    description: '',
    imageUrl: ''
  });

  // Affichage conditionnel pendant le chargement
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p>Chargement des pièces...</p>
        </div>
      </div>
    );
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "vetement": return "Vêtement";
      case "linge": return "Linge";
      case "accessoire": return "Accessoire";
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "vetement": return "bg-blue-100 text-blue-800";
      case "linge": return "bg-green-100 text-green-800";
      case "accessoire": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredPieces = pieces.filter(piece =>
    piece.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    piece.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleAddPiece = async () => {
    // Validation des champs requis
    if (!newPiece.name.trim()) {
      toast.error('Veuillez saisir le nom de la pièce');
      return;
    }

    if (newPiece.pressingPrice <= 0 && newPiece.cleaningPressingPrice <= 0) {
      toast.error('Veuillez saisir au moins un prix supérieur à 0');
      return;
    }

    try {
      const pieceData = {
        id: `P${Date.now()}`,
        ...newPiece
      };
      
      await addPiece(pieceData);
      setNewPiece({
        name: '',
        category: 'vetement',
        pressingPrice: 0,
        cleaningPressingPrice: 0,
        description: '',
        imageUrl: ''
      });
      setIsAddingPiece(false);
      toast.success(`Pièce "${pieceData.name}" ajoutée avec succès`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la pièce:', error);
      toast.error('Erreur lors de l\'ajout de la pièce');
    }
  };

  const handleEditPiece = (piece: Piece) => {
    setEditingPiece(piece);
    setNewPiece({
      name: piece.name,
      category: piece.category,
      pressingPrice: piece.pressingPrice,
      cleaningPressingPrice: piece.cleaningPressingPrice,
      description: piece.description || '',
      imageUrl: piece.imageUrl || ''
    });
  };
  const handleUpdatePiece = async () => {
    if (editingPiece) {
      // Validation des champs requis
      if (!newPiece.name.trim()) {
        toast.error('Veuillez saisir le nom de la pièce');
        return;
      }

      if (newPiece.pressingPrice <= 0 && newPiece.cleaningPressingPrice <= 0) {
        toast.error('Veuillez saisir au moins un prix supérieur à 0');
        return;
      }

      try {
        const updatedPiece = { ...editingPiece, ...newPiece };
        await updatePiece(updatedPiece);
        setEditingPiece(null);
        setNewPiece({
          name: '',
          category: 'vetement',
          pressingPrice: 0,
          cleaningPressingPrice: 0,
          description: '',
          imageUrl: ''
        });
        toast.success(`Pièce "${updatedPiece.name}" mise à jour avec succès`);
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la pièce:', error);
        toast.error('Erreur lors de la mise à jour de la pièce');
      }
    }
  };

  const handleDeletePiece = async (pieceId: string) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;

    if (!confirm(`Êtes-vous sûr de vouloir supprimer la pièce "${piece.name}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      await deletePiece(pieceId);
      toast.success(`Pièce "${piece.name}" supprimée avec succès`);
    } catch (error) {
      console.error('Erreur lors de la suppression de la pièce:', error);
      toast.error('Erreur lors de la suppression de la pièce');
    }
  };

  const PieceDialog = ({ isEdit = false }: { isEdit?: boolean }) => (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>
          {isEdit ? 'Modifier la pièce' : 'Ajouter une nouvelle pièce'}
        </DialogTitle>
        <DialogDescription>
          {isEdit ? 'Modifiez les informations de la pièce' : 'Créez un nouveau type de pièce avec ses tarifs'}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nom de la pièce</Label>
          <Input
            id="name"
            value={newPiece.name}
            onChange={(e) => setNewPiece({...newPiece, name: e.target.value})}
            placeholder="Ex: Chemise, Pantalon, Robe..."
          />
        </div>
        
        <div>
          <Label htmlFor="category">Catégorie</Label>
          <Select value={newPiece.category} onValueChange={(value: any) => setNewPiece({...newPiece, category: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vetement">Vêtement</SelectItem>
              <SelectItem value="linge">Linge</SelectItem>
              <SelectItem value="accessoire">Accessoire</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pressingPrice">Prix Repassage (€)</Label>
            <Input
              id="pressingPrice"
              type="number"
              step="0.50"
              min="0"
              value={newPiece.pressingPrice}
              onChange={(e) => setNewPiece({...newPiece, pressingPrice: parseFloat(e.target.value) || 0})}
            />
          </div>
          <div>
            <Label htmlFor="cleaningPressingPrice">Prix Nettoyage + Repassage (€)</Label>
            <Input
              id="cleaningPressingPrice"
              type="number"
              step="0.50"
              min="0"
              value={newPiece.cleaningPressingPrice}
              onChange={(e) => setNewPiece({...newPiece, cleaningPressingPrice: parseFloat(e.target.value) || 0})}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">Description (optionnel)</Label>
          <Input
            id="description"
            value={newPiece.description}
            onChange={(e) => setNewPiece({...newPiece, description: e.target.value})}
            placeholder="Description de la pièce..."
          />
        </div>
        
        <div>
          <Label htmlFor="imageUrl">URL de l'image (optionnel)</Label>
          <Input
            id="imageUrl"
            value={newPiece.imageUrl}
            onChange={(e) => setNewPiece({...newPiece, imageUrl: e.target.value})}
            placeholder="https://example.com/image.jpg"
          />
          {newPiece.imageUrl && (
            <div className="mt-2">
              <img 
                src={newPiece.imageUrl} 
                alt="Aperçu" 
                className="w-20 h-20 object-cover rounded border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            variant="outline" 
            onClick={() => {
              setIsAddingPiece(false);
              setEditingPiece(null);
              setNewPiece({
                name: '',
                category: 'vetement',
                pressingPrice: 0,
                cleaningPressingPrice: 0,
                description: '',
                imageUrl: ''
              });
            }}
          >
            Annuler
          </Button>
          <Button onClick={isEdit ? handleUpdatePiece : handleAddPiece}>
            {isEdit ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Pièces</h2>
          <p className="text-gray-600">Gérez les types de pièces et leurs tarifs</p>
        </div>
        
        <Dialog open={isAddingPiece} onOpenChange={setIsAddingPiece}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Pièce
            </Button>
          </DialogTrigger>
          <PieceDialog />
        </Dialog>
        
        <Dialog open={!!editingPiece} onOpenChange={(open) => !open && setEditingPiece(null)}>
          <PieceDialog isEdit={true} />
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Rechercher une pièce..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['vetement', 'linge', 'accessoire'].map(category => {
          const categoryPieces = pieces.filter(p => p.category === category);
          return (
            <Card key={category}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{getCategoryLabel(category)}</CardTitle>
                <Shirt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categoryPieces.length}</div>
                <p className="text-xs text-muted-foreground">
                  Prix moyen: €{categoryPieces.length > 0 ? 
                    (categoryPieces.reduce((sum, p) => sum + p.pressingPrice, 0) / categoryPieces.length).toFixed(2) : 
                    '0.00'
                  }
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Liste des pièces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPieces.map((piece) => (
          <Card key={piece.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              {/* Image de la pièce */}
              {piece.imageUrl && (
                <div className="mb-3">
                  <img 
                    src={piece.imageUrl} 
                    alt={piece.name}
                    className="w-full h-32 object-cover rounded-md border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{piece.name}</CardTitle>
                <Badge className={getCategoryColor(piece.category)}>
                  {getCategoryLabel(piece.category)}
                </Badge>
              </div>
              {piece.description && (
                <CardDescription>{piece.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Repassage:</span>
                  <span className="font-medium flex items-center">
                    <Euro className="w-3 h-3 mr-1" />
                    {piece.pressingPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Nettoyage + Repassage:</span>
                  <span className="font-medium flex items-center">
                    <Euro className="w-3 h-3 mr-1" />
                    {piece.cleaningPressingPrice.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEditPiece(piece)}
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeletePiece(piece.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredPieces.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Shirt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune pièce trouvée</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
