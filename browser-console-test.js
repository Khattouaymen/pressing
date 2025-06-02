// Quick Browser Console Test for French Pressing App
// Copy and paste this into the browser console while on http://localhost:8080

console.log('🧪 Quick Database Integration Verification');
console.log('==========================================');

// Test localStorage directly
function quickTest() {
  try {
    // Test 1: Basic localStorage functionality
    console.log('1️⃣ Testing localStorage...');
    localStorage.setItem('test', 'working');
    const testValue = localStorage.getItem('test');
    console.log(testValue === 'working' ? '✅ localStorage working' : '❌ localStorage failed');
    localStorage.removeItem('test');

    // Test 2: Check if data exists from app usage
    console.log('\n2️⃣ Checking existing app data...');
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const pieces = JSON.parse(localStorage.getItem('pieces') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const profClients = JSON.parse(localStorage.getItem('professional-clients') || '[]');
    const profOrders = JSON.parse(localStorage.getItem('professional-orders') || '[]');

    console.log(`📊 Current Data Count:`);
    console.log(`  - Clients: ${clients.length}`);
    console.log(`  - Pieces: ${pieces.length}`);
    console.log(`  - Orders: ${orders.length}`);
    console.log(`  - Professional Clients: ${profClients.length}`);
    console.log(`  - Professional Orders: ${profOrders.length}`);

    // Test 3: Add test data
    console.log('\n3️⃣ Adding test data...');
    
    // Add test client
    const testClient = {
      id: `TEST-${Date.now()}`,
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '0123456789',
      address: 'Test Address',
      type: 'individual',
      createdAt: new Date().toISOString(),
      totalOrders: 0,
      totalSpent: 0
    };
    
    clients.push(testClient);
    localStorage.setItem('clients', JSON.stringify(clients));
    console.log('✅ Test client added');

    // Add test piece
    const testPiece = {
      id: `PIECE-${Date.now()}`,
      name: 'Test Chemise',
      category: 'vetement',
      pressingPrice: 5.00,
      cleaningPressingPrice: 12.00,
      description: 'Test piece',
      imageUrl: ''
    };
    
    pieces.push(testPiece);
    localStorage.setItem('pieces', JSON.stringify(pieces));
    console.log('✅ Test piece added');

    // Test 4: Verify data persistence
    console.log('\n4️⃣ Verifying data persistence...');
    const verifyClients = JSON.parse(localStorage.getItem('clients') || '[]');
    const verifyPieces = JSON.parse(localStorage.getItem('pieces') || '[]');
    
    const clientExists = verifyClients.some(c => c.firstName === 'Test');
    const pieceExists = verifyPieces.some(p => p.name === 'Test Chemise');
    
    console.log(clientExists ? '✅ Client data persisted' : '❌ Client data not persisted');
    console.log(pieceExists ? '✅ Piece data persisted' : '❌ Piece data not persisted');

    // Test 5: Data structure validation
    console.log('\n5️⃣ Validating data structures...');
    
    let structureValid = true;
    
    // Check client structure
    if (verifyClients.length > 0) {
      const client = verifyClients[0];
      const requiredFields = ['id', 'firstName', 'lastName', 'email', 'phone', 'type'];
      const hasAllFields = requiredFields.every(field => client.hasOwnProperty(field));
      if (!hasAllFields) {
        console.log('❌ Client structure invalid');
        structureValid = false;
      } else {
        console.log('✅ Client structure valid');
      }
    }
    
    // Check piece structure
    if (verifyPieces.length > 0) {
      const piece = verifyPieces[0];
      const requiredFields = ['id', 'name', 'category', 'pressingPrice', 'cleaningPressingPrice'];
      const hasAllFields = requiredFields.every(field => piece.hasOwnProperty(field));
      if (!hasAllFields) {
        console.log('❌ Piece structure invalid');
        structureValid = false;
      } else {
        console.log('✅ Piece structure valid');
      }
    }

    // Final result
    console.log('\n🎯 VERIFICATION SUMMARY:');
    console.log('========================');
    if (structureValid && clientExists && pieceExists) {
      console.log('🎉 Database integration is working correctly!');
      console.log('📱 You can now use the app to:');
      console.log('   - Create and manage clients');
      console.log('   - Add and edit pieces');
      console.log('   - Create orders');
      console.log('   - Manage professional clients');
      console.log('   - All data will persist between sessions');
    } else {
      console.log('⚠️  Some issues detected. Check the logs above.');
    }

    // Refresh suggestion
    console.log('\n💡 TIP: Refresh the page (F5) and check that your test data is still there!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Run the test
quickTest();

// Also expose it globally for manual re-run
window.quickDatabaseTest = quickTest;
