'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SUBCATEGORY_NAMES } from '@/lib/products';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';

type Product = {
  id: string;
  name: string;
  observaciones: string;
  category: string;
  subcategoria?: string;
  fotos: string[];
  stock: number;
  price: number;
  offerPrice?: number;
  hasDefect: boolean;
};

// ── Configuración de filtros por subcategoría ─────────────────────────────
type AttrConfig = { label: string; extract: (name: string) => string | null };

const ATTR_CONFIG: Record<string, AttrConfig> = {
  lavadora: {
    label: 'Capacidad',
    extract: (name) => {
      const m = name.match(/(\d+)\s*kg/i);
      return m ? `${m[1]} kg` : null;
    },
  },
  lavavajillas: {
    label: 'Cubiertos',
    extract: (name) => {
      const m = name.match(/(\d+)\s*cubiertos?/i);
      return m ? `${m[1]} cubiertos` : null;
    },
  },
  congelador: {
    label: 'Capacidad',
    extract: (name) => {
      const m = name.match(/(\d+)\s*[lL](?:\b|$)/);
      if (m) return `${m[1]} L`;
      if (/arc[oó]n/i.test(name)) return 'Arcón';
      if (/vertical/i.test(name)) return 'Vertical';
      return null;
    },
  },
};

function getAttrConfig(subcategory: string): AttrConfig | null {
  const key = subcategory
    .normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  return ATTR_CONFIG[key] ?? null;
}

function getAttrValues(config: AttrConfig, items: Product[]): string[] {
  const vals = new Set<string>();
  items.forEach(p => { const v = config.extract(p.name); if (v) vals.add(v); });
  return [...vals].sort((a, b) => {
    const na = parseFloat(a), nb = parseFloat(b);
    return isNaN(na) || isNaN(nb) ? a.localeCompare(b) : na - nb;
  });
}
// ─────────────────────────────────────────────────────────────────────────────

