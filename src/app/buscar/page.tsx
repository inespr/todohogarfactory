'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProductListCard } from '@/components/ProductListCard';
import { buildExtras, fieldLabel } from '@/lib/productExtras';

const COLLECTIONS = ['electrodomesticos', 'sofas', 'hogar', 'descanso'] as const;
type Col = typeof COLLECTIONS[number];

const COL_LABEL: Record<Col, string> = {
  electrodomesticos: 'Electrodomésticos',
  sofas: 'Sofás',
  hogar: 'Hogar',
  descanso: 'Descanso',
};

const PLACEHOLDER: Record<Col, string> = {
  electrodomesticos: '/placeholders/electrodomesticos.svg',
  sofas: '/placeholders/sofas.svg',
  hogar: '/placeholders/hogar.svg',
  descanso: '/placeholders/descanso.svg',
};

type Product = {
  id: string;
  name: string;
  observaciones: string;
  price: number;
  offerPrice?: number;
  fotos: string[];
  category: Col;
  subcategoria?: string;
  stock: number;
  marca?: string;
  extras: Record<string, string>;
};

function BuscarContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [allResults, setAllResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCol, setSelectedCol] = useState<Col | 'Todos'>('Todos');
  const [sortBy, setSortBy] = useState<string>('default');

  useEffect(() => {
    setSelectedCol('Todos');
    const fetchAndSearch = async () => {
      if (!q.trim()) { setAllResults([]); return; }
      setLoading(true);
      try {
        const all: Product[] = [];
        for (const col of COLLECTIONS) {
          const snap = await getDocs(collection(db, col));
          snap.docs.forEach((d) => {
            const raw = d.data() as Record<string, unknown>;
            const fotosArr = (raw.fotos as string[]) || [];
            const singleImg = raw.urlImg || raw.imageUrl || raw.imagen || raw.foto;
            const fotos = fotosArr.length > 0 ? fotosArr : (singleImg ? [singleImg as string] : []);
            all.push({
              id: d.id,
              name: raw.name as string || '',
              observaciones: raw.observaciones as string || '',
              price: raw.price as number ?? 0,
              offerPrice: raw.offerPrice as number | undefined,
              fotos,
              category: col,
              subcategoria: raw.subcategoria as string || '',
              stock: typeof raw.stock === 'boolean' ? (raw.stock ? 1 : 0) : ((raw.stock as number) ?? 0),
              marca: raw.marca as string | undefined,
              extras: buildExtras(raw),
            });
          });
        }
        const normalized = q.toLowerCase();
        setAllResults(all.filter((p) =>
          p.name.toLowerCase().includes(normalized) ||
          p.observaciones.toLowerCase().includes(normalized) ||
          (p.marca && p.marca.toLowerCase().includes(normalized)) ||
          (p.subcategoria && p.subcategoria.toLowerCase().includes(normalized)) ||
          Object.values(p.extras).some((v) => v.toLowerCase().includes(normalized))
        ));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAndSearch();
  }, [q]);

  const availableCols = COLLECTIONS.filter(col => allResults.some(p => p.category === col));

  let filtered = selectedCol === 'Todos' ? allResults : allResults.filter(p => p.category === selectedCol);
  const ep = (p: Product) => (p.offerPrice && p.offerPrice > 0 && p.offerPrice < p.price) ? p.offerPrice : p.price;
  if (sortBy === 'price-asc') filtered = [...filtered].sort((a, b) => ep(a) - ep(b));
  else if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => ep(b) - ep(a));
  else if (sortBy === 'name-asc') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy === 'name-desc') filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));

  const hasResults = !loading && allResults.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl font-bold mb-5">
        {q ? `Resultados para "${q}"` : 'Buscar productos'}
      </h1>

      {hasResults ? (
        <div className="flex gap-6 items-start">

          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col w-56 shrink-0 sticky top-[90px] bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Filtrar</span>
            </div>
            <ul className="py-2">
              <li>
                <button
                  onClick={() => setSelectedCol('Todos')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${selectedCol === 'Todos'
                    ? 'bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-500'
                    : 'text-neutral-700 hover:bg-neutral-50'}`}
                >
                  <span>Todos</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedCol === 'Todos' ? 'bg-orange-100 text-orange-600' : 'bg-neutral-100 text-neutral-500'}`}>
                    {allResults.length}
                  </span>
                </button>
              </li>
              {availableCols.map(col => {
                const count = allResults.filter(p => p.category === col).length;
                const active = selectedCol === col;
                return (
                  <li key={col}>
                    <button
                      onClick={() => setSelectedCol(col)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${active
                        ? 'bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-500'
                        : 'text-neutral-700 hover:bg-neutral-50'}`}
                    >
                      <span>{COL_LABEL[col]}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-orange-100 text-orange-600' : 'bg-neutral-100 text-neutral-500'}`}>
                        {count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Contenido */}
          <div className="flex-1 min-w-0">

            {/* Barra superior */}
            <div className="mb-5 bg-white rounded-xl border border-neutral-200 px-3 sm:px-4 py-3 flex flex-col gap-2">

              {/* Chips categoría móvil */}
              {availableCols.length > 1 && (
                <div className="flex lg:hidden overflow-x-auto gap-2 scrollbar-none -mx-3 sm:-mx-4 px-3 sm:px-4 pb-1">
                  <button
                    onClick={() => setSelectedCol('Todos')}
                    className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={selectedCol === 'Todos' ? { backgroundColor: '#f97316', color: '#fff' } : { backgroundColor: '#f3f4f6', color: '#4b5563' }}
                  >
                    Todos
                  </button>
                  {availableCols.map(col => (
                    <button
                      key={col}
                      onClick={() => setSelectedCol(col)}
                      className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={selectedCol === col ? { backgroundColor: '#f97316', color: '#fff' } : { backgroundColor: '#f3f4f6', color: '#4b5563' }}
                    >
                      {COL_LABEL[col]}
                    </button>
                  ))}
                </div>
              )}

              {/* Conteo + ordenar */}
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-neutral-500">
                  <span className="font-semibold text-neutral-800">{filtered.length}</span> productos
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="default">Ordenar…</option>
                  <option value="price-asc">Precio ↑</option>
                  <option value="price-desc">Precio ↓</option>
                  <option value="name-asc">A–Z</option>
                  <option value="name-desc">Z–A</option>
                </select>
              </div>
            </div>

            <div className="list-grid">
              {filtered.map((p) => (
                <ProductListCard
                  key={`${p.category}-${p.id}`}
                  href={`/${p.category}/${p.id}`}
                  image={p.fotos[0] || ''}
                  placeholder={PLACEHOLDER[p.category]}
                  name={p.name}
                  subcategory={p.subcategoria || COL_LABEL[p.category]}
                  price={p.price}
                  offerPrice={p.offerPrice}
                  stock={p.stock}
                  marca={p.marca}
                  specs={Object.entries(p.extras).slice(0, 6).map(([k, v]) => ({ label: fieldLabel(k), value: v }))}
                />
              ))}
            </div>
          </div>
        </div>
      ) : loading ? (
        <p className="text-center opacity-70 py-16">Buscando…</p>
      ) : q ? (
        <p className="text-center opacity-70 py-16">No se encontraron productos.</p>
      ) : null}
    </div>
  );
}

export default function BuscarPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 opacity-70">Cargando…</div>}>
      <BuscarContent />
    </Suspense>
  );
}
