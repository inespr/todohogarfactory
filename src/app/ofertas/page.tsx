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

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-10 opacity-70">Cargando ofertas…</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Ofertas</h1>
        <p className="mt-1 text-sm text-neutral-500">Productos seleccionados a precio especial.</p>
      </div>

      {products.length === 0 ? (
        <p className="text-center opacity-70 py-16">No hay productos en oferta en este momento.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((p) => (
            <Link
              key={`${p.coleccion}-${p.id}`}
              href={`/${p.coleccion}/${p.id}`}
              className="group flex flex-row bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              style={{ height: '160px' }}
            >
              {/* Imagen */}
              <div className="relative bg-neutral-50 shrink-0" style={{ width: '150px', minWidth: '150px' }}>
                <Image
                  src={p.fotos[0] || PLACEHOLDER[p.coleccion]}
                  alt={p.name}
                  fill
                  className="object-contain p-3"
                  sizes="150px"
                  unoptimized
                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER[p.coleccion]; }}
                />
                {/* Badge Oferta */}
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center rounded-full bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold shadow-sm">
                    Oferta
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col justify-between flex-1 overflow-hidden">
                <div>
                  {/* Etiquetas */}
                  <div className="flex flex-wrap gap-1 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      {COLECCION_LABEL[p.coleccion]}
                    </span>
                    {(p.subcategoria || p.category) && p.subcategoria !== p.category && (
                      <span className="text-[10px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                        {p.subcategoria || p.category}
                      </span>
                    )}
                    {p.stock === 0 && (
                      <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                        Agotado
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                    {p.name}
                  </h3>
                  {p.observaciones && (
                    <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{p.observaciones}</p>
                  )}
                </div>
                {p.price > 0 && (
                  <p className="text-base font-bold text-orange-600">
                    {p.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
