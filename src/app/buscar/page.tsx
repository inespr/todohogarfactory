'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProductCard } from '@/components/ProductCard';

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
        <div className="product-grid">
          {results.map((p) => (
            <ProductCard
              key={p.id}
              href={`/${p.category}/${p.id}`}
              image={p.fotos[0] || ''}
              placeholder={getPlaceholder(p.category)}
              name={p.name}
              subcategory={p.category}
              price={p.price}
              stock={p.stock}
            />
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
