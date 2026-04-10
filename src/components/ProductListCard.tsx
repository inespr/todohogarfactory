'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Spec {
  label: string;
  value: string;
}

interface ProductListCardProps {
  href: string;
  image: string;
  placeholder: string;
  name: string;
  subcategory?: string;
  price?: number;
  offerPrice?: number;
  stock: number;
  marca?: string;
  specs?: Spec[];
}

function fmt(n: number) {
  return n % 1 === 0
    ? `${n} €`
    : n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

// Si el valor ya contiene el label (ej: label="Ranuras" value="2 ranuras"), muestra solo el valor
// Si es potencia/potencia W, añade W si no lo tiene
function formatSpecValue(label: string, value: string): string {
  const lLower = label.toLowerCase();

  // Potencia: asegura que termine en W
  if ((lLower.includes('potencia') || lLower.includes('watt')) && /^\d+$/.test(value.trim())) {
    return `${value.trim()} W`;
  }

  // Si el valor ya contiene la palabra del label, no hace falta el label
  return value;
}


export function ProductListCard({
  href, image, placeholder, name, subcategory, price, offerPrice, stock, marca, specs = [],
}: ProductListCardProps) {
  const hasOffer = offerPrice != null && offerPrice > 0 && price != null && offerPrice < price;
  const discount = hasOffer ? Math.round(((price! - offerPrice!) / price!) * 100) : 0;
  const sold = stock === 0;

  const visibleSpecs = specs;

  return (
    <Link
      href={href}
      className="group flex flex-row bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
      style={{ minHeight: '120px' }}
    >
      {/* Imagen — 50% del ancho */}
      <div className="relative w-1/2 shrink-0 bg-neutral-50 overflow-hidden">
        <Image
          src={image || placeholder}
          alt={name}
          fill
          className={`object-contain p-3 transition-transform duration-300 group-hover:scale-105 ${sold ? 'grayscale opacity-60' : ''}`}
          sizes="50vw"
          unoptimized
          onError={(e) => { (e.target as HTMLImageElement).src = placeholder; }}
        />
        {sold && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-2 py-1 rounded">
              Vendido
            </span>
          </div>
        )}
      </div>

      {/* Contenido derecho */}
      <div className="flex flex-1 min-w-0 flex-col justify-between px-3 py-3 border-l border-neutral-100">

        {/* Fila superior: nombre + precio */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-neutral-900 group-hover:text-orange-600 transition-colors leading-snug line-clamp-2">
              {name}
            </p>
            {marca && (
              <span className="text-[10px] text-neutral-500">{marca}</span>
            )}
          </div>

          {price != null && price > 0 && (
            <div className="flex flex-col items-end shrink-0 gap-0.5">
              {hasOffer && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-neutral-400 line-through leading-none">{fmt(price)}</span>
                  <span
                    className="text-white text-[9px] font-bold px-1 py-0.5 rounded leading-none"
                    style={{ backgroundColor: '#f97316' }}
                  >
                    -{discount}%
                  </span>
                </div>
              )}
              <span className="text-sm font-extrabold leading-none" style={{ color: '#f97316' }}>
                {hasOffer ? fmt(offerPrice!) : fmt(price)}
              </span>
              <span className="text-[9px] text-neutral-400">IVA incl.</span>
            </div>
          )}
        </div>

        {/* Specs en 2 columnas */}
        {visibleSpecs.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5">
            {visibleSpecs.map((s) => (
              <div key={s.label} className="flex flex-col text-[10px] leading-tight">
                <span className="text-neutral-400">{s.label}</span>
                <span className="font-medium text-neutral-800">{formatSpecValue(s.label, s.value)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Disponibilidad */}
        <div className="mt-2">
          <span className={`text-[10px] font-semibold ${sold ? 'text-red-500' : 'text-emerald-600'}`}>
            {sold ? '● Agotado' : '● Disponible'}
          </span>
        </div>
      </div>
    </Link>
  );
}
