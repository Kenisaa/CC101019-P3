const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('📧 Configuración de Email para Meal Buddy\n');

console.log('📋 Pasos para configurar Gmail:');
console.log('1. Ve a tu cuenta de Google');
console.log('2. Seguridad → Verificación en 2 pasos (debe estar activada)');
console.log('3. Contraseñas de aplicaciones → Generar nueva');
console.log('4. Selecciona "Correo" y "Otro (nombre personalizado)"');
console.log('5. Nombre: "Meal Buddy App"');
console.log('6. Copia la contraseña de 16 caracteres\n');

rl.question('📧 Email de Gmail: ', (email) => {
  rl.question('🔑 Contraseña de aplicación (16 caracteres): ', (password) => {
    
    if (!email || !password) {
      console.log('\n❌ Email y contraseña son requeridos');
      rl.close();
      return;
    }
    
    if (password.length !== 16) {
      console.log('\n⚠️  La contraseña debe tener exactamente 16 caracteres');
      console.log('💡 Genera una nueva contraseña de aplicación en Google');
      rl.close();
      return;
    }
    
    // Crear contenido del .env
    const envContent = `PORT=3000
EMAIL_USER=${email}
EMAIL_PASSWORD=${password}
JWT_SECRET=Rq94pF1tNu5cYzL0hQ2bXv7rJs8mW9KaU4dT3oHfCiPy`;
    
    // Escribir archivo .env
    fs.writeFileSync('.env', envContent);
    
    console.log('\n✅ Archivo .env actualizado');
    console.log('🧪 Ejecutando prueba de email...\n');
    
    rl.close();
    
    // Ejecutar prueba
    require('./test-email.js');
  });
});
