import express from 'express';
import cors from 'cors';
import path from 'path';
import Database from 'better-sqlite3';

// Réimplémentation de la classe DatabaseManager pour le serveur
class DatabaseManager {
  constructor() {
    const dbPath = 'pressing.db';
    this.db = new Database(dbPath);
    this.initializeTables();
    this.seedInitialData();
  }

  initializeTables() {
    // Table des clients particuliers
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        address TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        totalOrders INTEGER DEFAULT 0,
        totalSpent REAL DEFAULT 0,
        type TEXT NOT NULL,
        companyName TEXT,
        siret TEXT
      )
    `);

    // Table des pièces
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS pieces (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        pressingPrice REAL NOT NULL,
        cleaningPressingPrice REAL NOT NULL,
        imageUrl TEXT NOT NULL
      )
    `);    // Table des commandes
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
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

    // Table des pièces de commande
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS order_pieces (
        id TEXT PRIMARY KEY,
        orderId TEXT NOT NULL,
        pieceId TEXT NOT NULL,
        pieceName TEXT NOT NULL,
        serviceType TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unitPrice REAL NOT NULL,
        totalPrice REAL NOT NULL,
        FOREIGN KEY (orderId) REFERENCES orders (id),
        FOREIGN KEY (pieceId) REFERENCES pieces (id)
      )
    `);

    // Table des clients professionnels
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS professional_clients (
        id TEXT PRIMARY KEY,
        companyName TEXT NOT NULL,
        siret TEXT NOT NULL,
        contactName TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        billingAddress TEXT NOT NULL,
        paymentTerms INTEGER NOT NULL,
        specialRate INTEGER NOT NULL,
        totalOrders INTEGER DEFAULT 0,
        totalSpent REAL DEFAULT 0,
        outstandingAmount REAL DEFAULT 0,
        createdAt TEXT NOT NULL
      )
    `);

    // Table des commandes professionnelles
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS professional_orders (
        id TEXT PRIMARY KEY,
        clientId TEXT NOT NULL,
        clientName TEXT NOT NULL,
        pieces INTEGER NOT NULL,
        service TEXT NOT NULL,
        totalAmount REAL NOT NULL,
        status TEXT NOT NULL,
        paymentStatus TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        deliveryDate TEXT NOT NULL,
        dueDate TEXT NOT NULL,
        priority TEXT NOT NULL,
        FOREIGN KEY (clientId) REFERENCES professional_clients (id)
      )
    `);
  }
  seedInitialData() {
    const clientCount = this.db.prepare('SELECT COUNT(*) as count FROM clients').get();
    
    if (clientCount.count === 0) {
      // Insérer les pièces
      const insertPiece = this.db.prepare(`
        INSERT OR IGNORE INTO pieces (id, name, category, pressingPrice, cleaningPressingPrice, imageUrl)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const pieces = [
        ['P001', 'Chemise', 'vetement', 3.50, 8.00, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop&crop=center'],
        ['P002', 'Pantalon', 'vetement', 4.00, 9.50, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=300&h=300&fit=crop&crop=center'],
        ['P003', 'Veste', 'vetement', 6.50, 15.00, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop&crop=center'],
        ['P004', 'Robe', 'vetement', 5.00, 12.00, 'https://images.unsplash.com/photo-1566479179817-0b9e588a2c88?w=300&h=300&fit=crop&crop=center'],
        ['P005', 'Manteau', 'vetement', 8.00, 18.00, 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop&crop=center'],
        ['P006', 'Costume', 'vetement', 12.00, 25.00, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center'],
        ['P007', 'Nappe', 'linge', 3.00, 7.50, 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=300&fit=crop&crop=center'],
        ['P008', 'Cravate', 'accessoire', 2.50, 6.00, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center']
      ];      pieces.forEach(piece => {
        insertPiece.run(...piece);
      });

      // Insérer les clients professionnels
      const insertProfClient = this.db.prepare(`
        INSERT OR IGNORE INTO professional_clients (id, companyName, siret, contactName, email, phone, billingAddress, paymentTerms, specialRate, totalOrders, totalSpent, outstandingAmount, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const profClients = [
        ['PRO001', 'Hotel Royal', '12345678901234', 'Jean Directeur', 'contact@hotelroyal.com', '01 23 45 67 89', '789 Boulevard Haussmann, 75009 Paris', 30, 15, 0, 0, 0, new Date().toISOString()],
        ['PRO002', 'Restaurant Le Gourmet', '98765432109876', 'Marie Chef', 'contact@legourmet.fr', '01 98 76 54 32', '456 Rue de la Gastronomie, 75007 Paris', 15, 10, 0, 0, 0, new Date().toISOString()]
      ];

      profClients.forEach(client => {
        insertProfClient.run(...client);
      });      console.log('Base de données SQLite initialisée avec les données de test');
    }
  }

  // Méthodes pour générer des IDs séquentiels
  getNextClientId() {
    const result = this.db.prepare('SELECT COUNT(*) as count FROM clients WHERE id LIKE "CLI%"').get();
    return `CLI${result.count + 1}`;
  }

  getNextOrderId() {
    const result = this.db.prepare('SELECT COUNT(*) as count FROM orders WHERE id LIKE "PR%"').get();
    return `PR${result.count + 1}`;
  }

  getNextProfessionalClientId() {
    const result = this.db.prepare('SELECT COUNT(*) as count FROM professional_clients WHERE id LIKE "PRO%"').get();
    const existingCount = result.count;
    // Commencer à PRO003 car PRO001 et PRO002 existent déjà
    return `PRO${Math.max(existingCount + 1, 3)}`;
  }

  // Méthodes pour les clients
  getAllClients() {
    return this.db.prepare('SELECT * FROM clients ORDER BY createdAt DESC').all();
  }

  insertClient(client) {
    const stmt = this.db.prepare(`
      INSERT INTO clients (id, firstName, lastName, phone, email, address, createdAt, type, companyName, siret, totalOrders, totalSpent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      client.id, client.firstName, client.lastName, client.phone, 
      client.email, client.address, client.createdAt, client.type,
      client.companyName || null, client.siret || null, client.totalOrders || 0, client.totalSpent || 0
    );
  }

  updateClient(client) {
    const stmt = this.db.prepare(`
      UPDATE clients SET firstName = ?, lastName = ?, phone = ?, email = ?, address = ?, 
                         type = ?, companyName = ?, siret = ?, totalOrders = ?, totalSpent = ?
      WHERE id = ?
    `);
    stmt.run(
      client.firstName, client.lastName, client.phone, client.email, client.address,
      client.type, client.companyName || null, client.siret || null,
      client.totalOrders, client.totalSpent, client.id
    );
  }

  deleteClient(id) {
    const stmt = this.db.prepare('DELETE FROM clients WHERE id = ?');
    stmt.run(id);
  }

  // Méthodes pour les pièces
  getAllPieces() {
    return this.db.prepare('SELECT * FROM pieces ORDER BY name').all();
  }

  insertPiece(piece) {
    const stmt = this.db.prepare(`
      INSERT INTO pieces (id, name, category, pressingPrice, cleaningPressingPrice, imageUrl)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(piece.id, piece.name, piece.category, piece.pressingPrice, piece.cleaningPressingPrice, piece.imageUrl);
  }

  updatePiece(piece) {
    const stmt = this.db.prepare(`
      UPDATE pieces SET name = ?, category = ?, pressingPrice = ?, cleaningPressingPrice = ?, imageUrl = ?
      WHERE id = ?
    `);
    stmt.run(piece.name, piece.category, piece.pressingPrice, piece.cleaningPressingPrice, piece.imageUrl, piece.id);
  }

  deletePiece(id) {
    const stmt = this.db.prepare('DELETE FROM pieces WHERE id = ?');
    stmt.run(id);
  }

  // Méthodes pour les commandes
  getAllOrders() {
    return this.db.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all();
  }  insertOrder(order) {
    // Détecter si c'est un client invité
    const isGuestClient = order.clientId && order.clientId.startsWith('GUEST');
    
    if (isGuestClient) {
      // Vérifier si le client temporaire existe déjà
      const existingClient = this.db.prepare('SELECT id FROM clients WHERE id = ?').get(order.clientId);
      
      if (!existingClient) {
        // Créer un client temporaire pour les clients invités
        const tempClient = {
          id: order.clientId,
          firstName: order.clientName.split(' ')[0] || 'Client',
          lastName: order.clientName.split(' ').slice(1).join(' ') || 'Invité',
          phone: 'Non renseigné',
          email: '',
          address: '',
          type: 'individual',
          companyName: '',
          createdAt: new Date().toISOString(),
          isTemporary: 1
        };
        
        console.log('🔍 Création client temporaire:', tempClient);
        
        // Insérer le client temporaire en base
        const clientStmt = this.db.prepare(`
          INSERT INTO clients (id, firstName, lastName, phone, email, address, type, companyName, createdAt, isTemporary, totalOrders, totalSpent)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        clientStmt.run(
          tempClient.id, tempClient.firstName, tempClient.lastName, tempClient.phone,
          tempClient.email, tempClient.address, tempClient.type, tempClient.companyName,
          tempClient.createdAt, tempClient.isTemporary, 0, 0
        );
      } else {
        console.log('🔍 Client temporaire existant trouvé:', order.clientId);
      }
    }
    
    console.log('🔍 Insertion de commande:', {
      orderId: order.id,
      clientId: order.clientId,
      isGuestClient: isGuestClient,
      clientName: order.clientName
    });    const stmt = this.db.prepare(`
      INSERT INTO orders (id, clientId, clientName, totalAmount, status, paymentStatus, createdAt, estimatedDate, isExceptionalPrice)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      order.id, order.clientId, order.clientName, order.totalAmount,
      order.status, order.paymentStatus, order.createdAt, order.estimatedDate,
      order.isExceptionalPrice ? 1 : 0  // Convert boolean to integer
    );

    // Mettre à jour les statistiques du client
    if (order.clientId && !order.clientId.startsWith('GUEST')) {
      const updateClientStmt = this.db.prepare(`
        UPDATE clients 
        SET totalOrders = totalOrders + 1, 
            totalSpent = totalSpent + ? 
        WHERE id = ?
      `);
      updateClientStmt.run(order.totalAmount, order.clientId);
      console.log('🔍 Statistiques client mises à jour:', {
        clientId: order.clientId,
        newOrderAmount: order.totalAmount
      });
    }
  }
  updateOrder(order) {
    const stmt = this.db.prepare(`
      UPDATE orders SET clientId = ?, clientName = ?, totalAmount = ?, status = ?,
                        paymentStatus = ?, estimatedDate = ?, isExceptionalPrice = ?
      WHERE id = ?
    `);
    stmt.run(
      order.clientId, order.clientName, order.totalAmount, order.status,
      order.paymentStatus, order.estimatedDate, order.isExceptionalPrice ? 1 : 0, order.id
    );
  }

  // Fonction pour recalculer les statistiques des clients
  recalculateClientStats() {
    console.log('🔄 Recalcul des statistiques des clients...');
    
    // Recalculer pour les clients individuels
    const clientStats = this.db.prepare(`
      SELECT clientId, COUNT(*) as orderCount, SUM(totalAmount) as totalSpent
      FROM orders 
      WHERE clientId IS NOT NULL AND clientId != '' AND NOT clientId LIKE 'GUEST%'
      GROUP BY clientId
    `).all();

    clientStats.forEach(stat => {
      const updateStmt = this.db.prepare(`
        UPDATE clients 
        SET totalOrders = ?, totalSpent = ?
        WHERE id = ?
      `);
      updateStmt.run(stat.orderCount, stat.totalSpent || 0, stat.clientId);
      console.log(`✅ Client ${stat.clientId}: ${stat.orderCount} commandes, ${stat.totalSpent || 0} DH`);
    });

    // Recalculer pour les clients professionnels
    const professionalStats = this.db.prepare(`
      SELECT clientId, COUNT(*) as orderCount, SUM(totalAmount) as totalSpent
      FROM professional_orders 
      WHERE clientId IS NOT NULL AND clientId != ''
      GROUP BY clientId
    `).all();

    professionalStats.forEach(stat => {
      const updateStmt = this.db.prepare(`
        UPDATE professional_clients 
        SET totalOrders = ?, totalSpent = ?
        WHERE id = ?
      `);
      updateStmt.run(stat.orderCount, stat.totalSpent || 0, stat.clientId);
      console.log(`✅ Client Pro ${stat.clientId}: ${stat.orderCount} commandes, ${stat.totalSpent || 0} DH`);
    });

    console.log('✅ Recalcul des statistiques terminé');
  }

  deleteOrder(id) {
    const stmt = this.db.prepare('DELETE FROM orders WHERE id = ?');
    stmt.run(id);
  }

  insertOrderPiece(orderPiece) {
    const stmt = this.db.prepare(`
      INSERT INTO order_pieces (id, orderId, pieceId, pieceName, serviceType, quantity, unitPrice, totalPrice)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      orderPiece.id, orderPiece.orderId, orderPiece.pieceId, orderPiece.pieceName,
      orderPiece.serviceType, orderPiece.quantity, orderPiece.unitPrice, orderPiece.totalPrice
    );
  }

  getOrderPieces(orderId) {
    return this.db.prepare('SELECT * FROM order_pieces WHERE orderId = ?').all(orderId);
  }

  // Méthodes pour les clients professionnels
  getAllProfessionalClients() {
    return this.db.prepare('SELECT * FROM professional_clients ORDER BY createdAt DESC').all();
  }

  insertProfessionalClient(client) {
    const stmt = this.db.prepare(`
      INSERT INTO professional_clients (id, companyName, siret, contactName, email, phone, billingAddress, paymentTerms, specialRate, createdAt, totalOrders, totalSpent, outstandingAmount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      client.id, client.companyName, client.siret, client.contactName,
      client.email, client.phone, client.billingAddress, client.paymentTerms,
      client.specialRate, client.createdAt, client.totalOrders || 0, client.totalSpent || 0, client.outstandingAmount || 0
    );
  }

  updateProfessionalClient(client) {
    const stmt = this.db.prepare(`
      UPDATE professional_clients SET companyName = ?, siret = ?, contactName = ?, email = ?, 
                                     phone = ?, billingAddress = ?, paymentTerms = ?, specialRate = ?,
                                     totalOrders = ?, totalSpent = ?, outstandingAmount = ?
      WHERE id = ?
    `);
    stmt.run(
      client.companyName, client.siret, client.contactName, client.email,
      client.phone, client.billingAddress, client.paymentTerms, client.specialRate,
      client.totalOrders, client.totalSpent, client.outstandingAmount, client.id
    );
  }

  deleteProfessionalClient(id) {
    const stmt = this.db.prepare('DELETE FROM professional_clients WHERE id = ?');
    stmt.run(id);
  }

  // Méthodes pour les commandes professionnelles
  getAllProfessionalOrders() {
    return this.db.prepare('SELECT * FROM professional_orders ORDER BY createdAt DESC').all();
  }
  insertProfessionalOrder(order) {
    const stmt = this.db.prepare(`
      INSERT INTO professional_orders (id, clientId, clientName, pieces, service, totalAmount, status, paymentStatus, createdAt, deliveryDate, dueDate, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      order.id, order.clientId, order.clientName, order.pieces, order.service,
      order.totalAmount, order.status, order.paymentStatus, order.createdAt,
      order.deliveryDate, order.dueDate, order.priority
    );

    // Mettre à jour les statistiques du client professionnel
    if (order.clientId) {
      const updateClientStmt = this.db.prepare(`
        UPDATE professional_clients 
        SET totalOrders = totalOrders + 1, 
            totalSpent = totalSpent + ? 
        WHERE id = ?
      `);
      updateClientStmt.run(order.totalAmount, order.clientId);
      console.log('🔍 Statistiques client professionnel mises à jour:', {
        clientId: order.clientId,
        newOrderAmount: order.totalAmount
      });
    }
  }

  updateProfessionalOrder(order) {
    const stmt = this.db.prepare(`
      UPDATE professional_orders SET clientId = ?, clientName = ?, pieces = ?, service = ?,
                                     totalAmount = ?, status = ?, paymentStatus = ?, deliveryDate = ?,
                                     dueDate = ?, priority = ?
      WHERE id = ?
    `);
    stmt.run(
      order.clientId, order.clientName, order.pieces, order.service,
      order.totalAmount, order.status, order.paymentStatus, order.deliveryDate,
      order.dueDate, order.priority, order.id
    );
  }

  deleteProfessionalOrder(id) {
    const stmt = this.db.prepare('DELETE FROM professional_orders WHERE id = ?');
    stmt.run(id);
  }

  close() {
    this.db.close();
  }
}

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialiser la base de données
const db = new DatabaseManager();

// Recalculer les statistiques des clients au démarrage
db.recalculateClientStats();

// Routes pour les clients
app.get('/api/clients', (req, res) => {
  try {
    const clients = db.getAllClients();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clients', (req, res) => {  try {
    const client = {
      ...req.body,
      id: db.getNextClientId(),
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString()
    };
    db.insertClient(client);
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/clients/:id', (req, res) => {
  try {
    db.updateClient(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/clients/:id', (req, res) => {
  try {
    db.deleteClient(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes pour les pièces
app.get('/api/pieces', (req, res) => {
  try {
    const pieces = db.getAllPieces();
    res.json(pieces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pieces', (req, res) => {
  try {
    const piece = {
      ...req.body,
      id: Date.now().toString()
    };
    db.insertPiece(piece);
    res.json(piece);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/pieces/:id', (req, res) => {
  try {
    db.updatePiece(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/pieces/:id', (req, res) => {
  try {
    db.deletePiece(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes pour les commandes
app.get('/api/orders', (req, res) => {
  try {
    const orders = db.getAllOrders();
    const ordersWithPieces = orders.map(order => ({
      ...order,
      pieces: db.getOrderPieces(order.id)
    }));
    res.json(ordersWithPieces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', (req, res) => {
  try {
    const orderId = req.body.id || db.getNextOrderId();
    
    // Extraire seulement les champs nécessaires pour la table orders
    const order = {
      id: orderId,
      clientId: req.body.clientId,
      clientName: req.body.clientName,
      totalAmount: req.body.totalAmount,
      status: req.body.status,
      paymentStatus: req.body.paymentStatus,
      createdAt: req.body.createdAt || new Date().toISOString(),
      estimatedDate: req.body.estimatedDate,
      isExceptionalPrice: req.body.isExceptionalPrice || false
    };
    
    console.log('🔍 Données de la commande à insérer:', order);
    
    db.insertOrder(order);
    
    // Insérer les pièces de la commande
    if (req.body.pieces && req.body.pieces.length > 0) {
      req.body.pieces.forEach((piece, index) => {
        const orderPiece = {
          id: `${orderId}_${piece.pieceId}_${index}`,
          orderId: orderId,
          pieceId: piece.pieceId,
          pieceName: piece.pieceName,
          serviceType: piece.serviceType,
          quantity: piece.quantity,
          unitPrice: piece.unitPrice,
          totalPrice: piece.totalPrice
        };
        console.log('🔍 Pièce de commande à insérer:', orderPiece);
        db.insertOrderPiece(orderPiece);
      });
    }
    
    // Retourner la commande complète avec les pièces
    const completeOrder = {
      ...order,
      pieces: req.body.pieces || []
    };
    
    res.json(completeOrder);
  } catch (error) {
    console.error('❌ Erreur lors de la création de la commande:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id', (req, res) => {
  try {
    db.updateOrder(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/orders/:id', (req, res) => {
  try {
    db.deleteOrder(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes pour les clients professionnels
app.get('/api/professional-clients', (req, res) => {
  try {
    const clients = db.getAllProfessionalClients();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/professional-clients', (req, res) => {  try {
    const client = {
      ...req.body,
      id: db.getNextProfessionalClientId(),
      totalOrders: 0,
      totalSpent: 0,
      outstandingAmount: 0,
      createdAt: new Date().toISOString()
    };
    db.insertProfessionalClient(client);
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/professional-clients/:id', (req, res) => {
  try {
    db.updateProfessionalClient(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/professional-clients/:id', (req, res) => {
  try {
    db.deleteProfessionalClient(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes pour les commandes professionnelles
app.get('/api/professional-orders', (req, res) => {
  try {
    const orders = db.getAllProfessionalOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/professional-orders', (req, res) => {
  try {
    const order = {
      ...req.body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    db.insertProfessionalOrder(order);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/professional-orders/:id', (req, res) => {
  try {
    db.updateProfessionalOrder(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/professional-orders/:id', (req, res) => {
  try {
    db.deleteProfessionalOrder(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Serveur API SQLite démarré sur http://localhost:${port}`);
  console.log(`📁 Base de données SQLite : pressing.db`);
});
