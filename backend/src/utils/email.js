let transporter = null;

try {
  const nodemailer = require('nodemailer');
  // Configurar transporter de Nodemailer solo si hay credenciales
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
} catch (error) {
  console.log('⚠️  Nodemailer no disponible, se usará modo consola');
}

async function sendOTPEmail(email, code, name = 'Usuario') {
  // Si no hay transporter configurado, solo mostrar en consola
  if (!transporter) {
    console.log(`\n📧 CÓDIGO OTP PARA ${email}:`);
    console.log(`   Nombre: ${name}`);
    console.log(`   Código: ${code}`);
    console.log(`   Expira en: 10 minutos\n`);
    return { success: true, mode: 'console' };
  }

  const mailOptions = {
    from: `"Meal Buddy" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🍽️ Tu código de verificación - Meal Buddy',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .code-box { background: white; border: 2px dashed #007AFF; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .code { font-size: 32px; font-weight: bold; color: #007AFF; letter-spacing: 8px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🍽️ Meal Buddy</h1>
            <p style="margin: 10px 0 0 0;">Tu compañero inteligente de comidas</p>
          </div>
          <div class="content">
            <h2>¡Hola ${name}!</h2>
            <p>Has solicitado un código de verificación para acceder a tu cuenta de Meal Buddy.</p>

            <div class="code-box">
              <p style="margin: 0; font-size: 14px; color: #666;">Tu código de verificación es:</p>
              <div class="code">${code}</div>
            </div>

            <p><strong>Este código expira en 10 minutos.</strong></p>
            <p>Si no solicitaste este código, puedes ignorar este email de forma segura.</p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

            <p style="font-size: 12px; color: #666;">
              <strong>Consejo de seguridad:</strong> Nunca compartas este código con nadie.
              El equipo de Meal Buddy nunca te pedirá tu código de verificación.
            </p>
          </div>
          <div class="footer">
            <p>© 2025 Meal Buddy. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendOTPEmail };
