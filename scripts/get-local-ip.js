#!/usr/bin/env node

const os = require('os');

/**
 * Obtiene la IP local de la máquina en la red WiFi actual
 * Útil para desarrollo móvil donde necesitamos conectar desde dispositivos físicos
 */
function getLocalIP() {
  const interfaces = os.networkInterfaces();

  // Interfaces a ignorar (VPN, virtuales, etc.)
  const ignoreInterfaces = ['utun', 'awdl', 'llw', 'bridge', 'vmnet', 'vboxnet', 'docker', 'tun', 'tap'];

  const candidates = [];

  // Buscar todas las IPs válidas
  for (const name of Object.keys(interfaces)) {
    // Ignorar interfaces virtuales/VPN
    if (ignoreInterfaces.some(prefix => name.toLowerCase().startsWith(prefix))) {
      continue;
    }

    for (const iface of interfaces[name]) {
      // Solo IPv4, no loopback
      if (iface.family === 'IPv4' && !iface.internal) {
        const ip = iface.address;

        // Priorizar IPs de red local típicas (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        if (ip.startsWith('192.168.') || ip.startsWith('10.')) {
          candidates.push({ ip, priority: 2 });
        } else if (ip.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
          candidates.push({ ip, priority: 2 });
        } else {
          candidates.push({ ip, priority: 1 });
        }
      }
    }
  }

  // Ordenar por prioridad (mayor primero)
  candidates.sort((a, b) => b.priority - a.priority);

  // Retornar la mejor IP encontrada
  if (candidates.length > 0) {
    return candidates[0].ip;
  }

  // Si no encontramos ninguna, usar localhost
  return 'localhost';
}

// Si se ejecuta directamente, imprimir la IP
if (require.main === module) {
  console.log(getLocalIP());
}

module.exports = { getLocalIP };
