'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import Image from 'next/image';

const COLECCIONES = ['electrodomesticos', 'sofas', 'hogar', 'descanso'] as const;
type Coleccion = typeof COLECCIONES[number];

const COLECCION_LABEL: Record<Coleccion, string> = {
  electrodomesticos: 'Electrodomésticos',
  sofas: 'Sofás',
  hogar: 'Hogar',
  descanso: 'Descanso',
};

const PLACEHOLDER: Record<Coleccion, string> = {
  electrodomesticos: '/placeholders/electrodomesticos.svg',
  sofas: '/placeholders/sofas.svg',
  hogar: '/placeholders/hogar.svg',
  descanso: '/placeholders/descanso.svg',
};

type OfertaProduct = {
  id: string;
  name: string;
  observaciones: string;
  price: number;
  offerPrice?: number;
  fotos: string[];
  category: string;
  subcategoria?: string;
  stock: number;
  coleccion: Coleccion;
};

export default function OfertasPage() {
  const [products, setProducts] = useState<OfertaProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfertas = async () => {
      try {
        const results: OfertaProduct[] = [];

        await Promise.all(
          COLECCIONES.map(async (col) => {
            const q = query(collection(db, col), where('isOferta', '==', true));
            const snap = await getDocs(q);
            snap.docs.forEach((d) => {
              const raw = d.data() as Record<string, unknown>;
              const fotosArr = (raw.fotos as string[]) || [];
              const singleImg = raw.urlImg || raw.imageUrl || raw.imagen || raw.foto || raw.img || raw.url || raw.image;
              const fotos = fotosArr.length > 0 ? fotosArr : (singleImg ? [singleImg as string] : []);
              results.push({
                id: d.id,
                name: raw.name as string,
                observaciones: (raw.observaciones as string) || (raw.description as string) || '',
                price: (raw.price as number) ?? 0,
                offerPrice: raw.offerPrice as number | undefined,
                fotos,
                category: (raw.category as string) || '',
                subcategoria: (raw.subcategoria as string) || '',
                stock: (raw.stock as number) ?? 0,
                coleccion: col,
              });
            });
          })
        );

        setProducts(results);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOfertas();
  }, []);

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-10 opacity-70">Cargando ofertas…</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-400 mb-6">
        <Link href="/" className="hover:text-neutral-700 transition-colors">Inicio</Link>
        <span>›</span>
        <span className="text-neutral-700 font-medium">Ofertas</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">Ofertas</h1>
        <p className="mt-1 text-sm text-neutral-500">Productos seleccionados a precio especial.</p>
      </div>

      {products.length === 0 ? (
        <p className="text-center opacity-70 py-16">No hay productos en oferta en este momento.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((p) => {
            const precioFormateado = p.price > 0
              ? (p.price % 1 === 0 ? `${p.price} €` : p.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €')
              : null;
            const ofertaFormateado = p.offerPrice
              ? (p.offerPrice % 1 === 0 ? `${p.offerPrice} €` : p.offerPrice.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €')
              : null;
            const descuento = p.offerPrice && p.price > 0 && p.offerPrice < p.price
              ? Math.round(((p.price - p.offerPrice) / p.price) * 100)
              : null;

            return (
              <Link
                key={`${p.coleccion}-${p.id}`}
                href={`/${p.coleccion}/${p.id}`}
                className="group flex flex-row bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                style={{ height: '160px' }}
              >
                {/* Imagen */}
                <div className="relative bg-neutral-50 shrink-0 overflow-hidden" style={{ width: '150px', minWidth: '150px' }}>
                  <Image
                    src={p.fotos[0] || PLACEHOLDER[p.coleccion]}
                    alt={p.name}
                    fill
                    className="object-contain p-3"
                    sizes="150px"
                    unoptimized
                    onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER[p.coleccion]; }}
                  />
                  {descuento && (
                    <div className="absolute top-2 left-2 text-white text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: '#f97316' }}>
                      -{descuento}%
                    </div>
                  )}
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="text-xs font-semibold text-red-500 bg-white px-2 py-1 rounded-full shadow-sm border border-red-100">
                        Agotado
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col justify-between flex-1 overflow-hidden">
                  <div>
                    {/* Etiquetas */}
                    <div className="flex flex-wrap gap-1 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
                        {COLECCION_LABEL[p.coleccion]}
                      </span>
                      {(p.subcategoria || p.category) && p.subcategoria !== p.category && (
                        <span className="text-[10px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                          {p.subcategoria || p.category}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.stock === 0 ? 'bg-red-50 text-red-600' : 'text-white'}`}
                        style={p.stock > 0 ? { backgroundColor: '#16a34a' } : {}}
                      >
                        {p.stock > 0 ? '● Disponible' : '● Agotado'}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                      {p.name}
                    </h3>
                  </div>
                  {/* Precio */}
                  <div className="flex items-center gap-2 flex-wrap">

                    {descuento && precioFormateado && (
                      <span className="text-xs text-neutral-400 line-through">{precioFormateado}</span>
                    )}
                    {(ofertaFormateado || precioFormateado) && (
                      <span className="text-base font-bold text-red-600">
                        {ofertaFormateado || precioFormateado}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
