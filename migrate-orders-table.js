import Database from 'better-sqlite3';

const db = new Database('pressing.db');

console.log('🔄 Migration de la table orders pour permettre clientId NULL...');

try {
  // Désactiver les contraintes de clé étrangère
  db.pragma('foreign_keys = OFF');
  
  // Commencer une transaction
  db.prepare('BEGIN').run();

  // 1. Créer une nouvelle table orders avec clientId nullable
  console.log('📋 Création de la nouvelle table orders...');
  db.exec(`
    CREATE TABLE orders_new (
      id TEXT PRIMARY KEY,
      clientId TEXT,
      clientName TEXT NOT NULL,
      totalAmount REAL NOT NULL,
      status TEXT NOT NULL,
      paymentStatus TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      estimatedDate TEXT NOT NULL,
      isExceptionalPrice BOOLEAN NOT NULL,
      FOREIGN KEY (clientId) REFERENCES clients (id)
    )
  `);

  // 2. Copier toutes les données existantes
  console.log('📦 Migration des données existantes...');
  db.exec(`
    INSERT INTO orders_new (id, clientId, clientName, totalAmount, status, paymentStatus, createdAt, estimatedDate, isExceptionalPrice)
    SELECT id, clientId, clientName, totalAmount, status, paymentStatus, createdAt, estimatedDate, isExceptionalPrice
    FROM orders
  `);

  // 3. Supprimer l'ancienne table
  console.log('🗑️ Suppression de l\'ancienne table...');
  db.exec('DROP TABLE orders');

  // 4. Renommer la nouvelle table
  console.log('🔄 Renommage de la nouvelle table...');
  db.exec('ALTER TABLE orders_new RENAME TO orders');

  // 5. Mettre à jour les commandes d'invités pour avoir clientId NULL
  console.log('🔄 Mise à jour des commandes d\'invités...');
  const updateResult = db.prepare("UPDATE orders SET clientId = NULL WHERE clientId LIKE 'GUEST%'").run();
  console.log(`✅ ${updateResult.changes} commandes d'invités mises à jour`);

  // 6. Supprimer les clients temporaires
  console.log('🧹 Suppression des clients temporaires...');
  const deleteResult = db.prepare("DELETE FROM clients WHERE isTemporary = 1 OR id LIKE 'GUEST%'").run();
  console.log(`✅ ${deleteResult.changes} clients temporaires supprimés`);
  // Valider la transaction
  db.prepare('COMMIT').run();
  
  // Réactiver les contraintes de clé étrangère
  db.pragma('foreign_keys = ON');

  // Vérification finale
  console.log('\n=== VÉRIFICATION FINALE ===');
  const allOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get();
  console.log(`Total commandes: ${allOrders.count}`);

  const guestOrders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE clientId IS NULL').get();
  console.log(`Commandes d'invités (clientId NULL): ${guestOrders.count}`);

  const remainingGuestClients = db.prepare("SELECT COUNT(*) as count FROM clients WHERE isTemporary = 1 OR id LIKE 'GUEST%'").get();
  console.log(`Clients temporaires restants: ${remainingGuestClients.count}`);

  // Afficher quelques exemples
  const sampleGuestOrders = db.prepare('SELECT id, clientId, clientName FROM orders WHERE clientId IS NULL LIMIT 3').all();
  console.log('\nExemples de commandes d\'invités:');
  sampleGuestOrders.forEach(order => {
    console.log(`- ${order.id}: ${order.clientName} (clientId: ${order.clientId})`);
  });

  console.log('\n🎉 Migration terminée avec succès !');

} catch (error) {
  console.error('❌ Erreur lors de la migration:', error);
  // Annuler la transaction en cas d'erreur
  try {
    db.prepare('ROLLBACK').run();
    console.log('🔙 Transaction annulée');
  } catch (rollbackError) {
    console.error('❌ Erreur lors de l\'annulation:', rollbackError);
  }
} finally {
  db.close();
}
