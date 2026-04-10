'use client';

import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  href: string;
  image: string;
  placeholder: string;
  name: string;
  subcategory?: string;
  price?: number;
  offerPrice?: number;
  stock: number;
}

function fmt(n: number) {
  return n % 1 === 0
    ? `${n} €`
    : n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export function ProductCard({ href, image, placeholder, name, subcategory, price, offerPrice, stock }: ProductCardProps) {
  const hasOffer = offerPrice != null && offerPrice > 0 && price != null && offerPrice < price;
  const discount = hasOffer ? Math.round(((price! - offerPrice!) / price!) * 100) : 0;
  const sold = stock === 0;

  return (
    <Link
      href={href}
      className="product-card-link group relative bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      {/* Badge descuento */}
      {hasOffer && !sold && (
        <div
          className="absolute top-2 left-2 z-20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded"
          style={{ backgroundColor: '#f97316' }}
        >
          -{discount}%
        </div>
      )}

      {/* Imagen */}
      <div className="card-img">
        <Image
          src={image || placeholder}
          alt={name}
          fill
          className={`object-cover transition-transform duration-300 group-hover:scale-105 ${sold ? 'grayscale opacity-60' : ''}`}
          sizes="(max-width: 640px) 50vw, 25vw"
          unoptimized
          onError={(e) => { (e.target as HTMLImageElement).src = placeholder; }}
        />
        {sold && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded">
              Vendido
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="card-info p-3 flex flex-col">
        <p
          className="mt-0.5 text-sm font-semibold text-neutral-900 group-hover:text-orange-600 transition-colors"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word',
            lineHeight: '1.3',
          }}
        >
          {name}
        </p>
        {price != null && price > 0 && (
          <div className="flex flex-col mt-auto">
            {hasOffer ? (
              <>
                <span className="text-base font-bold text-red-600 leading-none">{fmt(offerPrice!)}</span>
                <span className="text-xs text-neutral-400 line-through">Antes: {fmt(price)}</span>
              </>
            ) : (
              <span className="text-sm font-bold text-neutral-900">{fmt(price)}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
