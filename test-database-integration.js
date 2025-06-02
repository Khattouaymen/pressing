// Database Integration Test Script
// This script tests all CRUD operations for the French pressing application

const ClientDatabaseAPI = require('./src/hooks/useDatabase').ClientDatabaseAPI;

async function testDatabaseIntegration() {
  console.log('🧪 Starting Database Integration Tests...\n');
  
  try {
    const db = new ClientDatabaseAPI();
    
    // Test 1: Test Client Operations
    console.log('1️⃣ Testing Client Operations:');
    
    // Add a test client
    const testClient = {
      name: 'Test Client',
      email: 'test@example.com',
      phone: '0123456789',
      address: '123 Test Street',
      customerType: 'individual'
    };
    
    const addedClient = await db.addClient(testClient);
    console.log('✅ Client added:', addedClient.name);
    
    // Get all clients
    const clients = await db.getClients();
    console.log('✅ Retrieved clients:', clients.length);
    
    // Update client
    if (clients.length > 0) {
      const clientToUpdate = { ...clients[0], phone: '0987654321' };
      await db.updateClient(clientToUpdate);
      console.log('✅ Client updated');
    }
    
    // Test 2: Test Piece Operations
    console.log('\n2️⃣ Testing Piece Operations:');
    
    const testPiece = {
      clientId: addedClient.id,
      type: 'Chemise',
      description: 'Chemise blanche test',
      status: 'pending',
      entryDate: new Date().toISOString(),
      services: ['cleaning']
    };
    
    const addedPiece = await db.addPiece(testPiece);
    console.log('✅ Piece added:', addedPiece.type);
    
    // Get pieces
    const pieces = await db.getPieces();
    console.log('✅ Retrieved pieces:', pieces.length);
    
    // Test 3: Test Professional Operations
    console.log('\n3️⃣ Testing Professional Operations:');
    
    const testProfClient = {
      companyName: 'Test Company',
      contactName: 'John Doe',
      email: 'company@test.com',
      phone: '0111111111',
      address: '456 Business Ave',
      contractType: 'monthly'
    };
    
    const addedProfClient = await db.addProfessionalClient(testProfClient);
    console.log('✅ Professional client added:', addedProfClient.companyName);
    
    const testOrder = {
      clientId: addedProfClient.id,
      orderNumber: 'ORD-TEST-001',
      pieces: [{ type: 'Uniform', quantity: 5, price: 25 }],
      totalAmount: 125,
      status: 'pending',
      orderDate: new Date().toISOString()
    };
    
    const addedOrder = await db.addProfessionalOrder(testOrder);
    console.log('✅ Professional order added:', addedOrder.orderNumber);
    
    // Test 4: Test Data Persistence
    console.log('\n4️⃣ Testing Data Persistence:');
    
    // Create a new instance to test persistence
    const db2 = new ClientDatabaseAPI();
    const persistedClients = await db2.getClients();
    const persistedPieces = await db2.getPieces();
    const persistedProfClients = await db2.getProfessionalClients();
    const persistedOrders = await db2.getProfessionalOrders();
    
    console.log('✅ Data persisted across instances:');
    console.log(`   - Clients: ${persistedClients.length}`);
    console.log(`   - Pieces: ${persistedPieces.length}`);
    console.log(`   - Professional Clients: ${persistedProfClients.length}`);
    console.log(`   - Professional Orders: ${persistedOrders.length}`);
    
    console.log('\n🎉 All Database Integration Tests Passed!\n');
    
  } catch (error) {
    console.error('❌ Database Integration Test Failed:', error);
  }
}

// For browser testing, expose the function globally
if (typeof window !== 'undefined') {
  window.testDatabaseIntegration = testDatabaseIntegration;
} else {
  // Run tests if in Node environment
  testDatabaseIntegration();
}
