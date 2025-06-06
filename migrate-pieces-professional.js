const Database = require('better-sqlite3');
const path = require('path');

// Script de migration pour ajouter la colonne isProfessional à la table pieces
function migratePiecesTable() {
  const dbPath = path.join(__dirname, 'pressing.db');
  const db = new Database(dbPath);
  
  try {
    console.log('🚀 Début de la migration de la table pieces...');
    
    // Vérifier si la colonne existe déjà
    const tableInfo = db.prepare("PRAGMA table_info(pieces)").all();
    const hasProfessionalColumn = tableInfo.some(col => col.name === 'isProfessional');
    
    if (hasProfessionalColumn) {
      console.log('✅ La colonne isProfessional existe déjà dans la table pieces');
      return;
    }
    
    // Ajouter la colonne isProfessional
    console.log('📝 Ajout de la colonne isProfessional...');
    db.exec('ALTER TABLE pieces ADD COLUMN isProfessional BOOLEAN DEFAULT FALSE');
    
    // Ajouter quelques pièces professionnelles par défaut
    console.log('🏢 Ajout de pièces professionnelles par défaut...');
    
    const insertPiece = db.prepare(`
      INSERT OR IGNORE INTO pieces (id, name, category, pressingPrice, cleaningPressingPrice, imageUrl, isProfessional)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const professionalPieces = [
      {
        id: 'prof-uniforme-1',
        name: 'Uniforme de travail',
        category: 'vetement',
        pressingPrice: 8.50,
        cleaningPressingPrice: 12.00,
        imageUrl: '/placeholder.svg',
        isProfessional: true
      },
      {
        id: 'prof-blouse-1',
        name: 'Blouse médicale',
        category: 'vetement',
        pressingPrice: 7.00,
        cleaningPressingPrice: 10.50,
        imageUrl: '/placeholder.svg',
        isProfessional: true
      },
      {
        id: 'prof-tablier-1',
        name: 'Tablier de cuisine professionnel',
        category: 'vetement',
        pressingPrice: 6.50,
        cleaningPressingPrice: 9.50,
        imageUrl: '/placeholder.svg',
        isProfessional: true
      },
      {
        id: 'prof-nappe-1',
        name: 'Nappe de restaurant',
        category: 'linge',
        pressingPrice: 12.00,
        cleaningPressingPrice: 15.50,
        imageUrl: '/placeholder.svg',
        isProfessional: true
      },
      {
        id: 'prof-serviette-1',
        name: 'Serviette de table professionnelle',
        category: 'linge',
        pressingPrice: 3.50,
        cleaningPressingPrice: 5.00,
        imageUrl: '/placeholder.svg',
        isProfessional: true
      },
      {
        id: 'prof-combinaison-1',
        name: 'Combinaison de travail',
        category: 'vetement',
        pressingPrice: 15.00,
        cleaningPressingPrice: 20.00,
        imageUrl: '/placeholder.svg',
        isProfessional: true
      }
    ];
    
    professionalPieces.forEach(piece => {
      insertPiece.run(
        piece.id,
        piece.name,
        piece.category,
        piece.pressingPrice,
        piece.cleaningPressingPrice,
        piece.imageUrl,
        piece.isProfessional ? 1 : 0
      );
    });
    
    console.log('✅ Migration terminée avec succès !');
    console.log(`📊 ${professionalPieces.length} pièces professionnelles ajoutées`);
    
    // Vérification
    const totalPieces = db.prepare('SELECT COUNT(*) as count FROM pieces').get();
    const professionalCount = db.prepare('SELECT COUNT(*) as count FROM pieces WHERE isProfessional = 1').get();
    
    console.log(`📈 Total des pièces: ${totalPieces.count}`);
    console.log(`🏢 Pièces professionnelles: ${professionalCount.count}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Exécuter la migration
if (require.main === module) {
  migratePiecesTable();
}

module.exports = { migratePiecesTable };