export function ElectroList() {
  const { T } = useLang();
  const searchParams = useSearchParams();
  const subcategoryParam = searchParams.get('subcategory') || '';

  const [items, setItems] = useState<Product[]>([]);
  const [filteredItems, setFilteredItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedAttr, setSelectedAttr] = useState<string>('');

  const normalizeForCompare = (str: string) =>
    str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

  const normalizeSubcategorySlug = (slug: string) => {
    const candidate = SUBCATEGORY_NAMES[slug.toLowerCase()];
    if (candidate) return candidate;
    const decoded = decodeURIComponent(slug || '').replace(/-/g, ' ');
    return decoded.trim().split(' ').filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  useEffect(() => {
    if (!subcategoryParam) { setSelectedCategory('Todos'); return; }
    setSelectedCategory(normalizeSubcategorySlug(subcategoryParam));
  }, [subcategoryParam]);

  // Reset atributo al cambiar subcategoría
  useEffect(() => { setSelectedAttr(''); }, [selectedCategory]);

  const [sortBy, setSortBy] = useState<string>('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, 'electrodomesticos'));
        console.log('Documentos en Firestore:', snap.size, snap.docs.map(d => d.id));
        const electroProducts: Product[] = snap.docs.map((d) => {
          const raw = d.data() as Record<string, unknown>;
          return {
            id: d.id,
            name: raw.name as string,
            observaciones: raw.observaciones as string || '',
            category: raw.category as string || '',
            subcategoria: raw.subcategoria as string || '',
            fotos: (raw.fotos as string[]) || [],
            stock: typeof raw.stock === 'boolean' ? (raw.stock ? 1 : 0) : ((raw.stock as number) ?? 0),
            price: raw.price as number ?? 0,
            offerPrice: raw.offerPrice as number ?? 0,
            hasDefect: raw.hasDefect as boolean || false,
          };
        });
        setItems(electroProducts);
        setFilteredItems(electroProducts);

        const seen = new Set<string>();
        const cats: string[] = [];
        electroProducts.forEach((p) => {
          const label = p.subcategoria || p.category;
          if (label && !seen.has(label)) {
            seen.add(label);
            cats.push(label);
          }
        });
        setCategories(['Todos', ...cats]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let updated = [...items];
    if (selectedCategory !== 'Todos') {
      updated = updated.filter((p) => {
        const label = p.subcategoria || p.category;
        return normalizeForCompare(label) === normalizeForCompare(selectedCategory);
      });
    }
    if (selectedAttr) {
      const config = getAttrConfig(selectedCategory);
      if (config) updated = updated.filter(p => config.extract(p.name) === selectedAttr);
    }
    if (sortBy === 'price-asc') updated.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') updated.sort((a, b) => b.price - a.price);
    else if (sortBy === 'name-asc') updated.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'name-desc') updated.sort((a, b) => b.name.localeCompare(a.name));
    updated.sort((a, b) => (a.stock === 0 ? 1 : 0) - (b.stock === 0 ? 1 : 0));
    setFilteredItems(updated);
  }, [selectedCategory, selectedAttr, sortBy, items]);

  const countFor = (cat: string) => {
    if (cat === 'Todos') return items.length;
    return items.filter((p) => normalizeForCompare(p.subcategoria || p.category) === normalizeForCompare(cat)).length;
  };

  if (loading) return <p className="opacity-70 py-10 text-center">{T.common.cargando}</p>;

  const matchedCategory = selectedCategory !== 'Todos' ? selectedCategory : null;
  const attrConfig = getAttrConfig(selectedCategory);
  // Items ya filtrados por subcategoría (sin aplicar atributo) para calcular opciones
  const itemsInCategory = selectedCategory === 'Todos'
    ? items
    : items.filter(p => normalizeForCompare(p.subcategoria || p.category) === normalizeForCompare(selectedCategory));
  const attrValues = attrConfig ? getAttrValues(attrConfig, itemsInCategory) : [];

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">
        Electrodomésticos
        {matchedCategory && (
          <span className="text-neutral-400 font-normal"> › {matchedCategory}</span>
        )}
      </h1>
      <div className="flex gap-6 items-start">

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 sticky top-24 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{T.common.filtrar}</span>
          </div>

          {/* Categorías */}
          <ul className="py-2">
            {categories.map((cat) => {
              const count = countFor(cat);
              const active = selectedCategory === cat;
              return (
                <li key={cat}>
                  <button
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${active
                      ? 'bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-500'
                      : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                  >
                    <span>{cat === 'Todos' ? T.common.todos : cat}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-orange-100 text-orange-600' : 'bg-neutral-100 text-neutral-500'}`}>
                      {count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Filtros por atributo (sidebar desktop) */}
          {attrConfig && attrValues.length > 1 && (
            <div className="border-t border-neutral-100">
              <div className="px-4 py-3 border-b border-neutral-100">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{attrConfig.label}</span>
              </div>
              <ul className="py-2">
                <li>
                  <button
                    onClick={() => setSelectedAttr('')}
                    className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${selectedAttr === ''
                      ? 'bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-500'
                      : 'text-neutral-700 hover:bg-neutral-50'}`}
                  >
                    {T.common.todos}
                  </button>
                </li>
                {attrValues.map(val => (
                  <li key={val}>
                    <button
                      onClick={() => setSelectedAttr(val === selectedAttr ? '' : val)}
                      className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${selectedAttr === val
                        ? 'bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-500'
                        : 'text-neutral-700 hover:bg-neutral-50'}`}
                    >
                      {val}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">

          {/* Barra superior */}
          <div className="mb-5 bg-white rounded-xl border border-neutral-200 px-3 sm:px-4 py-3 flex flex-col gap-2">
            {/* Filtros subcategoría móvil */}
            <div className="flex lg:hidden overflow-x-auto gap-1.5 scrollbar-none pb-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedCategory === cat
                    ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-400'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                >
                  {cat === 'Todos' ? T.common.todos : cat}
                </button>
              ))}
            </div>

            {/* Filtros por atributo móvil */}
            {attrConfig && attrValues.length > 1 && (
              <div className="flex lg:hidden overflow-x-auto gap-1.5 scrollbar-none pb-0.5">
                <span className="shrink-0 text-[10px] font-semibold text-neutral-400 uppercase self-center pr-1">{attrConfig.label}:</span>
                {attrValues.map(val => (
                  <button
                    key={val}
                    onClick={() => setSelectedAttr(val === selectedAttr ? '' : val)}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedAttr === val
                      ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-400'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            )}

            {/* Conteo + ordenar */}
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-neutral-500">
                <span className="font-semibold text-neutral-800">{filteredItems.length}</span> {T.common.productos}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="default">{T.common.ordenar}</option>
                <option value="price-asc">{T.common.precioAsc}</option>
                <option value="price-desc">{T.common.precioDesc}</option>
                <option value="name-asc">{T.common.az}</option>
                <option value="name-desc">{T.common.za}</option>
              </select>
            </div>
          </div>

          {/* Lista de productos */}
          {filteredItems.length === 0 ? (
            <p className="text-center opacity-70 py-16">{T.common.sinProductos}</p>
          ) : (
            <div className="product-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredItems.map((p) => {
                const hasOffer = p.offerPrice != null && p.offerPrice > 0 && p.offerPrice < p.price;
                const discount = hasOffer ? Math.round(((p.price - p.offerPrice!) / p.price) * 100) : 0;
                const formatPrice = (n: number) =>
                  n % 1 === 0 ? `${n} €` : n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
                return (
                  <Link
                    key={p.id}
                    href={`/electrodomesticos/${p.id}`}
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
                        src={p.fotos[0] || '/placeholders/electrodomesticos.svg'}
                        alt={p.name}
                        fill
                        className={`object-cover transition-transform duration-300 group-hover:scale-105 ${p.stock === 0 ? 'grayscale opacity-60' : ''}`}
                        sizes="(max-width: 768px) 50vw, 33vw"
                        unoptimized
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholders/electrodomesticos.svg'; }}
                      />
                      {p.stock === 0 ? (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded">
                            {T.common.vendido}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* Info */}
                    <div className="card-info p-3 flex flex-col">
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wide truncate">
                        {p.subcategoria || p.category}
                      </p>
                      <h3
                        className="mt-0.5 text-sm font-semibold text-neutral-900 group-hover:text-orange-600 transition-colors leading-snug"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {p.name}
                      </h3>
                      {p.price > 0 && (
                        <div className="flex flex-col mt-auto">
                          {hasOffer ? (
                            <>
                              <span className="text-base font-bold text-red-600 leading-none">{formatPrice(p.offerPrice!)}</span>
                              <span className="text-xs text-neutral-400 line-through">{T.common.antes} {formatPrice(p.price)}</span>
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
      </div>
    </>
  );
}
