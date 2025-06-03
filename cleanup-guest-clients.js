import Database from 'better-sqlite3';

const db = new Database('pressing.db');

console.log('🧹 Nettoyage des clients temporaires...');

try {  // Afficher les clients temporaires avant suppression
  console.log('\n=== CLIENTS TEMPORAIRES AVANT NETTOYAGE ===');
  const guestClientsBefore = db.prepare("SELECT * FROM clients WHERE isTemporary = 1 OR id LIKE 'GUEST%'").all();
  console.log('Clients temporaires trouvés:', guestClientsBefore.length);
  guestClientsBefore.forEach(client => {
    console.log(`- ${client.id}: ${client.firstName} ${client.lastName}`);
  });
  // Mettre à jour les commandes pour supprimer les références aux clients invités
  console.log('\n=== MISE À JOUR DES COMMANDES ===');
  const guestOrders = db.prepare("SELECT * FROM orders WHERE clientId LIKE 'GUEST%'").all();
  console.log('Commandes avec clients invités trouvées:', guestOrders.length);
    // Mettre clientId à NULL pour toutes les commandes d'invités
  const updateOrdersStmt = db.prepare("UPDATE orders SET clientId = NULL WHERE clientId LIKE 'GUEST%'");
  const updateResult = updateOrdersStmt.run();
  console.log(`✅ ${updateResult.changes} commandes mises à jour (clientId → NULL)`);
  // Supprimer tous les clients temporaires
  console.log('\n=== SUPPRESSION DES CLIENTS TEMPORAIRES ===');
  const deleteStmt = db.prepare("DELETE FROM clients WHERE isTemporary = 1 OR id LIKE 'GUEST%'");
  const deleteResult = deleteStmt.run();
  console.log(`✅ ${deleteResult.changes} clients temporaires supprimés`);
  // Vérification finale
  console.log('\n=== VÉRIFICATION FINALE ===');
  const remainingGuests = db.prepare("SELECT * FROM clients WHERE isTemporary = 1 OR id LIKE 'GUEST%'").all();
  console.log('Clients temporaires restants:', remainingGuests.length);

  const ordersWithNullClient = db.prepare('SELECT * FROM orders WHERE clientId IS NULL').all();
  console.log('Commandes avec clientId NULL (invités):', ordersWithNullClient.length);
  
  console.log('\n🎉 Nettoyage terminé avec succès !');
  
} catch (error) {
  console.error('❌ Erreur lors du nettoyage:', error);
} finally {
  db.close();
}
