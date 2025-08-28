"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nombre = String(form.get("nombre") || "");
    const email = String(form.get("email") || "");
    const mensaje = String(form.get("mensaje") || "");

    if (!nombre || !email || !mensaje) {
      setStatus("Por favor, completa todos los campos.");
      return;
    }
    setStatus("Gracias por contactarnos. Te responderemos pronto.");
    e.currentTarget.reset();
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-black/[.08] dark:border-white/[.145] p-6 space-y-4">
      <div>
        <label htmlFor="nombre" className="block text-sm mb-1">Nombre</label>
        <input id="nombre" name="nombre" className="w-full rounded-md border border-black/[.08] dark:border-white/[.145] bg-transparent px-3 py-2" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm mb-1">Email</label>
        <input id="email" name="email" type="email" className="w-full rounded-md border border-black/[.08] dark:border-white/[.145] bg-transparent px-3 py-2" />
      </div>
      <div>
        <label htmlFor="mensaje" className="block text-sm mb-1">Mensaje</label>
        <textarea id="mensaje" name="mensaje" rows={4} className="w-full rounded-md border border-black/[.08] dark:border-white/[.145] bg-transparent px-3 py-2" />
      </div>
      <button type="submit" className="rounded-md border border-black/[.08] dark:border-white/[.145] px-4 py-2 hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a]">Enviar</button>
      {status && <p className="text-sm opacity-80">{status}</p>}
    </form>
  );
}


