require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🧪 Probando email a tu dirección personal...\n');
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    console.log('📤 Enviando email a tu dirección personal...');
    
    const info = await transporter.sendMail({
      from: `"Meal Buddy" <${process.env.EMAIL_USER}>`,
      to: 'kennisa@example.com', // CAMBIA ESTO POR TU EMAIL REAL
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
  }
}

testEmail();

