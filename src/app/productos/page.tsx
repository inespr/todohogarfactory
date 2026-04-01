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

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-10 opacity-70">Cargando productos…</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((p) => (
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
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                      {COLECCION_LABEL[p.coleccion]}
                    </span>
                    {p.subcategoria && (
                      <span className="text-[10px] text-neutral-400 bg-neutral-50 border border-neutral-200 px-2 py-0.5 rounded-full">
                        {p.subcategoria}
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
                  <p className="text-sm font-bold text-neutral-900">
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
