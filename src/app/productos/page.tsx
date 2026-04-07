'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
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

type Producto = {
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

export default function ProductosPage() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCol, setSelectedCol] = useState<Coleccion | 'todos'>('todos');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const results: Producto[] = [];

        await Promise.all(
          COLECCIONES.map(async (col) => {
            const snap = await getDocs(collection(db, col));
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
    fetchAll();
  }, []);

  const filtered = selectedCol === 'todos' ? products : products.filter(p => p.coleccion === selectedCol);

  if (loading) return <div className="max-w-screen-2xl mx-auto px-6 py-10 opacity-70">Cargando productos…</div>;

  return (
    <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Todos los productos</h1>
        <p className="mt-1 text-sm text-neutral-500">{products.length} productos en catálogo</p>
      </div>

      {/* Filtros por colección */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCol('todos')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCol === 'todos' ? 'bg-orange-500 text-white shadow-sm' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
        >
          Todos ({products.length})
        </button>
        {COLECCIONES.map((col) => {
          const count = products.filter(p => p.coleccion === col).length;
          if (count === 0) return null;
          return (
            <button
              key={col}
              onClick={() => setSelectedCol(col)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCol === col ? 'bg-orange-500 text-white shadow-sm' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
            >
              {COLECCION_LABEL[col]} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center opacity-70 py-16">No hay productos disponibles.</p>
      ) : (
        <div className="product-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map((p) => {
            const hasOffer = p.offerPrice != null && p.offerPrice > 0 && p.offerPrice < p.price;
            const discount = hasOffer ? Math.round(((p.price - p.offerPrice!) / p.price) * 100) : 0;
            const formatPrice = (n: number) =>
              n % 1 === 0 ? `${n} €` : n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
            return (
              <Link
                key={`${p.coleccion}-${p.id}`}
                href={`/${p.coleccion}/${p.id}`}
                className="group relative flex flex-col bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                {/* Badge porcentaje */}
                {hasOffer && p.stock !== 0 && (
                  <div className="absolute top-2 left-2 z-20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: '#f97316' }}>
                    -{discount}%
                  </div>
                )}

                {/* Imagen */}
                <div className="card-img">
                  <Image
                    src={p.fotos[0] || PLACEHOLDER[p.coleccion]}
                    alt={p.name}
                    fill
                    className={`object-cover transition-transform duration-300 group-hover:scale-105 ${p.stock === 0 ? 'grayscale opacity-60' : ''}`}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    unoptimized
                    onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER[p.coleccion]; }}
                  />
                  {p.stock === 0 ? (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded">
                        Vendido
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Info */}
                <div className="card-info p-3 flex flex-col">
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wide truncate">
                    {p.subcategoria || COLECCION_LABEL[p.coleccion]}
                  </p>
                  <h3
                    className="mt-0.5 text-sm font-semibold text-neutral-900 group-hover:text-orange-600 transition-colors leading-snug"
                    style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {p.name}
                  </h3>
                  {p.price > 0 && (
                    <div className="flex flex-col mt-auto">
                      {hasOffer ? (
                        <>
                          <span className="text-base font-bold text-red-600 leading-none">{formatPrice(p.offerPrice!)}</span>
                          <span className="text-xs text-neutral-400 line-through">Antes: {formatPrice(p.price)}</span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-neutral-900">{formatPrice(p.price)}</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
