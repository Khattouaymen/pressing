const Database = require('better-sqlite3');

console.log('Checking pressing.db...');
try {
  const db = new Database('./pressing.db');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table';").all();
  console.log('Tables in pressing.db:', tables);
  
  const pieces = db.prepare('SELECT COUNT(*) as count FROM pieces').get();
  console.log('Number of pieces:', pieces.count);
  
  const professionalPieces = db.prepare('SELECT id, name, isProfessional FROM pieces WHERE isProfessional = 1').all();
  console.log('Professional pieces:', professionalPieces);
  
  const allPieces = db.prepare('SELECT id, name, isProfessional FROM pieces LIMIT 5').all();
  console.log('First 5 pieces:', allPieces);
  
  db.close();
} catch(e) { 
  console.log('Error with pressing.db:', e.message); 
}

console.log('\nChecking database.db...');
try {
  const db2 = new Database('./database.db');
  const tables2 = db2.prepare("SELECT name FROM sqlite_master WHERE type='table';").all();
  console.log('Tables in database.db:', tables2);
  db2.close();
} catch(e) { 
  console.log('Error with database.db:', e.message); 
}
