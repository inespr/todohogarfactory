'use client';

import { useState } from 'react';
import { ContactForm } from './ContactForm';

const WA_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" style={{ width: 20, height: 20 }} fill="currentColor">
    <path d="M16.04 5C10.55 5 6.11 9.44 6.11 14.93c0 2.1.61 4.03 1.78 5.72L6 26.96l6.48-1.87a9.97 9.97 0 0 0 3.56.65h.01c5.49 0 9.93-4.44 9.93-9.93C26 9.44 21.55 5 16.04 5Zm0 17.9h-.01a8 8 0 0 1-3.43-.81l-.25-.12-3.84 1.11 1.03-3.75-.16-.27a7.9 7.9 0 0 1-1.22-4.24c0-4.38 3.57-7.95 7.96-7.95 2.13 0 4.13.83 5.63 2.33a7.9 7.9 0 0 1 2.33 5.63c0 4.39-3.57 7.96-7.94 7.96Z" />
  </svg>
);

export default function ContactoPage() {
  const telefono = "692211145";
  const whatsapp = "692211145";
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>

      {/* Hero */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', padding: '4rem 1rem 2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111', marginBottom: 8 }}>¿En qué podemos ayudarte?</h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', maxWidth: 400, margin: '0 auto' }}>
          Estamos en Valverde del Camino. Escríbenos, llámanos o pásate por la tienda — sin compromiso.
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem 4rem' }}>

        {/* Tarjetas contacto rápido — flex-wrap evita el conflicto con PrimeFlex */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>

          <a
            href={`https://wa.me/34${whatsapp}?text=Hola%2C%20me%20gustar%C3%ADa%20recibir%20informaci%C3%B3n`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 16,
              backgroundColor: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
              padding: '1.1rem 1.25rem', textDecoration: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'box-shadow .2s'
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#16a34a' }}>
              {WA_SVG}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>WhatsApp</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Escríbenos ahora</p>
            </div>
          </a>

          <a
            href={`tel:${telefono}`}
            style={{
              flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 16,
              backgroundColor: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
              padding: '1.1rem 1.25rem', textDecoration: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="#f97316" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Teléfono</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>692 211 145</p>
            </div>
          </a>

          <div style={{
            flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 16,
            backgroundColor: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
            padding: '1.1rem 1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Horario</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111', lineHeight: 1.4 }}>Lun–Sáb<br />9:30–13:30 · 17:00–20:30</p>
            </div>
          </div>

        </div>

        {/* Mapa + Formulario */}
        <div className="detail-grid">

          {/* Info tienda */}
          <div style={{ backgroundColor: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ height: 200, width: '100%' }}>
              <iframe
                title="Ubicación Todo Hogar Factory"
                src="https://maps.google.com/maps?q=Av.+de+la+Constitución+7,+21600+Valverde+del+Camino,+Huelva,+Spain&z=15&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: '1rem' }}>Dónde encontrarnos</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#4b5563' }}>
                  <span style={{ flexShrink: 0 }}>📍</span>
                  <span>Av. de la Constitución, 7<br />21600 Valverde del Camino, Huelva</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#4b5563' }}>
                  <span>🕐</span>
                  <span>Lun–Sáb: 9:30–13:30 · 17:00–20:30</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#4b5563' }}>
                  <span>📞</span>
                  <a href={`tel:${telefono}`} style={{ fontWeight: 700, color: '#111', textDecoration: 'none' }}>692 211 145</a>
                </li>
              </ul>
              <div style={{ display: 'flex', gap: 10, marginTop: '1.25rem' }}>
                <a
                  href={`https://wa.me/34${whatsapp}?text=Hola%2C%20me%20gustar%C3%ADa%20recibir%20informaci%C3%B3n`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '0.6rem', borderRadius: 12, backgroundColor: '#16a34a',
                    color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none'
                  }}
                >
                  {WA_SVG} WhatsApp
                </a>
                <a
                  href={`tel:${telefono}`}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0.6rem', borderRadius: 12, border: '1px solid #e5e7eb',
                    color: '#374151', fontWeight: 600, fontSize: 14, textDecoration: 'none',
                    backgroundColor: '#fff'
                  }}
                >
                  Llamar
                </a>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div style={{ backgroundColor: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {isSuccess ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', textAlign: 'center', gap: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#fff', background: 'linear-gradient(135deg, #f97316, #dc2626)' }}>
                  ✓
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>¡Mensaje enviado!</h3>
                <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 260 }}>{successMessage}</p>
                <button
                  onClick={() => { setIsSuccess(false); setSuccessMessage(null); }}
                  style={{ marginTop: 8, padding: '0.5rem 1.25rem', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 14, fontWeight: 500, backgroundColor: '#fff', cursor: 'pointer' }}
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 }}>Escríbenos</h2>
                <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: '1.25rem' }}>Te respondemos lo antes posible.</p>
                <ContactForm onSuccess={(ok, msg) => { setIsSuccess(ok); setSuccessMessage(msg); }} />
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
