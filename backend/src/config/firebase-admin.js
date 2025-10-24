const admin = require('firebase-admin');
const path = require('path');

// Ruta al archivo de credenciales
const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = require(serviceAccountPath);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    
    console.log('✅ Firebase Admin inicializado correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar Firebase Admin:', error.message);
    console.log('💡 Asegúrate de que el archivo serviceAccountKey.json existe en:', serviceAccountPath);
  }
}

const db = admin.firestore();

module.exports = { admin, db };
