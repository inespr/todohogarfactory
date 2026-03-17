'use client';

import { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, email, mensaje }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        const successMessage = '¡Gracias por contactarnos! Tu mensaje ha sido enviado correctamente. Te responderemos pronto.';
        setStatus(successMessage);
        setNombre('');
        setEmail('');
        setMensaje('');
        onSuccess?.(true, successMessage);
      } else {
        setIsSuccess(false);
        const errorMessage = data.error || 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.';
        setStatus(errorMessage);
        onSuccess?.(false, errorMessage);
      }
    } catch (error) {
      console.error('Error:', error);
      setIsSuccess(false);
      const errorMessage = 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.';
      setStatus(errorMessage);
      onSuccess?.(false, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="field">
        <label htmlFor="nombre" className="block mb-1 font-medium">Nombre</label>
        <InputText id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full p-inputtext-lg" disabled={isSuccess} />
      </div>

      <div className="field">
        <label htmlFor="email" className="block mb-1 font-medium">Email</label>
        <InputText id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-inputtext-lg" disabled={isSuccess} />
      </div>

      <div className="field">
        <label htmlFor="mensaje" className="block mb-1 font-medium">Mensaje</label>
        <InputTextarea id="mensaje" rows={6} value={mensaje} onChange={(e) => setMensaje(e.target.value)} className="w-full p-inputtextarea-lg" disabled={isSuccess} />
      </div>

      <Button 
        type="submit" 
        label={isLoading ? "Enviando..." : "Enviar"} 
        icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-send"}
        className="p-button-rounded p-button-success w-full"
        disabled={isLoading || isSuccess}
      />
      {status && !isSuccess && (
        <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
          <i className="pi pi-exclamation-circle"></i>
          <p>{status}</p>
        </div>
      )}
    </form>
  );
}

interface InfoTiendaProps {
  telefono: string;
  whatsapp: string;
} 

export function InfoTienda({ telefono, whatsapp }: InfoTiendaProps) {
  return (
    <Card className="shadow-lg" title="Información de la tienda">
      <div className="text-gray-700 dark:text-gray-300">
        <p className="flex flex-wrap items-center gap-2 break-words">
          <i className="pi pi-map-marker"></i>
          <strong>Dirección:</strong> Av. de la Constitución, 7, 21600 Valverde del Camino, Huelva
        </p>
        <Divider className="my-3" />
        <p className="flex flex-wrap items-center gap-2 break-words">
          <i className="pi pi-clock"></i>
          <strong>Horario:</strong> Cerrado ⋅ Apertura: 9:30
        </p>
        <Divider className="my-3" />
        <p className="flex flex-wrap items-center gap-2 break-words">
          <i className="pi pi-phone"></i>
          <strong>Teléfono:</strong> {telefono}
          <Button
            icon="pi pi-phone"
            className="p-button-rounded p-button-text p-button-sm ml-2"
            tooltip="Llamar"
            tooltipOptions={{ position: 'top' }}
            onClick={() => window.location.href = `tel:${telefono}`}
          />
          <Button
            icon="pi pi-whatsapp"
            className="p-button-rounded p-button-text p-button-sm ml-1"
            tooltip="WhatsApp"
            tooltipOptions={{ position: 'top' }}
            onClick={() => window.open(`https://wa.me/${whatsapp}`, "_blank")}
          />
        </p>
      </div>

      <Divider className="my-4" />

      <div className="w-full h-64 rounded-lg overflow-hidden shadow-inner">
        <iframe
          title="Ubicación Todo Hogar Factory"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3164.810456184739!2d-6.7538449!3d37.5780642!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd11bd8479ad696f%3A0x34d18d9763cb7e57!2sTodo%20Hogar%20Factory!5e0!3m2!1ses!2ses!4v1690000000000!5m2!1ses!2ses"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </Card>
  );
}
