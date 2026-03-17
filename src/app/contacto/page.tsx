'use client';

import { useState } from 'react';
import { ContactForm, InfoTienda } from './ContactForm';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export default function ContactoPage() {
  const telefono = "692211145";
  const whatsapp = "692211145";
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFormSuccess = (success: boolean, message: string | null) => {
    setIsSuccess(success);
    setSuccessMessage(message);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setSuccessMessage(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Contacto</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="pb-8 lg:pb-0 lg:pr-8">
          <InfoTienda telefono={telefono} whatsapp={whatsapp} />
        </div>

        <div className="pt-8 border-t border-black/10 lg:pt-0 lg:pl-8 lg:border-t-0 lg:border-l lg:border-black/10">
          {isSuccess ? (
            <Card className="shadow-lg">
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <i className="pi pi-check-circle text-6xl text-green-500"></i>
                </div>
                <h3 className="text-xl font-semibold text-green-600 mb-2">¡Mensaje enviado!</h3>
                <p className="text-green-600 mb-6">{successMessage}</p>
                <Button
                  type="button"
                  label="Enviar otro mensaje"
                  icon="pi pi-refresh"
                  className="p-button-rounded p-button-outlined p-button-success"
                  onClick={handleReset}
                />
              </div>
            </Card>
          ) : (
            <Card className="shadow-lg" title="Escríbenos">
              <ContactForm onSuccess={handleFormSuccess} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
