import Database from 'better-sqlite3';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Types pour la base de données
export interface DbClient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  type: 'individual' | 'professional';
  companyName?: string;
  siret?: string;
}

export interface DbPiece {
  id: string;
  name: string;
  category: string;
  pressingPrice: number;
  cleaningPressingPrice: number;
  imageUrl: string;
  isProfessional?: boolean; // Nouveau champ pour identifier les pièces B2B
}

export interface DbOrder {
  id: string;
  clientId: string;
  clientName: string;
  totalAmount: number;
  status: 'received' | 'processing' | 'ready' | 'delivered';
  paymentStatus: 'paid' | 'pending' | 'overdue';
  createdAt: string;
  estimatedDate: string;
  isExceptionalPrice: boolean;
}

export interface DbOrderPiece {
  id: string;
  orderId: string;
  pieceId: string;
  pieceName: string;
  serviceType: 'pressing' | 'cleaning-pressing';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface DbProfessionalClient {
  id: string;
  companyName: string;
  siret: string;
  contactName: string;
  email: string;
  phone: string;
  billingAddress: string;
  paymentTerms: number;
  specialRate: number;
  totalOrders: number;
  totalSpent: number;
  outstandingAmount: number;
  createdAt: string;
}

export interface DbProfessionalOrder {
  id: string;
  clientId: string;
  clientName: string;
  pieces: number;
  selectedPieces?: Array<{pieceId: string, quantity: number}>;
  service: string;
  totalAmount: number;
  status: 'received' | 'processing' | 'ready' | 'delivered';
  paymentStatus: 'paid' | 'pending' | 'overdue';
  createdAt: string;
  deliveryDate: string;
  dueDate: string;
  priority: 'normal' | 'high';
}

class DatabaseManager {
  private db: Database.Database;

  constructor() {
    // Créer la base de données dans le dossier du projet
    const dbPath = 'pressing.db';
    this.db = new Database(dbPath);
    this.initializeTables();
    this.seedInitialData();
  }

  private initializeTables() {
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
    `);    // Table des pièces
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS pieces (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        pressingPrice REAL NOT NULL,
        cleaningPressingPrice REAL NOT NULL,
        imageUrl TEXT NOT NULL,
        isProfessional BOOLEAN DEFAULT FALSE
      )
    `);

