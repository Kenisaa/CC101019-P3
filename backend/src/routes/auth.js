const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register - Registro de usuario
router.post('/register', authController.register);

// POST /api/auth/login - Login de usuario
router.post('/login', authController.login);

// POST /api/auth/verify - Verificar código OTP
router.post('/verify', authController.verifyOTP);

// POST /api/auth/resend - Reenviar código OTP
router.post('/resend', authController.resendOTP);

module.exports = router;
