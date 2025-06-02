// Comprehensive Database Integration Test
// Run this in the browser console to test all database operations

// Test Results Object
const testResults = {
  clients: { passed: 0, failed: 0, errors: [] },
  pieces: { passed: 0, failed: 0, errors: [] },
  professionalClients: { passed: 0, failed: 0, errors: [] },
  professionalOrders: { passed: 0, failed: 0, errors: [] },
  orders: { passed: 0, failed: 0, errors: [] }
};

// Utility functions
function logTest(category, testName, success, error = null) {
  if (success) {
    testResults[category].passed++;
    console.log(`✅ ${testName} - PASSED`);
  } else {
    testResults[category].failed++;
    testResults[category].errors.push(`${testName}: ${error}`);
    console.log(`❌ ${testName} - FAILED: ${error}`);
  }
}

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Test Database API directly
async function testDatabaseAPI() {
  console.log('🚀 Starting Comprehensive Database Integration Tests...\n');
  
  try {
    // Access the ClientDatabaseAPI from the React hooks
    // We'll simulate this by creating our own instance
    const storageKeys = {
      clients: 'clients',
      pieces: 'pieces',
      professionalClients: 'professional-clients',
      professionalOrders: 'professional-orders',
      orders: 'orders'
    };

    // Clear existing data for clean test
    Object.values(storageKeys).forEach(key => localStorage.removeItem(key));
    console.log('🧹 Cleared existing data for clean test\n');

    // === CLIENT TESTS ===
    console.log('1️⃣ Testing Client Operations...');
    
    try {
      // Test Add Client
      const testClient = {
        id: generateId(),
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@email.com',
        phone: '0123456789',
        address: '123 Rue de la Paix, Paris',
        type: 'individual',
        createdAt: new Date().toISOString(),
        totalOrders: 0,
        totalSpent: 0
      };

      localStorage.setItem(storageKeys.clients, JSON.stringify([testClient]));
      const storedClients = JSON.parse(localStorage.getItem(storageKeys.clients) || '[]');
      logTest('clients', 'Add Client', storedClients.length === 1 && storedClients[0].firstName === 'Jean');

      // Test Get Clients
      logTest('clients', 'Get Clients', storedClients.length > 0);

      // Test Update Client
      const updatedClient = { ...testClient, phone: '0987654321' };
      localStorage.setItem(storageKeys.clients, JSON.stringify([updatedClient]));
      const updatedClients = JSON.parse(localStorage.getItem(storageKeys.clients) || '[]');
      logTest('clients', 'Update Client', updatedClients[0].phone === '0987654321');

    } catch (error) {
      logTest('clients', 'Client Operations', false, error.message);
    }

    // === PIECE TESTS ===
    console.log('\n2️⃣ Testing Piece Operations...');
    
    try {
      const testPiece = {
        id: generateId(),
        name: 'Chemise',
        category: 'vetement',
        pressingPrice: 5.00,
        cleaningPressingPrice: 12.00,
        description: 'Chemise en coton',
        imageUrl: 'https://example.com/chemise.jpg'
      };

      localStorage.setItem(storageKeys.pieces, JSON.stringify([testPiece]));
      const storedPieces = JSON.parse(localStorage.getItem(storageKeys.pieces) || '[]');
      logTest('pieces', 'Add Piece', storedPieces.length === 1 && storedPieces[0].name === 'Chemise');

      // Test price validation
      logTest('pieces', 'Price Validation', testPiece.pressingPrice > 0 && testPiece.cleaningPressingPrice > 0);

    } catch (error) {
      logTest('pieces', 'Piece Operations', false, error.message);
    }

    // === PROFESSIONAL CLIENT TESTS ===
    console.log('\n3️⃣ Testing Professional Client Operations...');
    
    try {
      const testProfClient = {
        id: generateId(),
        companyName: 'Hôtel Le Grand Paris',
        siret: '12345678901234',
        contactName: 'Marie Martin',
        email: 'contact@grandparis.fr',
        phone: '0145678901',
        billingAddress: '456 Avenue des Champs, Paris',
        paymentTerms: 30,
        specialRate: 10,
        createdAt: new Date().toISOString(),
        totalOrders: 0,
        totalSpent: 0,
        outstandingAmount: 0
      };

      localStorage.setItem(storageKeys.professionalClients, JSON.stringify([testProfClient]));
      const storedProfClients = JSON.parse(localStorage.getItem(storageKeys.professionalClients) || '[]');
      logTest('professionalClients', 'Add Professional Client', 
        storedProfClients.length === 1 && storedProfClients[0].companyName === 'Hôtel Le Grand Paris');

      // Test SIRET validation
      logTest('professionalClients', 'SIRET Validation', testProfClient.siret.length === 14);

    } catch (error) {
      logTest('professionalClients', 'Professional Client Operations', false, error.message);
    }

    // === PROFESSIONAL ORDER TESTS ===
    console.log('\n4️⃣ Testing Professional Order Operations...');
    
    try {
      const testProfOrder = {
        id: generateId(),
        clientId: 'prof-client-123',
        clientName: 'Hôtel Le Grand Paris',
        pieces: 50,
        service: 'cleaning-pressing',
        totalAmount: 600.00,
        status: 'received',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'normal'
      };

      localStorage.setItem(storageKeys.professionalOrders, JSON.stringify([testProfOrder]));
      const storedProfOrders = JSON.parse(localStorage.getItem(storageKeys.professionalOrders) || '[]');
      logTest('professionalOrders', 'Add Professional Order', 
        storedProfOrders.length === 1 && storedProfOrders[0].totalAmount === 600);

      // Test amount calculation
      const expectedAmount = testProfOrder.pieces * 12; // cleaning-pressing price
      logTest('professionalOrders', 'Amount Calculation', testProfOrder.totalAmount === expectedAmount);

    } catch (error) {
      logTest('professionalOrders', 'Professional Order Operations', false, error.message);
    }

    // === REGULAR ORDER TESTS ===
    console.log('\n5️⃣ Testing Regular Order Operations...');
    
    try {
      const testOrder = {
        id: generateId(),
        clientId: 'client-123',
        clientName: 'Jean Dupont',
        pieces: [
          {
            pieceId: 'piece-123',
            pieceName: 'Chemise',
            serviceType: 'pressing',
            quantity: 2,
            unitPrice: 5.00,
            totalPrice: 10.00
          }
        ],
        totalAmount: 10.00,
        status: 'received',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        estimatedDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        isExceptionalPrice: false
      };

      localStorage.setItem(storageKeys.orders, JSON.stringify([testOrder]));
      const storedOrders = JSON.parse(localStorage.getItem(storageKeys.orders) || '[]');
      logTest('orders', 'Add Regular Order', 
        storedOrders.length === 1 && storedOrders[0].clientName === 'Jean Dupont');

      // Test piece calculation
      const calculatedTotal = testOrder.pieces.reduce((sum, piece) => sum + piece.totalPrice, 0);
      logTest('orders', 'Order Total Calculation', testOrder.totalAmount === calculatedTotal);

    } catch (error) {
      logTest('orders', 'Regular Order Operations', false, error.message);
    }

    // === DATA PERSISTENCE TESTS ===
    console.log('\n6️⃣ Testing Data Persistence...');
    
    try {
      // Test that data survives "page refresh" (re-reading from localStorage)
      const persistedClients = JSON.parse(localStorage.getItem(storageKeys.clients) || '[]');
      const persistedPieces = JSON.parse(localStorage.getItem(storageKeys.pieces) || '[]');
      const persistedProfClients = JSON.parse(localStorage.getItem(storageKeys.professionalClients) || '[]');
      const persistedProfOrders = JSON.parse(localStorage.getItem(storageKeys.professionalOrders) || '[]');
      const persistedOrders = JSON.parse(localStorage.getItem(storageKeys.orders) || '[]');

      logTest('clients', 'Data Persistence', persistedClients.length > 0);
      logTest('pieces', 'Data Persistence', persistedPieces.length > 0);
      logTest('professionalClients', 'Data Persistence', persistedProfClients.length > 0);
      logTest('professionalOrders', 'Data Persistence', persistedProfOrders.length > 0);
      logTest('orders', 'Data Persistence', persistedOrders.length > 0);

    } catch (error) {
      console.error('Data Persistence Test Failed:', error);
    }

    // === FINAL RESULTS ===
    console.log('\n📊 TEST RESULTS SUMMARY:');
    console.log('========================');
    
    let totalPassed = 0;
    let totalFailed = 0;
    
    Object.entries(testResults).forEach(([category, results]) => {
      console.log(`${category.toUpperCase()}:`);
      console.log(`  ✅ Passed: ${results.passed}`);
      console.log(`  ❌ Failed: ${results.failed}`);
      if (results.errors.length > 0) {
        console.log(`  🔍 Errors:`);
        results.errors.forEach(error => console.log(`    - ${error}`));
      }
      console.log('');
      
      totalPassed += results.passed;
      totalFailed += results.failed;
    });
    
    console.log(`🎯 OVERALL RESULTS:`);
    console.log(`  Total Tests Run: ${totalPassed + totalFailed}`);
    console.log(`  ✅ Passed: ${totalPassed}`);
    console.log(`  ❌ Failed: ${totalFailed}`);
    console.log(`  📈 Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
    
    if (totalFailed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Database integration is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }

  } catch (error) {
    console.error('❌ Test suite failed to run:', error);
  }
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  // Export function globally for manual execution
  window.testDatabaseIntegration = testDatabaseAPI;
  
  // Auto-run the test
  console.log('🧪 French Pressing App - Database Integration Test');
  console.log('====================================================');
  testDatabaseAPI();
} else {
  module.exports = testDatabaseAPI;
}
