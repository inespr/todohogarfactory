'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SUBCATEGORY_NAMES } from '@/lib/products';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProductListCard } from '@/components/ProductListCard';
import { fieldLabel } from '@/lib/productExtras';

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
  marca?: string;
  extras: Record<string, string>;
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
  frigorifico: {
    label: 'Tipo',
    extract: (name) => {
      const n = name.toLowerCase();
      if (/american[oa]/.test(n)) return 'Americano';
      if (/combi/.test(n)) return 'Combi';
      if (/\b2\s*puertas?\b/.test(n)) return '2 puertas';
      if (/\b1\s*puerta?\b/.test(n)) return '1 puerta';
      if (/minibar|mini\s*bar/.test(n)) return 'Minibar';
      return null;
    },
  },
  horno: {
    label: 'Tipo',
    extract: (name) => {
      const n = name.toLowerCase();
      if (/pirol[íi]tic[oa]/.test(n)) return 'Pirolítico';
      if (/hidrol[íi]tic[oa]|hidr[aá]ulic[oa]/.test(n)) return 'Hidrolítico';
      if (/vapor/.test(n)) return 'Vapor';
      if (/multifunci[oó]n/.test(n)) return 'Multifunción';
      if (/microondas/.test(n)) return 'Microondas';
      return null;
    },
  },
  vinoteca: {
    label: 'Capacidad',
    extract: (name) => {
      const m = name.match(/(\d+)\s*botellas?/i);
      return m ? `${m[1]} botellas` : null;
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
  const searchParams = useSearchParams();
  const subcategoryParam = searchParams.get('subcategory') || '';

  const [items, setItems] = useState<Product[]>([]);
  const [filteredItems, setFilteredItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedAttr, setSelectedAttr] = useState<string>('');

  const normalizeForCompare = (str: string) =>
    str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim().replace(/s$/, '');

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
        const EXCLUDED = new Set([
          'name', 'price', 'category', 'subcategoria', 'fotos',
          'urlImg', 'imageUrl', 'imagen', 'foto', 'img', 'url', 'image',
          'hasDefect', 'isOferta', 'stock', 'creadoEn', 'updatedAt', 'createdAt',
          'observaciones', 'marca', 'medidas', 'offerPrice',
        ]);
        const electroProducts: Product[] = snap.docs.map((d) => {
          const raw = d.data() as Record<string, unknown>;
          const extras: Record<string, string> = {};
          for (const [key, value] of Object.entries(raw)) {
            if (!EXCLUDED.has(key) && typeof value === 'string') {
              const v = value.trim();
              if (!v) continue;
              // Descarta valores cortos que parecen códigos internos (ej: "ts", "lv", "ab")
              if (v.length <= 3 && !/^\d+(\.\d+)?$/.test(v)) continue;
              extras[key] = v;
            }
          }
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
            marca: raw.marca as string | undefined,
            extras,
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

  if (loading) return <p className="opacity-70 py-10 text-center">Cargando productos…</p>;

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
        <aside className="hidden lg:flex flex-col w-56 shrink-0 sticky top-[90px] bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Filtrar</span>
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
                    <span>{cat}</span>
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
                    Todos
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
            <div className="flex lg:hidden overflow-x-auto gap-2 scrollbar-none -mx-3 sm:-mx-4 px-3 sm:px-4 pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={selectedCategory === cat
                    ? { backgroundColor: '#f97316', color: '#ffffff' }
                    : { backgroundColor: '#f3f4f6', color: '#4b5563' }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Filtros por atributo móvil */}
            {attrConfig && attrValues.length > 1 && (
              <div className="flex lg:hidden overflow-x-auto gap-2 scrollbar-none -mx-3 sm:-mx-4 px-3 sm:px-4 pb-1">
                <span className="shrink-0 text-[10px] font-semibold text-neutral-400 uppercase self-center pr-1">{attrConfig.label}:</span>
                {attrValues.map(val => (
                  <button
                    key={val}
                    onClick={() => setSelectedAttr(val === selectedAttr ? '' : val)}
                    className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={selectedAttr === val
                      ? { backgroundColor: '#f97316', color: '#ffffff' }
                      : { backgroundColor: '#f3f4f6', color: '#4b5563' }}
                  >
                    {val}
                  </button>
                ))}
              </div>
            )}

            {/* Conteo + ordenar */}
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-neutral-500">
                <span className="font-semibold text-neutral-800">{filteredItems.length}</span> productos
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

          {/* Lista de productos */}
          {filteredItems.length === 0 ? (
            <p className="text-center opacity-70 py-16">No hay productos en esta categoría.</p>
          ) : (
            <div className="list-grid">
              {filteredItems.map((p) => (
                <ProductListCard
                  key={p.id}
                  href={`/electrodomesticos/${p.id}`}
                  image={p.fotos[0] || ''}
                  placeholder="/placeholders/electrodomesticos.svg"
                  name={p.name}
                  subcategory={p.subcategoria || p.category}
                  price={p.price}
                  offerPrice={p.offerPrice}
                  stock={p.stock}
                  marca={p.marca}
                  specs={Object.entries(p.extras).slice(0, 6).map(([k, v]) => ({
                    label: fieldLabel(k),
                    value: v,
                  }))}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
