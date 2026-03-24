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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>
        <a
          href={`tel:${telefono}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition"
        >
          Llamar
        </a>
      </div>
    </div>
  );
}
