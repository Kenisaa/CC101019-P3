const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DB_PATH, 'users.json');
const OTP_FILE = path.join(DB_PATH, 'otps.json');

// Crear directorio de datos si no existe
if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(DB_PATH, { recursive: true });
}

// Inicializar archivos si no existen
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(OTP_FILE)) {
  fs.writeFileSync(OTP_FILE, JSON.stringify([], null, 2));
}

class Database {
  // USUARIOS
  getUsers() {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  }

  saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  }

  findUserByEmail(email) {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserByPhone(phone) {
    const users = this.getUsers();
    return users.find(u => u.phone === phone);
  }

  findUserById(id) {
    const users = this.getUsers();
    return users.find(u => u.id === id);
  }

  createUser(userData) {
    const users = this.getUsers();
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
      verified: false
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  updateUser(id, updates) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      this.saveUsers(users);
      return users[index];
    }
    return null;
  }

  // OTPs
  getOTPs() {
    const data = fs.readFileSync(OTP_FILE, 'utf8');
    return JSON.parse(data);
  }

  saveOTPs(otps) {
    fs.writeFileSync(OTP_FILE, JSON.stringify(otps, null, 2));
  }

  createOTP(identifier, code) {
    const otps = this.getOTPs();
    const newOTP = {
      id: Date.now().toString(),
      identifier, // email o teléfono
      code,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutos
      used: false
    };
    otps.push(newOTP);
    this.saveOTPs(otps);
    return newOTP;
  }

  findValidOTP(identifier, code) {
    const otps = this.getOTPs();
    const now = new Date();
    return otps.find(otp =>
      otp.identifier === identifier &&
      otp.code === code &&
      !otp.used &&
      new Date(otp.expiresAt) > now
    );
  }

  markOTPAsUsed(id) {
    const otps = this.getOTPs();
    const index = otps.findIndex(o => o.id === id);
    if (index !== -1) {
      otps[index].used = true;
      this.saveOTPs(otps);
      return true;
    }
    return false;
  }

  cleanExpiredOTPs() {
    const otps = this.getOTPs();
    const now = new Date();
    const validOTPs = otps.filter(otp => new Date(otp.expiresAt) > now);
    this.saveOTPs(validOTPs);
  }
}

module.exports = new Database();
