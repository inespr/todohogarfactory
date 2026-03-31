'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
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

export default function OfertasPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfertas = async () => {
      try {
        const q = query(collection(db, 'electrodomesticos'), where('isOferta', '==', true));
        const snap = await getDocs(q);
        const data: Product[] = snap.docs.map((d) => {
          const raw = d.data() as Record<string, unknown>;
          return {
            id: d.id,
            name: raw.name as string,
            observaciones: raw.observaciones as string || '',
            price: raw.price as number ?? 0,
            fotos: (raw.fotos as string[]) || [],
            category: raw.category as string || '',
            stock: raw.stock as number ?? 0,
          };
        });
        setProducts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOfertas();
  }, []);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-10 opacity-70">Cargando ofertas…</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Ofertas</h1>
      {products.length === 0 ? (
        <p className="text-center opacity-70 py-16">No hay productos en oferta.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4" style={{ gridAutoRows: '280px' }}>
          {products.map((p) => (
            <div key={p.id} style={{ height: '280px', minHeight: '280px', maxHeight: '280px' }}>
              <Link
                href={`/electrodomesticos/${p.id}`}
                className="group flex flex-col bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all w-full"
                style={{ height: '280px' }}
              >
                <div className="relative bg-neutral-50 shrink-0" style={{ height: '160px' }}>
                  <Image
                    src={p.fotos[0] || '/placeholders/electrodomesticos.svg'}
                    alt={p.name}
                    fill
                    className="object-contain p-3"
                    sizes="25vw"
                    unoptimized
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholders/electrodomesticos.svg'; }}
                  />
                  <div className="absolute left-3 top-3">
                    <span className="inline-flex items-center rounded-full bg-orange-500 text-white px-2 py-1 text-xs font-semibold shadow-sm">
                      Oferta
                    </span>
                  </div>
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