    // Table des commandes
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        clientId TEXT NOT NULL,
        clientName TEXT NOT NULL,
        totalAmount REAL NOT NULL,
        status TEXT NOT NULL,
        paymentStatus TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        estimatedDate TEXT NOT NULL,
        isExceptionalPrice BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (clientId) REFERENCES clients (id)
      )
    `);

    // Table des pièces par commande
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

  private seedInitialData() {
    // Vérifier si les données existent déjà
    const clientCount = this.db.prepare('SELECT COUNT(*) as count FROM clients').get() as { count: number };
      if (clientCount.count === 0) {
      // Insérer les pièces
      const insertPiece = this.db.prepare(`
        INSERT INTO pieces (id, name, category, pressingPrice, cleaningPressingPrice, imageUrl, isProfessional)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const pieces = [
        ['P001', 'Chemise', 'vetement', 3.50, 8.00, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop&crop=center', 0],
        ['P002', 'Pantalon', 'vetement', 4.00, 9.50, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=300&h=300&fit=crop&crop=center', 0],
        ['P003', 'Veste', 'vetement', 6.50, 15.00, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop&crop=center', 0],
        ['P004', 'Robe', 'vetement', 5.00, 12.00, 'https://images.unsplash.com/photo-1566479179817-0b9e588a2c88?w=300&h=300&fit=crop&crop=center', 0],
        ['P005', 'Manteau', 'vetement', 8.00, 18.00, 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop&crop=center', 0],
        ['P006', 'Costume', 'vetement', 12.00, 25.00, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center', 0],
        ['P007', 'Nappe', 'linge', 3.00, 7.50, 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=300&fit=crop&crop=center', 0],
        ['P008', 'Cravate', 'accessoire', 2.50, 6.00, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center', 0],
        ['P009', 'Jupe', 'vetement', 3.50, 8.00, 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=300&h=300&fit=crop&crop=center', 0],
        ['P010', 'Pull/Tricot', 'vetement', 4.50, 9.50, 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=300&h=300&fit=crop&crop=center', 0],
        ['P011', 'Housse de couette', 'linge', 6.00, 10.00, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&h=300&fit=crop&crop=center', 0],
        ['P012', 'Costume (complet)', 'vetement', 15.00, 30.00, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop&crop=center', 0],
        ['P013', 'Rideau', 'linge', 8.00, 12.00, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&crop=center', 0],
        ['P014', 'Foulard', 'accessoire', 3.00, 6.00, 'https://images.unsplash.com/photo-1609709295948-17d77cb2a69e?w=300&h=300&fit=crop&crop=center', 0]
      ];

      pieces.forEach(piece => {
        insertPiece.run(...piece);
      });

      // Insérer les clients de test
      const insertClient = this.db.prepare(`
        INSERT INTO clients (id, firstName, lastName, phone, email, address, createdAt, totalOrders, totalSpent, type, companyName, siret)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const clients = [
        ['CLI001', 'Marie', 'Dubois', '06 12 34 56 78', 'marie.dubois@email.com', '123 Rue de la Paix, 75001 Paris', '2024-01-15', 24, 456.80, 'individual', null, null],
        ['CLI002', 'Pierre', 'Martin', '06 98 76 54 32', 'pierre.martin@email.com', '456 Avenue des Champs, 75008 Paris', '2024-02-20', 12, 234.50, 'individual', null, null],
        ['PRO001', 'Jean', 'Directeur', '01 23 45 67 89', 'contact@hotelroyal.com', '789 Boulevard Haussmann, 75009 Paris', '2024-01-10', 156, 12456.00, 'professional', 'Hotel Royal', '12345678901234']
      ];

      clients.forEach(client => {
        insertClient.run(...client);
      });

      // Insérer les clients professionnels
      const insertProfClient = this.db.prepare(`
        INSERT INTO professional_clients (id, companyName, siret, contactName, email, phone, billingAddress, paymentTerms, specialRate, totalOrders, totalSpent, outstandingAmount, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const profClients = [
        ['PRO001', 'Hotel Royal', '12345678901234', 'Jean Directeur', 'contact@hotelroyal.com', '01 23 45 67 89', '789 Boulevard Haussmann, 75009 Paris', 30, 15, 156, 12456.00, 1234.50, '2024-01-10'],
        ['PRO002', 'Restaurant Le Gourmet', '98765432109876', 'Marie Chef', 'contact@legourmet.fr', '01 98 76 54 32', '456 Rue de la Gastronomie, 75007 Paris', 15, 10, 89, 5632.00, 0, '2024-02-15']
      ];

      profClients.forEach(client => {
        insertProfClient.run(...client);
      });

      console.log('Base de données initialisée avec les données de test');
    }
  }

  // Méthodes pour les pièces
  getAllPieces(): DbPiece[] {
    return this.db.prepare('SELECT * FROM pieces ORDER BY name').all() as DbPiece[];
  }

  getPieceById(id: string): DbPiece | undefined {
    return this.db.prepare('SELECT * FROM pieces WHERE id = ?').get(id) as DbPiece | undefined;
  }
  insertPiece(piece: DbPiece): void {
    const stmt = this.db.prepare(`
      INSERT INTO pieces (id, name, category, pressingPrice, cleaningPressingPrice, imageUrl, isProfessional)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(piece.id, piece.name, piece.category, piece.pressingPrice, piece.cleaningPressingPrice, piece.imageUrl, piece.isProfessional ? 1 : 0);
  }
  updatePiece(piece: DbPiece): void {
    const stmt = this.db.prepare(`
      UPDATE pieces SET name = ?, category = ?, pressingPrice = ?, cleaningPressingPrice = ?, imageUrl = ?, isProfessional = ?
      WHERE id = ?
    `);
    stmt.run(piece.name, piece.category, piece.pressingPrice, piece.cleaningPressingPrice, piece.imageUrl, piece.isProfessional ? 1 : 0, piece.id);
  }

  deletePiece(id: string): void {
    const stmt = this.db.prepare('DELETE FROM pieces WHERE id = ?');
    stmt.run(id);
  }

  // Méthodes pour les clients
  getAllClients(): DbClient[] {
    return this.db.prepare('SELECT * FROM clients ORDER BY createdAt DESC').all() as DbClient[];
  }

  getClientById(id: string): DbClient | undefined {
    return this.db.prepare('SELECT * FROM clients WHERE id = ?').get(id) as DbClient | undefined;
  }

  insertClient(client: Omit<DbClient, 'totalOrders' | 'totalSpent'>): void {
    const stmt = this.db.prepare(`
      INSERT INTO clients (id, firstName, lastName, phone, email, address, createdAt, type, companyName, siret)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      client.id, client.firstName, client.lastName, client.phone, 
      client.email, client.address, client.createdAt, client.type,
      client.companyName || null, client.siret || null
    );
  }

  updateClient(client: DbClient): void {
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

  deleteClient(id: string): void {
    const stmt = this.db.prepare('DELETE FROM clients WHERE id = ?');
    stmt.run(id);
  }

  // Méthodes pour les commandes
  getAllOrders(): DbOrder[] {
    return this.db.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all() as DbOrder[];
  }

  insertOrder(order: DbOrder): void {
    const stmt = this.db.prepare(`
      INSERT INTO orders (id, clientId, clientName, totalAmount, status, paymentStatus, createdAt, estimatedDate, isExceptionalPrice)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      order.id, order.clientId, order.clientName, order.totalAmount,
      order.status, order.paymentStatus, order.createdAt, order.estimatedDate,
      order.isExceptionalPrice
    );
  }

  insertOrderPiece(orderPiece: DbOrderPiece): void {
    const stmt = this.db.prepare(`
      INSERT INTO order_pieces (id, orderId, pieceId, pieceName, serviceType, quantity, unitPrice, totalPrice)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      orderPiece.id, orderPiece.orderId, orderPiece.pieceId, orderPiece.pieceName,
      orderPiece.serviceType, orderPiece.quantity, orderPiece.unitPrice, orderPiece.totalPrice
    );
  }

  getOrderPieces(orderId: string): DbOrderPiece[] {
    return this.db.prepare('SELECT * FROM order_pieces WHERE orderId = ?').all(orderId) as DbOrderPiece[];
  }

  // Méthodes pour les clients professionnels
  getAllProfessionalClients(): DbProfessionalClient[] {
    return this.db.prepare('SELECT * FROM professional_clients ORDER BY createdAt DESC').all() as DbProfessionalClient[];
  }

  insertProfessionalClient(client: Omit<DbProfessionalClient, 'totalOrders' | 'totalSpent' | 'outstandingAmount'>): void {
    const stmt = this.db.prepare(`
      INSERT INTO professional_clients (id, companyName, siret, contactName, email, phone, billingAddress, paymentTerms, specialRate, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      client.id, client.companyName, client.siret, client.contactName,
      client.email, client.phone, client.billingAddress, client.paymentTerms,
      client.specialRate, client.createdAt
    );
  }

  updateProfessionalClient(client: DbProfessionalClient): void {
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

  deleteProfessionalClient(id: string): void {
    const stmt = this.db.prepare('DELETE FROM professional_clients WHERE id = ?');
    stmt.run(id);
  }

  // Méthodes pour les commandes professionnelles
  getAllProfessionalOrders(): DbProfessionalOrder[] {
    return this.db.prepare('SELECT * FROM professional_orders ORDER BY createdAt DESC').all() as DbProfessionalOrder[];
  }

  insertProfessionalOrder(order: DbProfessionalOrder): void {
    const stmt = this.db.prepare(`
      INSERT INTO professional_orders (id, clientId, clientName, pieces, service, totalAmount, status, paymentStatus, createdAt, deliveryDate, dueDate, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      order.id, order.clientId, order.clientName, order.pieces, order.service,
      order.totalAmount, order.status, order.paymentStatus, order.createdAt,
      order.deliveryDate, order.dueDate, order.priority
    );
  }

  updateProfessionalOrder(order: DbProfessionalOrder): void {
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
  deleteProfessionalOrder(id: string): void {
    const stmt = this.db.prepare('DELETE FROM professional_orders WHERE id = ?');
    stmt.run(id);
  }

  // Méthodes pour les commandes
  updateOrder(order: DbOrder): void {
    const stmt = this.db.prepare(`
      UPDATE orders SET clientId = ?, clientName = ?, totalAmount = ?, status = ?,
                        paymentStatus = ?, estimatedDate = ?, isExceptionalPrice = ?
      WHERE id = ?
    `);
    stmt.run(
      order.clientId, order.clientName, order.totalAmount, order.status,
      order.paymentStatus, order.estimatedDate, order.isExceptionalPrice, order.id
    );
  }

  deleteOrder(id: string): void {
    const stmt = this.db.prepare('DELETE FROM orders WHERE id = ?');
    stmt.run(id);
  }

  // Fermeture de la base de données
  close(): void {
    this.db.close();
  }
}

// Instance singleton
let dbInstance: DatabaseManager | null = null;

export const getDatabase = (): DatabaseManager => {
  if (!dbInstance) {
    dbInstance = new DatabaseManager();
  }
  return dbInstance;
};

export default DatabaseManager;
