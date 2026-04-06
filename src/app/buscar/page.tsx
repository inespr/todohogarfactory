'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import Image from 'next/image';

type Product = {
  id: string;
  name: string;
  observaciones: string;
  price: number;
  fotos: string[];
  category: string;
  stock: number;
};

const COLLECTIONS = ['electrodomesticos'];

function BuscarContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAndSearch = async () => {
      if (!q.trim()) { setResults([]); return; }
      setLoading(true);
      try {
        const all: Product[] = [];
        for (const col of COLLECTIONS) {
          const snap = await getDocs(collection(db, col));
          snap.docs.forEach((d) => {
            const raw = d.data() as Record<string, unknown>;
            all.push({
              id: d.id,
              name: raw.name as string || '',
              observaciones: raw.observaciones as string || '',
              price: raw.price as number ?? 0,
              fotos: (raw.fotos as string[]) || [],
              category: col,
              stock: typeof raw.stock === 'boolean' ? (raw.stock ? 1 : 0) : ((raw.stock as number) ?? 0),
            });
          });
        }
        const normalized = q.toLowerCase();
        setResults(all.filter((p) =>
          p.name.toLowerCase().includes(normalized) ||
          p.observaciones.toLowerCase().includes(normalized) ||
          p.category.toLowerCase().includes(normalized)
        ));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAndSearch();
  }, [q]);

  const getPlaceholder = (category: string) => {
    switch (category) {
      case 'electrodomesticos': return '/placeholders/electrodomesticos.svg';
      case 'sofas': return '/placeholders/sofas.svg';
      case 'hogar': return '/placeholders/hogar.svg';
      default: return '/placeholders/descanso.svg';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">
        {q ? `Resultados para "${q}"` : 'Buscar productos'}
      </h1>
      {loading ? (
        <p className="text-center opacity-70 py-16">Buscando…</p>
      ) : results.length === 0 && q ? (
        <p className="text-center opacity-70 py-16">No se encontraron productos.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4" style={{ gridAutoRows: '280px' }}>
          {results.map((p) => (
            <div key={p.id} style={{ height: '280px', minHeight: '280px', maxHeight: '280px' }}>
              <Link
                href={`/${p.category}/${p.id}`}
                className="group flex flex-col bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all w-full"
                style={{ height: '280px' }}
              >
                <div className="relative bg-neutral-50 shrink-0 overflow-hidden" style={{ height: '160px' }}>
                  <Image
                    src={p.fotos[0] || getPlaceholder(p.category)}
                    alt={p.name}
                    fill
                    className={`object-contain p-3 transition-all${p.stock === 0 ? ' grayscale opacity-50' : ''}`}
                    sizes="25vw"
                    unoptimized
                    onError={(e) => { (e.target as HTMLImageElement).src = getPlaceholder(p.category); }}
                  />
                  {p.stock === 0 && (
                    <div className="absolute inset-x-0 bottom-0 bg-red-600 text-white text-[11px] font-black uppercase tracking-widest text-center py-1.5">
                      VENDIDO
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1 min-w-0">
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wide truncate">{p.category}</p>
                  <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-orange-600 line-clamp-2 mt-0.5">
                    {p.name}
                  </h3>
                  {p.price > 0 && (
                    <p className="text-sm font-bold text-neutral-900 mt-auto">
                      {p.price % 1 === 0 ? `${p.price} €` : `${p.price.toLocaleString('es-ES')} €`}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BuscarPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-10 opacity-70">Cargando…</div>}>
      <BuscarContent />
    </Suspense>
  );
}
