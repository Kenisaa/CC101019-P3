#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { getLocalIP } = require('./get-local-ip');

// Detectar IP local
const localIP = getLocalIP();
console.log(`🌐 IP Local detectada: ${localIP}\n`);

// Actualizar .env con la IP correcta
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Reemplazar la línea EXPO_PUBLIC_API_URL con la IP actual
  envContent = envContent.replace(
    /EXPO_PUBLIC_API_URL=.*/,
    `EXPO_PUBLIC_API_URL=http://${localIP}:3000/api`
  );

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env actualizado con la IP actual\n');
}

console.log('🚀 Iniciando Meal Buddy - Desarrollo Completo\n');

// Función para limpiar procesos al salir
function cleanup() {
  console.log('\n🛑 Deteniendo servidores...');
  process.exit(0);
}

// Manejar señales de terminación
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Iniciar Backend
console.log('📡 Iniciando Backend...');
const backend = spawn('npm', ['start'], {
  cwd: path.join(__dirname, '..', 'backend'),
  stdio: 'inherit',
  shell: true
});

// Esperar un poco para que el backend inicie
setTimeout(() => {
  console.log('📱 Iniciando Expo...');
  
  // Iniciar Expo
  const expo = spawn('npx', ['expo', 'start'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true
  });

  // Manejar errores
  backend.on('error', (err) => {
    console.error('❌ Error en Backend:', err);
  });

  expo.on('error', (err) => {
    console.error('❌ Error en Expo:', err);
  });

  // Limpiar al salir
  process.on('exit', () => {
    backend.kill();
    expo.kill();
  });

}, 2000);

console.log('\n✅ Ambos servidores iniciados');
console.log(`📡 Backend: http://${localIP}:3000`);
console.log('📱 Expo: Escanea el QR con Expo Go');
console.log(`\n💡 API URL: http://${localIP}:3000/api`);
console.log('💡 Presiona Ctrl+C para detener ambos servidores\n');

