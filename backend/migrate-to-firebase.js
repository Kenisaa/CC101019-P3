require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { db } = require('./src/config/firebase-admin');

async function migrateData() {
  console.log('🔄 Iniciando migración de JSON a Firebase...\n');
  
  try {
    // Leer datos existentes de JSON
    const usersPath = path.join(__dirname, 'data', 'users.json');
    const otpsPath = path.join(__dirname, 'data', 'otps.json');
    
    if (!fs.existsSync(usersPath)) {
      console.log('❌ No se encontró el archivo users.json');
      return;
    }
    
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    console.log(`📊 Encontrados ${users.length} usuarios para migrar`);
    
    // Migrar usuarios
    console.log('\n👥 Migrando usuarios...');
    for (const user of users) {
      try {
        const userRef = db.collection('users').doc(user.id);
        await userRef.set({
          name: user.name,
          email: user.email,
          phone: user.phone,
          password: user.password,
          verified: user.verified,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date()
        });
        console.log(`✅ Usuario migrado: ${user.name} (${user.email})`);
      } catch (error) {
        console.log(`❌ Error migrando usuario ${user.name}:`, error.message);
      }
    }
    
    // Migrar OTPs si existen
    if (fs.existsSync(otpsPath)) {
      const otps = JSON.parse(fs.readFileSync(otpsPath, 'utf8'));
      console.log(`\n🔐 Encontrados ${otps.length} OTPs para migrar`);
      
      for (const otp of otps) {
        try {
          const otpRef = db.collection('otps').doc(otp.id);
          await otpRef.set({
            identifier: otp.identifier,
            code: otp.code,
            used: otp.used,
            createdAt: new Date(otp.createdAt),
            expiresAt: new Date(otp.expiresAt)
          });
          console.log(`✅ OTP migrado: ${otp.identifier}`);
        } catch (error) {
          console.log(`❌ Error migrando OTP:`, error.message);
        }
      }
    }
    
    console.log('\n🎉 ¡Migración completada!');
    console.log('📊 Datos migrados a Firebase Firestore');
    console.log('🔗 Puedes ver los datos en: https://console.firebase.google.com/');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  }
}

migrateData();

