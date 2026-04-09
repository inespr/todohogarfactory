'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { ProductListCard } from '@/components/ProductListCard';
import { buildExtras, fieldLabel } from '@/lib/productExtras';

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
  price: number;
  offerPrice?: number;
  fotos: string[];
  category: string;
  subcategoria?: string;
  stock: number;
  coleccion: Coleccion;
  marca?: string;
  extras: Record<string, string>;
};

function normalize(str: string) {
  return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim().replace(/s$/, '');
}

export default function OfertasPage() {
  const [products, setProducts] = useState<OfertaProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCol, setSelectedCol] = useState<Coleccion | 'Todos'>('Todos');
  const [selectedSubcat, setSelectedSubcat] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');

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
                price: (raw.price as number) ?? 0,
                offerPrice: raw.offerPrice as number | undefined,
                fotos,
                category: (raw.category as string) || '',
                subcategoria: (raw.subcategoria as string) || '',
                stock: (raw.stock as number) ?? 0,
                marca: raw.marca as string | undefined,
                extras: buildExtras(raw),
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

  // Reset subcategoría al cambiar categoría
  useEffect(() => { setSelectedSubcat(''); }, [selectedCol]);

  const availableCols = COLECCIONES.filter(col => products.some(p => p.coleccion === col));

  // Subcategorías disponibles dentro de la categoría seleccionada
  const subcatsInCol = (() => {
    const base = selectedCol === 'Todos' ? products : products.filter(p => p.coleccion === selectedCol);
    const seen = new Map<string, string>();
    base.forEach(p => {
      const label = p.subcategoria || p.category;
      if (label && !seen.has(normalize(label))) seen.set(normalize(label), label);
    });
    return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
  })();

  let filtered = selectedCol === 'Todos' ? products : products.filter(p => p.coleccion === selectedCol);
  if (selectedSubcat) filtered = filtered.filter(p => normalize(p.subcategoria || p.category) === normalize(selectedSubcat));
  if (sortBy === 'price-asc') filtered = [...filtered].sort((a, b) => (a.offerPrice ?? a.price) - (b.offerPrice ?? b.price));
  else if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => (b.offerPrice ?? b.price) - (a.offerPrice ?? a.price));
  else if (sortBy === 'discount') filtered = [...filtered].sort((a, b) => {
    const da = a.offerPrice ? (a.price - a.offerPrice) / a.price : 0;
    const db2 = b.offerPrice ? (b.price - b.offerPrice) / b.price : 0;
    return db2 - da;
  });
  else if (sortBy === 'name-asc') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  if (loading) return <div className="max-w-screen-2xl mx-auto px-6 py-10 opacity-70">Cargando ofertas…</div>;

  return (
    <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-400 mb-4">
        <Link href="/" className="hover:text-neutral-700 transition-colors">Inicio</Link>
        <span>›</span>
        <span className="text-neutral-700 font-medium">Ofertas</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mb-5">Ofertas</h1>

      <div className="flex gap-6 items-start">

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 sticky top-[90px] bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Filtrar</span>
          </div>

          {/* Categorías principales */}
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
                  {products.length}
                </span>
              </button>
            </li>
            {availableCols.map(col => {
              const count = products.filter(p => p.coleccion === col).length;
              const active = selectedCol === col;
              return (
                <li key={col}>
                  <button
                    onClick={() => setSelectedCol(col)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${active
                      ? 'bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-500'
                      : 'text-neutral-700 hover:bg-neutral-50'}`}
                  >
                    <span>{COLECCION_LABEL[col]}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-orange-100 text-orange-600' : 'bg-neutral-100 text-neutral-500'}`}>
                      {count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Subcategorías */}
          {subcatsInCol.length > 1 && (
            <div className="border-t border-neutral-100">
              <div className="px-4 py-3 border-b border-neutral-100">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Subcategoría</span>
              </div>
              <ul className="py-2">
                <li>
                  <button
                    onClick={() => setSelectedSubcat('')}
                    className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${selectedSubcat === ''
                      ? 'bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-500'
                      : 'text-neutral-700 hover:bg-neutral-50'}`}
                  >
                    Todos
                  </button>
                </li>
                {subcatsInCol.map(sub => (
                  <li key={sub}>
                    <button
                      onClick={() => setSelectedSubcat(sub === selectedSubcat ? '' : sub)}
                      className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${normalize(selectedSubcat) === normalize(sub)
                        ? 'bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-500'
                        : 'text-neutral-700 hover:bg-neutral-50'}`}
                    >
                      <span>{sub}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${normalize(selectedSubcat) === normalize(sub) ? 'bg-orange-100 text-orange-600' : 'bg-neutral-100 text-neutral-500'}`}>
                        {products.filter(p =>
                          (selectedCol === 'Todos' || p.coleccion === selectedCol) &&
                          normalize(p.subcategoria || p.category) === normalize(sub)
                        ).length}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Contenido */}
        <div className="flex-1 min-w-0">

          {/* Barra superior */}
          <div className="mb-5 bg-white rounded-xl border border-neutral-200 px-3 sm:px-4 py-3 flex flex-col gap-2">

            {/* Chips categoría móvil */}
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
                  {COLECCION_LABEL[col]}
                </button>
              ))}
            </div>

            {/* Chips subcategoría móvil */}
            {subcatsInCol.length > 1 && (
              <div className="flex lg:hidden overflow-x-auto gap-2 scrollbar-none -mx-3 sm:-mx-4 px-3 sm:px-4 pb-1">
                {subcatsInCol.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubcat(sub === selectedSubcat ? '' : sub)}
                    className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={normalize(selectedSubcat) === normalize(sub)
                      ? { backgroundColor: '#f97316', color: '#fff' }
                      : { backgroundColor: '#f3f4f6', color: '#4b5563' }}
                  >
                    {sub}
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
                <option value="discount">Mayor descuento</option>
                <option value="price-asc">Precio ↑</option>
                <option value="price-desc">Precio ↓</option>
                <option value="name-asc">A–Z</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center opacity-70 py-16">No hay productos en oferta en este momento.</p>
          ) : (
            <div className="list-grid">
              {filtered.map((p) => (
                <ProductListCard
                  key={`${p.coleccion}-${p.id}`}
                  href={`/${p.coleccion}/${p.id}`}
                  image={p.fotos[0] || ''}
                  placeholder={PLACEHOLDER[p.coleccion]}
                  name={p.name}
                  subcategory={p.subcategoria || p.category || COLECCION_LABEL[p.coleccion]}
                  price={p.price}
                  offerPrice={p.offerPrice}
                  stock={p.stock}
                  marca={p.marca}
                  specs={Object.entries(p.extras).slice(0, 6).map(([k, v]) => ({ label: fieldLabel(k), value: v }))}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
