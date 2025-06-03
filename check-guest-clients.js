import Database from 'better-sqlite3';

const db = new Database('pressing.db');

console.log('=== CLIENTS TEMPORAIRES ===');
const guestClients = db.prepare('SELECT * FROM clients WHERE isTemporary = 1').all();
console.log('Clients invités créés:', guestClients);

console.log('\n=== COMMANDES INVITÉS ===');
const guestOrders = db.prepare("SELECT * FROM orders WHERE clientId LIKE 'GUEST%'").all();
console.log('Commandes avec clients invités:', guestOrders);

console.log('\n=== PIÈCES DES COMMANDES INVITÉS ===');
if (guestOrders.length > 0) {
  guestOrders.forEach(order => {
    const pieces = db.prepare('SELECT * FROM order_pieces WHERE orderId = ?').all(order.id);
    console.log(`Pièces pour commande ${order.id}:`, pieces);
  });
}

db.close();
