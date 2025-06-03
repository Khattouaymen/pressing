import Database from 'better-sqlite3';

const db = new Database('pressing.db');

console.log('📋 Structure de la table orders:');
const tableInfo = db.prepare("PRAGMA table_info(orders)").all();
console.log(tableInfo);

console.log('\n📋 Index sur la table orders:');
const indexes = db.prepare("PRAGMA index_list(orders)").all();
console.log(indexes);

db.close();
