'use client';

import { useState } from 'react';

interface ContactFormProps {
  onSuccess?: (success: boolean, message: string | null) => void;
}

export function ContactForm({ onSuccess }: ContactFormProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nombre || !email || !mensaje) {
      setStatus('Por favor, completa todos los campos.');
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setStatus(null);
    setIsSuccess(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, mensaje }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        const successMessage = '¡Gracias por contactarnos! Te responderemos pronto.';
        setStatus(successMessage);
        setNombre('');
        setEmail('');
        setMensaje('');
        onSuccess?.(true, successMessage);
      } else {
        const errorMessage = data.error || 'Error al enviar el mensaje. Inténtalo de nuevo.';
        setStatus(errorMessage);
        onSuccess?.(false, errorMessage);
      }
    } catch {
      const errorMessage = 'Error al enviar el mensaje. Inténtalo de nuevo.';
      setStatus(errorMessage);
      onSuccess?.(false, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition disabled:opacity-50';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-neutral-700 mb-1">
          Nombre
        </label>
        <input
          id="nombre"
          type="text"
          placeholder="Tu nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={inputClass}
          disabled={isSuccess}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          disabled={isSuccess}
        />
      </div>

      <div>
        <label htmlFor="mensaje" className="block text-sm font-medium text-neutral-700 mb-1">
          Mensaje
        </label>
        <textarea
          id="mensaje"
          rows={5}
          placeholder="¿En qué podemos ayudarte?"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          className={inputClass}
          disabled={isSuccess}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || isSuccess}
        className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Enviando…' : 'Enviar mensaje'}
      </button>

      {status && (
        <p className={`text-sm mt-1 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
          {status}
        </p>
      )}
    </form>
  );
}

export function InfoTienda({ telefono, whatsapp }: { telefono: string; whatsapp: string }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl overflow-hidden border border-neutral-200 h-56">
        <iframe
          title="Ubicación Todo Hogar Factory"
          src="https://maps.google.com/maps?q=Av.+de+la+Constitución+7,+21600+Valverde+del+Camino,+Huelva,+Spain&z=15&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <ul className="space-y-3 text-sm text-neutral-700">
        <li className="flex items-start gap-3">
          <span className="mt-0.5 text-orange-500">📍</span>
          <span>Av. de la Constitución, 7, 21600 Valverde del Camino, Huelva</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="text-orange-500">🕐</span>
          <span>Lun–Sáb: 9:30 – 13:30 · 17:00 – 20:30</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="text-orange-500">📞</span>
          <a href={`tel:${telefono}`} className="hover:text-orange-600 font-medium">
            {telefono}
          </a>
        </li>
      </ul>

      <div className="flex flex-wrap gap-3">
        <a
          href={`https://wa.me/34${whatsapp}?text=Hola%2C%20me%20gustar%C3%ADa%20recibir%20informaci%C3%B3n`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
          style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-4 h-4" fill="currentColor" aria-hidden="true">
            <path d="M16.04 5C10.55 5 6.11 9.44 6.11 14.93c0 2.1.61 4.03 1.78 5.72L6 26.96l6.48-1.87a9.97 9.97 0 0 0 3.56.65h.01c5.49 0 9.93-4.44 9.93-9.93C26 9.44 21.55 5 16.04 5Zm0 17.9h-.01a8 8 0 0 1-3.43-.81l-.25-.12-3.84 1.11 1.03-3.75-.16-.27a7.9 7.9 0 0 1-1.22-4.24c0-4.38 3.57-7.95 7.96-7.95 2.13 0 4.13.83 5.63 2.33a7.9 7.9 0 0 1 2.33 5.63c0 4.39-3.57 7.96-7.94 7.96Z" />
          </svg>
          WhatsApp
        </a>
        <a
          href={`tel:${telefono}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition"
        >
          <span className="pi pi-phone" aria-hidden="true" />
          Llamar
        </a>
      </div>
    </div>
  );
}
