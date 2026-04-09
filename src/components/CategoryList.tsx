'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SUBCATEGORY_NAMES } from '@/lib/products';
import { ProductListCard } from '@/components/ProductListCard';
import { buildExtras, fieldLabel } from '@/lib/productExtras';

type CategoryItem = {
  id: string;
  name: string;
  observaciones: string;
  price?: number;
  offerPrice?: number;
  stock?: number;
  category: string;
  subcategoria?: string;
  fotos: string[];
  hasDefect?: boolean;
  marca?: string;
  extras: Record<string, string>;
};

interface CategoryListProps {
  collection: string;
  placeholder: string;
  detailBase: string;
}

// ── Filtros de atributo por subcategoría ─────────────────────────────────────
type AttrConfig = { label: string; extract: (name: string) => string | null };

const ATTR_CONFIG: Record<string, AttrConfig> = {
  // Sofás
  sofa: {
    label: 'Plazas',
    extract: (name) => {
      const m = name.match(/(\d)\s*plaza/i);
      if (m) return `${m[1]} plazas`;
      if (/individual/i.test(name)) return '1 plaza';
      return null;
    },
  },
  'sofa cama': {
    label: 'Plazas',
    extract: (name) => {
      const m = name.match(/(\d)\s*plaza/i);
      return m ? `${m[1]} plazas` : null;
    },
  },
  'chaise longue': {
    label: 'Orientación',
    extract: (name) => {
      if (/derech/i.test(name)) return 'Derecha';
      if (/izquier/i.test(name)) return 'Izquierda';
      return null;
    },
  },
  // Descanso
  colchon: {
    label: 'Medida',
    extract: (name) => {
      const m = name.match(/(\d{2,3})\s*(?:x|cm)/i);
      if (m) return `${m[1]} cm`;
      if (/90/i.test(name)) return '90 cm';
      if (/135/i.test(name)) return '135 cm';
      if (/150/i.test(name)) return '150 cm';
      if (/160/i.test(name)) return '160 cm';
      if (/180/i.test(name)) return '180 cm';
      return null;
    },
  },
  almohada: {
    label: 'Firmeza',
    extract: (name) => {
      if (/suave/i.test(name)) return 'Suave';
      if (/firm[ae]/i.test(name)) return 'Firme';
      if (/med[ia]/i.test(name)) return 'Media';
      if (/viscoelastica|visco/i.test(name)) return 'Viscoelástica';
      if (/fibra/i.test(name)) return 'Fibra';
      return null;
    },
  },
  edredon: {
    label: 'Relleno',
    extract: (name) => {
      if (/plum[oó]n|plumas/i.test(name)) return 'Plumón';
      if (/fibra/i.test(name)) return 'Fibra';
      if (/nordico|nórdico/i.test(name)) return 'Nórdico';
      return null;
    },
  },
  // Hogar
  cafetera: {
    label: 'Tipo',
    extract: (name) => {
      if (/italiana/i.test(name)) return 'Italiana';
      if (/capsulas|cápsulas/i.test(name)) return 'Cápsulas';
      if (/express/i.test(name)) return 'Expresso';
      if (/goteo/i.test(name)) return 'Goteo';
      if (/automatica|automática/i.test(name)) return 'Automática';
      return null;
    },
  },
};

function getAttrConfig(subcategory: string): AttrConfig | null {
  const key = subcategory
    .normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim().replace(/s$/, '');
  return ATTR_CONFIG[key] ?? null;
}

function getAttrValues(config: AttrConfig, items: CategoryItem[]): string[] {
  const vals = new Set<string>();
  items.forEach(p => { const v = config.extract(p.name); if (v) vals.add(v); });
  return [...vals].sort((a, b) => {
    const na = parseFloat(a), nb = parseFloat(b);
    return isNaN(na) || isNaN(nb) ? a.localeCompare(b) : na - nb;
  });
}
// ─────────────────────────────────────────────────────────────────────────────

