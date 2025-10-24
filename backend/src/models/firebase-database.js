const { admin, db } = require('../config/firebase-admin');

class FirebaseDatabase {
  // USUARIOS
  async getUsers() {
    try {
      const snapshot = await db.collection('users').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  async findUserByEmail(email) {
    try {
      const snapshot = await db.collection('users')
        .where('email', '==', email.toLowerCase())
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  async findUserByPhone(phone) {
    try {
      const snapshot = await db.collection('users')
        .where('phone', '==', phone)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error finding user by phone:', error);
      return null;
    }
  }

  async findUserById(id) {
    try {
      const doc = await db.collection('users').doc(id).get();
      if (!doc.exists) return null;
      
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  async createUser(userData) {
    try {
      const userRef = db.collection('users').doc();
      const newUser = {
        ...userData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        verified: false
      };
      
      await userRef.set(newUser);
      
      return {
        id: userRef.id,
        ...newUser
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id, updates) {
    try {
      const userRef = db.collection('users').doc(id);
      await userRef.update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const doc = await userRef.get();
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // OTPs
  async getOTPs() {
    try {
      const snapshot = await db.collection('otps').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting OTPs:', error);
      return [];
    }
  }

  async createOTP(identifier, code) {
    try {
      const otpRef = db.collection('otps').doc();
      const newOTP = {
        identifier,
        code,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutos
        used: false
      };
      
      await otpRef.set(newOTP);
      
      return {
        id: otpRef.id,
        ...newOTP
      };
    } catch (error) {
      console.error('Error creating OTP:', error);
      throw error;
    }
  }

  async findValidOTP(identifier, code) {
    try {
      const snapshot = await db.collection('otps')
        .where('identifier', '==', identifier)
        .where('code', '==', code)
        .where('used', '==', false)
        .get();
      
      const now = new Date();
      for (const doc of snapshot.docs) {
        const otp = doc.data();
        if (otp.expiresAt.toDate() > now) {
          return {
            id: doc.id,
            ...otp
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error finding valid OTP:', error);
      return null;
    }
  }

  async markOTPAsUsed(id) {
    try {
      await db.collection('otps').doc(id).update({
        used: true,
        usedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error marking OTP as used:', error);
      return false;
    }
  }

  async cleanExpiredOTPs() {
    try {
      const snapshot = await db.collection('otps')
        .where('used', '==', false)
        .get();
      
      const now = new Date();
      const batch = db.batch();
      
      snapshot.docs.forEach(doc => {
        const otp = doc.data();
        if (otp.expiresAt.toDate() < now) {
          batch.delete(doc.ref);
        }
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error cleaning expired OTPs:', error);
    }
  }
}

module.exports = new FirebaseDatabase();

