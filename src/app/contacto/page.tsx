export const metadata = {
  title: "Contacto | Todo Hogar Factory",
  description: "Dirección, horarios y formulario de contacto de la tienda.",
};

import { ContactForm } from "./ContactForm";

export default function ContactoPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Contacto</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section>
          <h2 className="text-lg font-semibold mb-2">Información de la tienda</h2>
          <div className="rounded-lg border border-black/[.08] dark:border-white/[.145] p-6 space-y-2">
            <p><span className="font-medium">Dirección:</span> Calle Ejemplo 123, Ciudad, Provincia</p>
            <p><span className="font-medium">Teléfono:</span> 600 123 456</p>
            <p><span className="font-medium">Email:</span> contacto@todohogarfactory.com</p>
            <p><span className="font-medium">Horario:</span> L-V 10:00-14:00, 16:30-20:30 · S 10:00-14:00</p>
            <p className="opacity-70 text-sm">Parking cercano y acceso para personas con movilidad reducida.</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Escríbenos</h2>
          <ContactForm />
        </section>
      </div>
    </div>
  );
}