export function CategoryList({ collection: collectionName, placeholder, detailBase }: CategoryListProps) {
  const searchParams = useSearchParams();
  const subcategoryParam = searchParams.get('subcategory') || '';

  const [items, setItems] = useState<CategoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<CategoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedAttr, setSelectedAttr] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');
  const [loading, setLoading] = useState(true);

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

  useEffect(() => { setSelectedAttr(''); }, [selectedCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, collectionName));
        const data: CategoryItem[] = snap.docs.map((d) => {
          const raw = d.data() as Record<string, unknown>;
          return {
            id: d.id,
            name: raw.name as string,
            observaciones: raw.observaciones as string || '',
            price: raw.price as number | undefined,
            offerPrice: raw.offerPrice as number | undefined,
            stock: typeof raw.stock === 'boolean' ? (raw.stock ? 1 : 0) : (raw.stock as number | undefined),
            category: raw.category as string || collectionName,
            subcategoria: raw.subcategoria as string || '',
            fotos: (() => {
              const arr = (raw.fotos as string[]) || [];
              if (arr.length > 0) return arr;
              const single = raw.urlImg || raw.imageUrl || raw.imagen || raw.foto || raw.img || raw.url || raw.image;
              return single ? [single as string] : [];
            })(),
            hasDefect: raw.hasDefect as boolean | undefined,
            marca: raw.marca as string | undefined,
            extras: buildExtras(raw),
          };
        });

        setItems(data);
        setFilteredItems(data);

        const seen = new Map<string, string>();
        data.forEach((p) => {
          const raw = (p.subcategoria || p.category || 'Sin categoría').trim();
          if (!seen.has(raw.toLowerCase())) seen.set(raw.toLowerCase(), raw);
        });
        setCategories(['Todos', ...Array.from(seen.values())]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [collectionName]);

  useEffect(() => {
    let updated = [...items];
    if (selectedCategory !== 'Todos') {
      if (selectedCategory === 'Ocasión') updated = updated.filter((p) => p.hasDefect);
      else updated = updated.filter((p) => normalizeForCompare(p.subcategoria || p.category || '') === normalizeForCompare(selectedCategory));
    }
    if (selectedAttr) {
      const config = getAttrConfig(selectedCategory);
      if (config) updated = updated.filter(p => config.extract(p.name) === selectedAttr);
    }
    if (sortBy === 'price-asc') updated.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    else if (sortBy === 'price-desc') updated.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    else if (sortBy === 'name-asc') updated.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'name-desc') updated.sort((a, b) => b.name.localeCompare(a.name));
    updated.sort((a, b) => ((a.stock ?? 0) === 0 ? 1 : 0) - ((b.stock ?? 0) === 0 ? 1 : 0));
    setFilteredItems(updated);
  }, [selectedCategory, selectedAttr, sortBy, items]);

  const countFor = (cat: string) => {
    if (cat === 'Todos') return items.length;
    return items.filter((p) => normalizeForCompare(p.subcategoria || p.category || '') === normalizeForCompare(cat)).length;
  };

  if (loading) return <p className="opacity-70 py-10 text-center">Cargando productos…</p>;

  const attrConfig = getAttrConfig(selectedCategory);
  const itemsInCategory = selectedCategory === 'Todos'
    ? items
    : items.filter(p => normalizeForCompare(p.subcategoria || p.category || '') === normalizeForCompare(selectedCategory));
  const attrValues = attrConfig ? getAttrValues(attrConfig, itemsInCategory) : [];

  return (
    <div className="flex gap-6 items-start">

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-52 shrink-0 sticky top-[90px] bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-100">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Filtrar</span>
        </div>
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
                    : 'text-neutral-700 hover:bg-neutral-50'}`}
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

        {/* Filtro por atributo (sidebar) */}
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
                href={`${detailBase}/${p.id}`}
                image={p.fotos[0] || ''}
                placeholder={placeholder}
                name={p.name}
                subcategory={p.subcategoria || p.category}
                price={p.price}
                offerPrice={p.offerPrice}
                stock={p.stock ?? 0}
                marca={p.marca}
                specs={Object.entries(p.extras).slice(0, 6).map(([k, v]) => ({ label: fieldLabel(k), value: v }))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
