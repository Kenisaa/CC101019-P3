const admin = require('firebase-admin');
const path = require('path');

// Cargar credenciales
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

async function clearUsers() {
  try {
    console.log('🗑️  Eliminando usuarios...');
    
    // Obtener todos los usuarios
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('✅ No hay usuarios para eliminar');
      process.exit(0);
    }
    
    console.log(`📊 Encontrados ${usersSnapshot.size} usuarios`);
    
    // Eliminar en lotes
    const batch = db.batch();
    usersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('✅ Usuarios eliminados exitosamente');
    
    // También limpiar OTPs
    console.log('🗑️  Eliminando OTPs...');
    const otpsSnapshot = await db.collection('otps').get();
    
    if (!otpsSnapshot.empty) {
      const otpBatch = db.batch();
      otpsSnapshot.docs.forEach(doc => {
        otpBatch.delete(doc.ref);
      });
      await otpBatch.commit();
      console.log('✅ OTPs eliminados exitosamente');
    }
    
    console.log('🎉 Base de datos limpiada completamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearUsers();
