#!/usr/bin/env node

const { exec } = require('child_process');

console.log('🧹 Limpiando procesos existentes...\n');

// Función para ejecutar comandos
function runCommand(command, description) {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      if (stdout) console.log(`✅ ${description}: ${stdout.trim()}`);
      if (stderr) console.log(`⚠️  ${description}: ${stderr.trim()}`);
      resolve();
    });
  });
}

async function cleanup() {
  console.log('🛑 Deteniendo procesos...');
  
  // Detener procesos de Node.js en puertos específicos
  await runCommand('lsof -ti:3000 | xargs kill -9 2>/dev/null || true', 'Backend (puerto 3000)');
  await runCommand('lsof -ti:8081 | xargs kill -9 2>/dev/null || true', 'Expo (puerto 8081)');
  await runCommand('lsof -ti:8082 | xargs kill -9 2>/dev/null || true', 'Expo (puerto 8082)');
  
  // Detener procesos de Expo
  await runCommand('pkill -f "expo start" 2>/dev/null || true', 'Procesos de Expo');
  await runCommand('pkill -f "node.*backend" 2>/dev/null || true', 'Procesos de Backend');
  
  console.log('\n✅ Limpieza completada');
  console.log('🚀 Ahora puedes ejecutar: npm run dev\n');
}

cleanup();

