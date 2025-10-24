const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/sqlite-database');
const { sendOTPEmail } = require('../utils/email');

// Generar código OTP de 6 dígitos
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// REGISTRO
async function register(req, res) {
  try {
    const { name, email, phone, password } = req.body;

    // Validar campos requeridos
    if (!name || (!email && !phone) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email o teléfono, y contraseña son requeridos'
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = email
      ? db.findUserByEmail(email)
      : db.findUserByPhone(phone);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe'
      });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = db.createUser({
      name,
      email: email || null,
      phone: phone || null,
      password: hashedPassword
    });

    // Generar y enviar OTP
    const otp = generateOTP();
    const identifier = email || phone;
    db.createOTP(identifier, otp);

    // Enviar OTP por email o SMS
    if (email) {
      await sendOTPEmail(email, otp, name);
    } else {
      // TODO: Implementar envío por SMS
      console.log(`OTP para ${phone}: ${otp}`);
    }

    res.status(201).json({
      success: true,
      message: 'Usuario registrado. Verifica tu código',
      userId: user.id,
      identifier
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
}

// LOGIN
async function login(req, res) {
  try {
    const { identifier, password } = req.body; // identifier puede ser email o teléfono

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/teléfono y contraseña son requeridos'
      });
    }

    // Buscar usuario por email o teléfono
    const user = identifier.includes('@')
      ? db.findUserByEmail(identifier)
      : db.findUserByPhone(identifier);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar que el usuario tenga contraseña
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Usuario sin contraseña configurada. Por favor, regístrate nuevamente.'
      });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar y enviar OTP
    const otp = generateOTP();
    db.createOTP(identifier, otp);

    // Enviar OTP
    if (user.email) {
      await sendOTPEmail(user.email, otp, user.name);
    } else {
      // TODO: Enviar por SMS
      console.log(`OTP para ${user.phone}: ${otp}`);
    }

    res.json({
      success: true,
      message: 'Código de verificación enviado',
      userId: user.id,
      identifier
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
}

// VERIFICAR OTP
async function verifyOTP(req, res) {
  try {
    const { identifier, code } = req.body;

    if (!identifier || !code) {
      return res.status(400).json({
        success: false,
        message: 'Identificador y código son requeridos'
      });
    }

    // Buscar OTP válido
    const otp = db.findValidOTP(identifier, code);

    if (!otp) {
      return res.status(401).json({
        success: false,
        message: 'Código inválido o expirado'
      });
    }

    // Marcar OTP como usado
    db.markOTPAsUsed(otp.id);

    // Buscar usuario
    const user = identifier.includes('@')
      ? db.findUserByEmail(identifier)
      : db.findUserByPhone(identifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Marcar usuario como verificado
    db.updateUser(user.id, { verified: true });

    // Generar JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, phone: user.phone },
      process.env.JWT_SECRET || 'tu-secret-key-super-segura',
      { expiresIn: '30d' }
    );

    // Remover contraseña de la respuesta
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Verificación exitosa',
      token,
      user: { ...userWithoutPassword, verified: true }
    });
  } catch (error) {
    console.error('Error en verificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
}

// REENVIAR OTP
async function resendOTP(req, res) {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Identificador requerido'
      });
    }

    // Buscar usuario
    const user = identifier.includes('@')
      ? db.findUserByEmail(identifier)
      : db.findUserByPhone(identifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Generar nuevo OTP
    const otp = generateOTP();
    db.createOTP(identifier, otp);

    // Enviar OTP
    if (user.email) {
      await sendOTPEmail(user.email, otp, user.name);
    } else {
      console.log(`OTP para ${user.phone}: ${otp}`);
    }

    res.json({
      success: true,
      message: 'Código reenviado exitosamente'
    });
  } catch (error) {
    console.error('Error reenviando OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
}

module.exports = {
  register,
  login,
  verifyOTP,
  resendOTP
};
