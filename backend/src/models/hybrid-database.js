const jsonDb = require('./database');
const firebaseDb = require('./firebase-database');

class HybridDatabase {
  constructor() {
    this.useFirebase = false;
    this.checkFirebaseConnection();
  }

  async checkFirebaseConnection() {
    try {
      // Intentar una operación simple de Firebase
      await firebaseDb.getUsers();
      this.useFirebase = true;
      console.log('🔥 Usando Firebase como base de datos');
    } catch (error) {
      this.useFirebase = false;
      console.log('📁 Usando JSON como base de datos (Firebase no disponible)');
    }
  }

  // USUARIOS
  async getUsers() {
    if (this.useFirebase) {
      return await firebaseDb.getUsers();
    }
    return jsonDb.getUsers();
  }

  async findUserByEmail(email) {
    if (this.useFirebase) {
      return await firebaseDb.findUserByEmail(email);
    }
    return jsonDb.findUserByEmail(email);
  }

  async findUserByPhone(phone) {
    if (this.useFirebase) {
      return await firebaseDb.findUserByPhone(phone);
    }
    return jsonDb.findUserByPhone(phone);
  }

  async findUserById(id) {
    if (this.useFirebase) {
      return await firebaseDb.findUserById(id);
    }
    return jsonDb.findUserById(id);
  }

  async createUser(userData) {
    if (this.useFirebase) {
      return await firebaseDb.createUser(userData);
    }
    return jsonDb.createUser(userData);
  }

  async updateUser(id, updates) {
    if (this.useFirebase) {
      return await firebaseDb.updateUser(id, updates);
    }
    return jsonDb.updateUser(id, updates);
  }

  // OTPs
  async getOTPs() {
    if (this.useFirebase) {
      return await firebaseDb.getOTPs();
    }
    return jsonDb.getOTPs();
  }

  async createOTP(identifier, code) {
    if (this.useFirebase) {
      return await firebaseDb.createOTP(identifier, code);
    }
    return jsonDb.createOTP(identifier, code);
  }

  async findValidOTP(identifier, code) {
    if (this.useFirebase) {
      return await firebaseDb.findValidOTP(identifier, code);
    }
    return jsonDb.findValidOTP(identifier, code);
  }

  async markOTPAsUsed(id) {
    if (this.useFirebase) {
      return await firebaseDb.markOTPAsUsed(id);
    }
    return jsonDb.markOTPAsUsed(id);
  }

  async cleanExpiredOTPs() {
    if (this.useFirebase) {
      return await firebaseDb.cleanExpiredOTPs();
    }
    return jsonDb.cleanExpiredOTPs();
  }
}

module.exports = new HybridDatabase();

