const Database = require('better-sqlite3');
const path = require('path');

// Abrir la base de datos
const dbPath = path.join(__dirname, 'data/mealbuddy.db');
const db = new Database(dbPath, { readonly: true });

console.log('📊 Base de datos SQLite - Meal Buddy\n');
console.log('='.repeat(80));

// Ver usuarios
console.log('\n👥 USUARIOS:');
console.log('-'.repeat(80));
const users = db.prepare('SELECT * FROM users').all();
if (users.length === 0) {
  console.log('No hay usuarios registrados');
} else {
  users.forEach(user => {
    console.log(`\nID: ${user.id}`);
    console.log(`Nombre: ${user.name}`);
    console.log(`Email: ${user.email || 'N/A'}`);
    console.log(`Teléfono: ${user.phone || 'N/A'}`);
    console.log(`Verificado: ${user.verified ? '✅' : '❌'}`);
    console.log(`Creado: ${user.created_at}`);
    console.log(`Actualizado: ${user.updated_at}`);
  });
}

// Ver OTPs
console.log('\n\n🔐 OTPs:');
console.log('-'.repeat(80));
const otps = db.prepare('SELECT * FROM otps ORDER BY created_at DESC LIMIT 10').all();
if (otps.length === 0) {
  console.log('No hay OTPs registrados');
} else {
  otps.forEach(otp => {
    console.log(`\nID: ${otp.id}`);
    console.log(`Identificador: ${otp.identifier}`);
    console.log(`Código: ${otp.code}`);
    console.log(`Usado: ${otp.used ? '✅' : '❌'}`);
    console.log(`Creado: ${otp.created_at}`);
    console.log(`Expira: ${otp.expires_at}`);
    if (otp.used_at) {
      console.log(`Usado en: ${otp.used_at}`);
    }
  });
}

// Estadísticas
console.log('\n\n📈 ESTADÍSTICAS:');
console.log('-'.repeat(80));
const stats = db.prepare(`
  SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM users WHERE verified = 1) as verified_users,
    (SELECT COUNT(*) FROM otps) as total_otps,
    (SELECT COUNT(*) FROM otps WHERE used = 1) as used_otps
`).get();

console.log(`Total de usuarios: ${stats.total_users}`);
console.log(`Usuarios verificados: ${stats.verified_users}`);
console.log(`Total de OTPs: ${stats.total_otps}`);
console.log(`OTPs usados: ${stats.used_otps}`);

console.log('\n' + '='.repeat(80));

db.close();
