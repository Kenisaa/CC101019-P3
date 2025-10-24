#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

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
console.log('📡 Backend: http://192.168.1.14:3000');
console.log('📱 Expo: Escanea el QR con Expo Go');
console.log('\n💡 Presiona Ctrl+C para detener ambos servidores\n');

