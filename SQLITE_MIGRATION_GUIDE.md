# 🗄️ Migration SQLite - Guide Complet

## 📍 **Localisation de la Base de Données**

Votre application utilise maintenant une **vraie base de données SQLite** !

### 📁 **Fichier de Base de Données**
- **Localisation** : `pressing.db` dans le répertoire racine du projet
- **Format** : Fichier SQLite binaire
- **Taille** : ~12 KB (avec données de test)
- **Persistence** : Stockage permanent sur le disque

### 🏗️ **Architecture**

```
Frontend (React)          Backend (Express)          Database
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  http://localhost:8081  │  http://localhost:3001  │  pressing.db    │
│                         │                         │                 │
│  Components             │  API Routes             │  SQLite Tables  │
│  ├─ ProfessionalDashboard│  ├─ /api/clients       │  ├─ clients     │
│  ├─ ClientManagement    │  ├─ /api/pieces        │  ├─ pieces      │
│  ├─ PieceManagement     │  ├─ /api/orders        │  ├─ orders      │
│  └─ OrderManagement     │  ├─ /api/professional- │  ├─ order_pieces│
│                         │  │   clients           │  ├─ professional│
│  Hooks (useApiDatabase) │  └─ /api/professional- │  │   _clients   │
│  ├─ useClients()        │      orders             │  └─ professional│
│  ├─ usePieces()         │                         │      _orders    │
│  ├─ useOrders()         │  Database Manager       │                 │
│  ├─ useProfessionalClients()│  (better-sqlite3)   │  Données        │
│  └─ useProfessionalOrders() │                      │  ├─ 8 pièces    │
└─────────────────┘       └─────────────────┘       │  ├─ 2 clients   │
                                                    │  │   professionnels│
                                                    │  └─ Relations   │
                                                    │      avec clés  │
                                                    │      étrangères │
                                                    └─────────────────┘
```

## 🚀 **Démarrage de l'Application**

### **Option 1 : Démarrage Complet (Recommandé)**
```powershell
npm run dev:full
```
- Lance le serveur SQLite (port 3001) ET l'application React (port 8080/8081)
- Tout fonctionne automatiquement

### **Option 2 : Démarrage Séparé**
```powershell
# Terminal 1 - Serveur SQLite
npm run server

# Terminal 2 - Application React
npm run dev
```

## 🔧 **Scripts Disponibles**

```json
{
  "server": "node server.js",                    // Serveur SQLite seul
  "dev": "vite",                                // Frontend seul
  "dev:full": "concurrently \"npm run server\" \"npm run dev\"" // Tout ensemble
}
```

## 📊 **Structure de la Base de Données**

### **Tables Créées**

1. **`clients`** - Clients particuliers
   - id, firstName, lastName, phone, email, address
   - type, companyName, siret, totalOrders, totalSpent, createdAt

2. **`pieces`** - Catalogue des pièces
   - id, name, category, pressingPrice, cleaningPressingPrice, imageUrl

3. **`orders`** - Commandes particulières
   - id, clientId, clientName, totalAmount, status, paymentStatus
   - createdAt, estimatedDate, isExceptionalPrice

4. **`order_pieces`** - Détails des commandes
   - id, orderId, pieceId, pieceName, serviceType, quantity, unitPrice, totalPrice

5. **`professional_clients`** - Clients professionnels
   - id, companyName, siret, contactName, email, phone, billingAddress
   - paymentTerms, specialRate, totalOrders, totalSpent, outstandingAmount, createdAt

6. **`professional_orders`** - Commandes professionnelles
   - id, clientId, clientName, pieces, service, totalAmount, status
   - paymentStatus, createdAt, deliveryDate, dueDate, priority

### **Données de Test Incluses**
- ✅ 8 pièces (chemise, pantalon, veste, robe, manteau, costume, nappe, cravate)
- ✅ 2 clients professionnels (Hotel Royal, Restaurant Le Gourmet)
- ✅ Relations avec clés étrangères
- ✅ Contraintes d'intégrité

## 🔗 **API Endpoints**

### **Clients Particuliers**
- `GET /api/clients` - Liste tous les clients
- `POST /api/clients` - Crée un nouveau client
- `PUT /api/clients/:id` - Met à jour un client
- `DELETE /api/clients/:id` - Supprime un client

### **Pièces**
- `GET /api/pieces` - Liste toutes les pièces
- `POST /api/pieces` - Crée une nouvelle pièce
- `PUT /api/pieces/:id` - Met à jour une pièce
- `DELETE /api/pieces/:id` - Supprime une pièce

### **Commandes**
- `GET /api/orders` - Liste toutes les commandes
- `POST /api/orders` - Crée une nouvelle commande
- `PUT /api/orders/:id` - Met à jour une commande
- `DELETE /api/orders/:id` - Supprime une commande

### **Clients Professionnels**
- `GET /api/professional-clients` - Liste tous les clients pro
- `POST /api/professional-clients` - Crée un nouveau client pro
- `PUT /api/professional-clients/:id` - Met à jour un client pro
- `DELETE /api/professional-clients/:id` - Supprime un client pro

### **Commandes Professionnelles**
- `GET /api/professional-orders` - Liste toutes les commandes pro
- `POST /api/professional-orders` - Crée une nouvelle commande pro
- `PUT /api/professional-orders/:id` - Met à jour une commande pro
- `DELETE /api/professional-orders/:id` - Supprime une commande pro

## 🛠️ **Gestion de la Base de Données**

### **Visualiser les Données**
```powershell
# Installer sqlite3 (si pas déjà fait)
# Puis ouvrir la base
sqlite3 pressing.db

# Commandes SQLite utiles
.tables                    # Liste les tables
.schema clients           # Voir la structure d'une table
SELECT * FROM pieces;     # Voir toutes les pièces
SELECT * FROM professional_clients; # Voir les clients pro
```

### **Sauvegarder la Base**
```powershell
# Copier le fichier
Copy-Item pressing.db pressing_backup.db

# Ou export SQL
sqlite3 pressing.db .dump > pressing_backup.sql
```

### **Restaurer la Base**
```powershell
# Depuis une copie
Copy-Item pressing_backup.db pressing.db

# Depuis un export SQL
Remove-Item pressing.db
sqlite3 pressing.db < pressing_backup.sql
```

## 🔄 **Migration des Données**

Si vous aviez des données dans localStorage, elles ne sont plus utilisées. 
La base SQLite contient maintenant :
- ✅ Toutes les données de test
- ✅ Structure complète des tables
- ✅ Relations et contraintes
- ✅ API fonctionnelle

## ✅ **Avantages de SQLite**

1. **Persistance Réelle** : Les données survivent aux redémarrages du système
2. **Performance** : Requêtes SQL optimisées
3. **Intégrité** : Contraintes et relations entre tables
4. **Évolutivité** : Facile à migrer vers PostgreSQL/MySQL plus tard
5. **Sauvegarde** : Un seul fichier à sauvegarder
6. **Multi-utilisateur** : Peut être partagé entre plusieurs instances

## 🎯 **URLs de l'Application**

- **Frontend** : http://localhost:8080 ou http://localhost:8081
- **API Backend** : http://localhost:3001/api
- **Test API** : http://localhost:3001/api/pieces (voir les pièces)

## 📝 **Prochaines Étapes**

1. ✅ Migration SQLite terminée
2. ⚡ Tester toutes les fonctionnalités dans l'application
3. 🔄 Créer des sauvegardes régulières
4. 📈 Optimiser les requêtes si nécessaire
5. 🚀 Déployer en production avec SQLite ou migrer vers PostgreSQL
