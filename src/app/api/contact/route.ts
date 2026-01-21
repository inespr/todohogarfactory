import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { nombre, email, mensaje } = await request.json();

    if (!nombre || !email || !mensaje) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Email de destino
    const toEmail = 'cienxcientodohogar@gmail.com';
    const subject = `Mensaje de ${nombre}`;
    
    // Verificar que las credenciales de Gmail estén configuradas
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('Credenciales de Gmail no configuradas');
      return NextResponse.json(
        { error: 'Servicio de email no configurado. Por favor, contacta al administrador.' },
        { status: 500 }
      );
    }

    // Configurar el transportador de Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Configurar el email
    const mailOptions = {
      from: `"Contacto Todo Hogar" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      replyTo: email,
      subject: subject,
      html: `
        <h2>Mensaje enviado desde el formulario de contacto</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje.replace(/\n/g, '<br>')}</p>
      `,
      text: `Nombre: ${nombre}\nEmail: ${email}\n\nMensaje:\n${mensaje}`,
    };

    // Enviar el email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true,
      message: 'Email enviado correctamente'
    });
  } catch (error) {
    console.error('Error procesando el formulario:', error);
    return NextResponse.json(
      { error: 'Error al enviar el email. Por favor, inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}
