'use client';

import { useState } from 'react';
import { ContactForm, InfoTienda } from './ContactForm';

export default function ContactoPage() {
  const telefono = "692211145";
  const whatsapp = "692211145";
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFormSuccess = (success: boolean, message: string | null) => {
    setIsSuccess(success);
    setSuccessMessage(message);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2 text-center">Contacto</h1>
      <p className="text-center opacity-70 mb-10 text-sm">
        Estamos en Valverde del Camino. Escríbenos o llámanos sin compromiso.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Info tienda */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Dónde encontrarnos</h2>
          <InfoTienda telefono={telefono} whatsapp={whatsapp} />
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-green-600 mb-2">¡Mensaje enviado!</h3>
              <p className="text-sm text-neutral-600 mb-6">{successMessage}</p>
              <button
                onClick={() => { setIsSuccess(false); setSuccessMessage(null); }}
                className="px-5 py-2 rounded-lg border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-4">Escríbenos</h2>
              <ContactForm onSuccess={handleFormSuccess} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
