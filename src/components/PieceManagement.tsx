import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Package, Edit3, Trash2 } from "lucide-react";
import { usePieces, Piece } from '@/hooks/useApiDatabase';

export const PieceManagement = () => {
  const { pieces, loading, addPiece, updatePiece, deletePiece } = usePieces();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [professionalFilter, setProfessionalFilter] = useState("all");
  const [isCreatingPiece, setIsCreatingPiece] = useState(false);
  const [editingPiece, setEditingPiece] = useState<Piece | null>(null);  const [newPiece, setNewPiece] = useState({
    name: '',
    category: 'vetement' as 'vetement' | 'linge' | 'accessoire',
    pressingPrice: '',
    cleaningPressingPrice: '',
    imageUrl: '',
    isProfessional: false
  });  const resetForm = () => {
    setNewPiece({
      name: '',
      category: 'vetement' as 'vetement' | 'linge' | 'accessoire',
      pressingPrice: '',
      cleaningPressingPrice: '',
      imageUrl: '',
      isProfessional: false
    });
    setEditingPiece(null);
  };const handleCreatePiece = async () => {
    if (!newPiece.name || !newPiece.category) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const pressingPrice = parseFloat(newPiece.pressingPrice) || 0;
    const cleaningPressingPrice = parseFloat(newPiece.cleaningPressingPrice) || 0;

    if (pressingPrice < 0 || cleaningPressingPrice < 0) {
      toast.error('Les prix ne peuvent pas être négatifs');
      return;
    }

    try {
      let nextPieceNumber = 1;
      while (pieces.some(piece => piece.id === `PIECE${nextPieceNumber}`)) {
        nextPieceNumber++;
      }

      const pieceData = {
        id: `PIECE${nextPieceNumber}`,
        ...newPiece,
        pressingPrice,
        cleaningPressingPrice,
        createdAt: new Date().toISOString(),
      };

      await addPiece(pieceData);
      setIsCreatingPiece(false);
      resetForm();
      toast.success(`Pièce "${pieceData.name}" créée avec succès`);
    } catch (error) {
      console.error('Erreur lors de la création de la pièce:', error);
      toast.error('Erreur lors de la création de la pièce');
    }
  };
  const handleEditPiece = async () => {
    if (!editingPiece || !newPiece.name || !newPiece.category) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const pressingPrice = parseFloat(newPiece.pressingPrice.toString()) || 0;
    const cleaningPressingPrice = parseFloat(newPiece.cleaningPressingPrice.toString()) || 0;

    if (pressingPrice < 0 || cleaningPressingPrice < 0) {
      toast.error('Les prix ne peuvent pas être négatifs');
      return;
    }

    try {
      const updatedPiece = {
        ...editingPiece,
        ...newPiece,
        pressingPrice,
        cleaningPressingPrice,
        updatedAt: new Date().toISOString(),
      };

      await updatePiece(updatedPiece);
      setEditingPiece(null);
      resetForm();
      toast.success(`Pièce "${updatedPiece.name}" modifiée avec succès`);
    } catch (error) {
      console.error('Erreur lors de la modification de la pièce:', error);
      toast.error('Erreur lors de la modification de la pièce');
    }
  };

  const handleDeletePiece = async (piece: Piece) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la pièce "${piece.name}" ?`)) {
      return;
    }

    try {
      await deletePiece(piece.id);
      toast.success(`Pièce "${piece.name}" supprimée avec succès`);
    } catch (error) {
      console.error('Erreur lors de la suppression de la pièce:', error);
      toast.error('Erreur lors de la suppression de la pièce');
    }
  };  const startEdit = (piece: Piece) => {
    setEditingPiece(piece);
    setNewPiece({
      name: piece.name,
      category: piece.category,
      pressingPrice: piece.pressingPrice.toString(),
      cleaningPressingPrice: piece.cleaningPressingPrice.toString(),
      imageUrl: piece.imageUrl || '',
      isProfessional: piece.isProfessional || false
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setIsCreatingPiece(false);
      setEditingPiece(null);
      resetForm();
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p>Chargement des pièces...</p>
        </div>
      </div>
    );
  }
  const filteredPieces = pieces.filter(piece => {
    const matchesSearch = piece.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         piece.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || piece.category === categoryFilter;
    const matchesProfessional = professionalFilter === "all" || 
                               (professionalFilter === "professional" && piece.isProfessional) ||
                               (professionalFilter === "standard" && !piece.isProfessional);
    return matchesSearch && matchesCategory && matchesProfessional;
  });

  const categories = [...new Set(pieces.map(piece => piece.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Pièces</h2>
          <p className="text-gray-600">Gérez le catalogue des pièces et leurs tarifs</p>
        </div>
        
        <Button onClick={() => setIsCreatingPiece(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Pièce
        </Button>
      </div>      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher une pièce..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrer par catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Type de clientèle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="standard">Clients particuliers</SelectItem>
            <SelectItem value="professional">Clients professionnels (B2B)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des pièces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPieces.map((piece) => (
          <Card key={piece.id} className="hover:shadow-md transition-shadow">            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{piece.name}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary">{piece.category}</Badge>
                  {piece.isProfessional ? (
                    <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                      B2B
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                      B2C
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader><CardContent className="space-y-3">
              <div className="relative mb-3">
                <img 
                  src={piece.imageUrl || 'https://cdn-icons-png.flaticon.com/512/3091/3091811.png'} 
                  alt={piece.name}
                  className="w-full h-32 object-cover rounded-md border"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Image+non+disponible';
                  }}
                />
              </div><div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Pressing:</span>
                  <span className="font-medium">{piece.pressingPrice.toFixed(2)} DH</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Nettoyage + Pressing:</span>
                  <span className="font-medium">{piece.cleaningPressingPrice.toFixed(2)} DH</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => startEdit(piece)}
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeletePiece(piece)}
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
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Aucune pièce trouvée' : 'Aucune pièce disponible'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog for creating/editing piece */}
      <Dialog open={isCreatingPiece || !!editingPiece} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingPiece ? 'Modifier la pièce' : 'Créer une nouvelle pièce'}
            </DialogTitle>
            <DialogDescription>
              {editingPiece 
                ? 'Modifiez les informations de la pièce' 
                : 'Ajoutez une nouvelle pièce au catalogue avec ses tarifs'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">            <div>
              <Label htmlFor="name">Nom de la pièce</Label>
              <Input
                id="name"
                value={newPiece.name}
                onChange={(e) => setNewPiece({...newPiece, name: e.target.value})}
                placeholder="Ex: Chemise, Pantalon, Robe..."
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">URL de l'image (optionnel)</Label>
              <Input
                id="imageUrl"
                value={newPiece.imageUrl}
                onChange={(e) => setNewPiece({...newPiece, imageUrl: e.target.value})}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
            </div><div>
              <Label htmlFor="category">Catégorie</Label>
              <Select
                value={newPiece.category}
                onValueChange={(value: 'vetement' | 'linge' | 'accessoire') => 
                  setNewPiece({...newPiece, category: value})
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vetement">Vêtement</SelectItem>
                  <SelectItem value="linge">Linge</SelectItem>
                  <SelectItem value="accessoire">Accessoire</SelectItem>
                </SelectContent>
              </Select>            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isProfessional"
                checked={newPiece.isProfessional}
                onCheckedChange={(checked) => setNewPiece({...newPiece, isProfessional: checked})}
              />
              <Label htmlFor="isProfessional" className="text-sm font-medium">
                Pièce destinée aux clients professionnels (B2B)
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pressingPrice">Prix Pressing (DH)</Label>
                <Input
                  id="pressingPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPiece.pressingPrice}
                  onChange={(e) => setNewPiece({...newPiece, pressingPrice: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="cleaningPressingPrice">Prix Nettoyage + Pressing (DH)</Label>
                <Input
                  id="cleaningPressingPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPiece.cleaningPressingPrice}
                  onChange={(e) => setNewPiece({...newPiece, cleaningPressingPrice: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => handleDialogOpenChange(false)}
              >
                Annuler
              </Button>
              <Button 
                onClick={editingPiece ? handleEditPiece : handleCreatePiece}
              >
                {editingPiece ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};