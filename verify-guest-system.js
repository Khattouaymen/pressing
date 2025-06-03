import Database from 'better-sqlite3';

const db = new Database('pressing.db');

console.log('🔍 === VÉRIFICATION DU SYSTÈME CLIENT INVITÉ ===\n');

try {
  // 1. Vérifier qu'il n'y a plus de clients temporaires
  console.log('1️⃣ CLIENTS TEMPORAIRES:');
  const tempClients = db.prepare("SELECT * FROM clients WHERE isTemporary = 1 OR id LIKE 'GUEST%'").all();
  console.log(`   ✅ Clients temporaires trouvés: ${tempClients.length} (devrait être 0)`);
  
  if (tempClients.length > 0) {
    tempClients.forEach(client => {
      console.log(`   ⚠️  Client temporaire restant: ${client.id} - ${client.firstName} ${client.lastName}`);
    });
  }

  // 2. Vérifier les commandes avec clientId NULL (invités)
  console.log('\n2️⃣ COMMANDES D\'INVITÉS:');
  const guestOrders = db.prepare('SELECT * FROM orders WHERE clientId IS NULL').all();
  console.log(`   📦 Commandes d'invités: ${guestOrders.length}`);
  
  guestOrders.forEach(order => {
    console.log(`   - ${order.id}: ${order.clientName} (${order.totalAmount} DH)`);
  });

  // 3. Vérifier les commandes avec clientId non-NULL (vrais clients)
  console.log('\n3️⃣ COMMANDES DE VRAIS CLIENTS:');
  const realClientOrders = db.prepare('SELECT * FROM orders WHERE clientId IS NOT NULL').all();
  console.log(`   👥 Commandes de vrais clients: ${realClientOrders.length}`);
  
  realClientOrders.forEach(order => {
    console.log(`   - ${order.id}: ${order.clientName} (Client ID: ${order.clientId}) (${order.totalAmount} DH)`);
  });

  // 4. Vérifier la structure de la table orders
  console.log('\n4️⃣ STRUCTURE TABLE ORDERS:');
  const tableInfo = db.prepare("PRAGMA table_info(orders)").all();
  const clientIdColumn = tableInfo.find(col => col.name === 'clientId');
  console.log(`   🔧 Colonne clientId: type=${clientIdColumn.type}, notnull=${clientIdColumn.notnull} (devrait être 0)`);

  // 5. Total des commandes
  console.log('\n5️⃣ RÉSUMÉ:');
  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get();
  const guestOrdersCount = db.prepare('SELECT COUNT(*) as count FROM orders WHERE clientId IS NULL').get();
  const realOrdersCount = db.prepare('SELECT COUNT(*) as count FROM orders WHERE clientId IS NOT NULL').get();
  
  console.log(`   📊 Total commandes: ${totalOrders.count}`);
  console.log(`   👻 Commandes invités: ${guestOrdersCount.count}`);
  console.log(`   👥 Commandes clients: ${realOrdersCount.count}`);
  console.log(`   ✅ Vérification: ${guestOrdersCount.count + realOrdersCount.count === totalOrders.count ? 'OK' : 'ERREUR'}`);

  console.log('\n🎉 Vérification terminée !');

} catch (error) {
  console.error('❌ Erreur lors de la vérification:', error);
} finally {
  db.close();
}
