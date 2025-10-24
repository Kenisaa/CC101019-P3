require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🧪 Probando configuración de email...\n');
  
  // Verificar variables de entorno
  console.log('📧 Email configurado:', process.env.EMAIL_USER);
  console.log('🔑 Contraseña configurada:', process.env.EMAIL_PASSWORD ? '✅ Sí' : '❌ No');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('\n❌ Error: Variables de entorno no configuradas');
    console.log('📝 Edita el archivo .env con tu email y contraseña de aplicación');
    return;
  }
  
  if (process.env.EMAIL_PASSWORD === 'REEMPLAZA_CON_TU_CONTRASEÑA_DE_16_CARACTERES') {
    console.log('\n❌ Error: Debes reemplazar la contraseña placeholder');
    console.log('📝 Edita el archivo .env con tu contraseña real de 16 caracteres');
    return;
  }
  
  try {
    // Crear transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    console.log('\n📤 Enviando email de prueba...');
    
    // Enviar email de prueba
    const info = await transporter.sendMail({
      from: `"Meal Buddy" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Enviar a ti mismo
      subject: '🧪 Prueba de Email - Meal Buddy',
      html: `
        <h2>🎉 ¡Email funcionando!</h2>
        <p>Si recibes este email, la configuración está correcta.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Servidor:</strong> Meal Buddy Backend</p>
      `
    });
    
    console.log('✅ Email enviado exitosamente!');
    console.log('📧 Message ID:', info.messageId);
    console.log('\n🎯 Revisa tu bandeja de entrada (y spam)');
    
  } catch (error) {
    console.log('\n❌ Error enviando email:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 Solución:');
      console.log('1. Verifica que la verificación en 2 pasos esté activada');
      console.log('2. Genera una nueva contraseña de aplicación');
      console.log('3. Actualiza el archivo .env con la nueva contraseña');
    }
  }
}

testEmail();
