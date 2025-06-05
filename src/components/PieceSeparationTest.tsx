import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data that matches our OrderManagement_new.tsx
const availablePieces = [
  { id: 'chemise', name: 'Chemise', category: 'vetement' as const, pressingPrice: 3.50, cleaningPressingPrice: 8.00, isProfessional: false },
  { id: 'pantalon', name: 'Pantalon', category: 'vetement' as const, pressingPrice: 4.00, cleaningPressingPrice: 9.00, isProfessional: false },
  { id: 'veste', name: 'Veste', category: 'vetement' as const, pressingPrice: 6.00, cleaningPressingPrice: 12.00, isProfessional: false },
  { id: 'robe', name: 'Robe', category: 'vetement' as const, pressingPrice: 5.00, cleaningPressingPrice: 10.00, isProfessional: false },
  { id: 'jupe', name: 'Jupe', category: 'vetement' as const, pressingPrice: 3.50, cleaningPressingPrice: 8.00, isProfessional: false },
  { id: 'pull', name: 'Pull/Tricot', category: 'vetement' as const, pressingPrice: 4.50, cleaningPressingPrice: 9.50, isProfessional: false },
  { id: 'costume', name: 'Costume complet', category: 'vetement' as const, pressingPrice: 12.00, cleaningPressingPrice: 20.00, isProfessional: true },
  { id: 'manteau', name: 'Manteau', category: 'vetement' as const, pressingPrice: 8.00, cleaningPressingPrice: 15.00, isProfessional: false },
  { id: 'drap', name: 'Drap', category: 'linge' as const, pressingPrice: 5.00, cleaningPressingPrice: 8.00, isProfessional: false },
  { id: 'housse', name: 'Housse de couette', category: 'linge' as const, pressingPrice: 6.00, cleaningPressingPrice: 10.00, isProfessional: false },
  { id: 'nappe', name: 'Nappe', category: 'linge' as const, pressingPrice: 4.00, cleaningPressingPrice: 7.00, isProfessional: true },
  { id: 'rideau', name: 'Rideau', category: 'linge' as const, pressingPrice: 8.00, cleaningPressingPrice: 12.00, isProfessional: false },
  { id: 'cravate', name: 'Cravate', category: 'accessoire' as const, pressingPrice: 2.50, cleaningPressingPrice: 5.00, isProfessional: false },
  { id: 'foulard', name: 'Foulard', category: 'accessoire' as const, pressingPrice: 3.00, cleaningPressingPrice: 6.00, isProfessional: false }
];

export const PieceSeparationTest = () => {
  // Filter pieces for individual clients (should exclude professional pieces)
  const individualClientPieces = availablePieces.filter(piece => !piece.isProfessional);
  
  // Filter pieces for professional clients (should only include professional pieces)
  const professionalClientPieces = availablePieces.filter(piece => piece.isProfessional);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Test de Séparation des Pièces</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Individual Client Pieces */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Pièces pour Clients Individuels
              <Badge variant="secondary">{individualClientPieces.length} pièces</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {individualClientPieces.map(piece => (
                <div key={piece.id} className="flex justify-between items-center p-2 border rounded">
                  <span className="font-medium">{piece.name}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">{piece.category}</Badge>
                    <Badge variant="default">Individual</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Professional Client Pieces */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Pièces pour Clients Professionnels
              <Badge variant="secondary">{professionalClientPieces.length} pièces</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {professionalClientPieces.map(piece => (
                <div key={piece.id} className="flex justify-between items-center p-2 border rounded">
                  <span className="font-medium">{piece.name}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">{piece.category}</Badge>
                    <Badge variant="destructive">Professional</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé de la Séparation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{availablePieces.length}</div>
              <div className="text-sm text-gray-600">Total des Pièces</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{individualClientPieces.length}</div>
              <div className="text-sm text-gray-600">Pièces Individuelles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{professionalClientPieces.length}</div>
              <div className="text-sm text-gray-600">Pièces Professionnelles</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h4 className="font-medium mb-2">Configuration Actuelle:</h4>
            <ul className="text-sm space-y-1">
              <li>• <strong>Pièces Professionnelles:</strong> {professionalClientPieces.map(p => p.name).join(', ')}</li>
              <li>• <strong>Clients Individuels</strong> ne voient que les {individualClientPieces.length} pièces non-professionnelles</li>
              <li>• <strong>Clients Professionnels</strong> ne voient que les {professionalClientPieces.length} pièces professionnelles</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
