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

const ATTR_CONFIG: Record<string, AttrConfig[]> = {
  lavadora: [
    { label: 'Capacidad', extract: (n) => { const m = n.match(/(\d+)\s*kg/i); return m ? `${m[1]} kg` : null; } },
    { label: 'Tipo', extract: (n) => { const s = n.toLowerCase(); if (/frontal/.test(s)) return 'Frontal'; if (/superior|top\s*load/.test(s)) return 'Carga superior'; return null; } },
    { label: 'RPM', extract: (n) => { const m = n.match(/(\d{3,4})\s*rpm/i); return m ? `${m[1]} rpm` : null; } },
  ],
  lavadoras: [
    { label: 'Capacidad', extract: (n) => { const m = n.match(/(\d+)\s*kg/i); return m ? `${m[1]} kg` : null; } },
    { label: 'Tipo', extract: (n) => { const s = n.toLowerCase(); if (/frontal/.test(s)) return 'Frontal'; if (/superior|top\s*load/.test(s)) return 'Carga superior'; return null; } },
    { label: 'RPM', extract: (n) => { const m = n.match(/(\d{3,4})\s*rpm/i); return m ? `${m[1]} rpm` : null; } },
  ],
  lavavajillas: [
    { label: 'Cubiertos', extract: (n) => { const m = n.match(/(\d+)\s*cubiertos?/i); return m ? `${m[1]} cubiertos` : null; } },
    { label: 'Instalación', extract: (n) => { const s = n.toLowerCase(); if (/integr/.test(s)) return 'Integrable'; if (/libre/.test(s)) return 'Libre instalación'; return null; } },
  ],
  congelador: [
    { label: 'Tipo', extract: (n) => { const s = n.toLowerCase(); if (/arc[oó]n/.test(s)) return 'Arcón'; if (/vertical/.test(s)) return 'Vertical'; return null; } },
    { label: 'Capacidad', extract: (n) => { const m = n.match(/(\d+)\s*[lL](?:\b|$)/); return m ? `${m[1]} L` : null; } },
  ],
  congeladores: [
    { label: 'Tipo', extract: (n) => { const s = n.toLowerCase(); if (/arc[oó]n/.test(s)) return 'Arcón'; if (/vertical/.test(s)) return 'Vertical'; return null; } },
    { label: 'Capacidad', extract: (n) => { const m = n.match(/(\d+)\s*[lL](?:\b|$)/); return m ? `${m[1]} L` : null; } },
  ],
  frigorifico: [
    { label: 'Tipo', extract: (n) => { const s = n.toLowerCase(); if (/american[oa]/.test(s)) return 'Americano'; if (/combi/.test(s)) return 'Combi'; if (/\b2\s*puertas?\b/.test(s)) return '2 puertas'; if (/\b1\s*puerta?\b/.test(s)) return '1 puerta'; if (/minibar|mini\s*bar/.test(s)) return 'Minibar'; return null; } },
  ],
  frigorificos: [
    { label: 'Tipo', extract: (n) => { const s = n.toLowerCase(); if (/american[oa]/.test(s)) return 'Americano'; if (/combi/.test(s)) return 'Combi'; if (/\b2\s*puertas?\b/.test(s)) return '2 puertas'; if (/\b1\s*puerta?\b/.test(s)) return '1 puerta'; if (/minibar|mini\s*bar/.test(s)) return 'Minibar'; return null; } },
  ],
  horno: [
    { label: 'Tipo', extract: (n) => { const s = n.toLowerCase(); if (/pirol[íi]tic[oa]/.test(s)) return 'Pirolítico'; if (/hidrol[íi]tic[oa]|hidr[aá]ulic[oa]/.test(s)) return 'Hidrolítico'; if (/vapor/.test(s)) return 'Vapor'; if (/multifunci[oó]n/.test(s)) return 'Multifunción'; return null; } },
    { label: 'Capacidad', extract: (n) => { const m = n.match(/(\d+)\s*[lL](?:\b|$)/); return m ? `${m[1]} L` : null; } },
  ],
  hornos: [
    { label: 'Tipo', extract: (n) => { const s = n.toLowerCase(); if (/pirol[íi]tic[oa]/.test(s)) return 'Pirolítico'; if (/hidrol[íi]tic[oa]|hidr[aá]ulic[oa]/.test(s)) return 'Hidrolítico'; if (/vapor/.test(s)) return 'Vapor'; if (/multifunci[oó]n/.test(s)) return 'Multifunción'; return null; } },
    { label: 'Capacidad', extract: (n) => { const m = n.match(/(\d+)\s*[lL](?:\b|$)/); return m ? `${m[1]} L` : null; } },
  ],
  microondas: [
    { label: 'Capacidad', extract: (n) => { const m = n.match(/(\d+)\s*[lL](?:\b|$)/); return m ? `${m[1]} L` : null; } },
    { label: 'Potencia', extract: (n) => { const m = n.match(/(\d{3,4})\s*[wW](?:\b|$)/); return m ? `${m[1]} W` : null; } },
    { label: 'Tipo', extract: (n) => { const s = n.toLowerCase(); if (/grill/.test(s)) return 'Con grill'; if (/convec|aire/.test(s)) return 'Convección'; return null; } },
  ],
  secadora: [
    { label: 'Capacidad', extract: (n) => { const m = n.match(/(\d+)\s*kg/i); return m ? `${m[1]} kg` : null; } },
    { label: 'Tipo', extract: (n) => { const s = n.toLowerCase(); if (/bomba\s*de\s*calor|heat\s*pump/.test(s)) return 'Bomba de calor'; if (/condensaci[oó]n/.test(s)) return 'Condensación'; if (/evacuaci[oó]n/.test(s)) return 'Evacuación'; return null; } },
  ],
  secadoras: [
    { label: 'Capacidad', extract: (n) => { const m = n.match(/(\d+)\s*kg/i); return m ? `${m[1]} kg` : null; } },
    { label: 'Tipo', extract: (n) => { const s = n.toLowerCase(); if (/bomba\s*de\s*calor|heat\s*pump/.test(s)) return 'Bomba de calor'; if (/condensaci[oó]n/.test(s)) return 'Condensación'; if (/evacuaci[oó]n/.test(s)) return 'Evacuación'; return null; } },
  ],
  'lava-seca': [
    { label: 'Capacidad lavado', extract: (n) => { const m = n.match(/(\d+)\s*kg/i); return m ? `${m[1]} kg` : null; } },
  ],
  vinoteca: [
    { label: 'Capacidad', extract: (n) => { const m = n.match(/(\d+)\s*botellas?/i); return m ? `${m[1]} botellas` : null; } },
  ],
  vinotecas: [
    { label: 'Capacidad', extract: (n) => { const m = n.match(/(\d+)\s*botellas?/i); return m ? `${m[1]} botellas` : null; } },
  ],
  tostador: [
    { label: 'Tipo', extract: (n) => { const s = n.toLowerCase(); if (/plano|sandwi|gofre|waffle/.test(s)) return 'Plano'; if (/vertical/.test(s)) return 'Vertical'; return null; } },
    { label: 'Ranuras', extract: (n) => { const r = n.match(/(\d)\s*ranura/i); if (r) return `${r[1]} ranuras`; if (/\b4\b/.test(n)) return '4 ranuras'; if (/\b2\b/.test(n)) return '2 ranuras'; return null; } },
  ],
  tostadores: [
    { label: 'Tipo', extract: (n) => { const s = n.toLowerCase(); if (/plano|sandwi|gofre|waffle/.test(s)) return 'Plano'; if (/vertical/.test(s)) return 'Vertical'; return null; } },
    { label: 'Ranuras', extract: (n) => { const r = n.match(/(\d)\s*ranura/i); if (r) return `${r[1]} ranuras`; if (/\b4\b/.test(n)) return '4 ranuras'; if (/\b2\b/.test(n)) return '2 ranuras'; return null; } },
  ],
  placa: [
    { label: 'Tipo', extract: (n) => { const s = n.toLowerCase(); if (/inducci[oó]n/.test(s)) return 'Inducción'; if (/vitrocer[aá]mica|vitro/.test(s)) return 'Vitrocerámica'; if (/gas/.test(s)) return 'Gas'; return null; } },
    { label: 'Zonas', extract: (n) => { const m = n.match(/(\d)\s*zonas?/i); return m ? `${m[1]} zonas` : null; } },
  ],
  placas: [
    { label: 'Tipo', extract: (n) => { const s = n.toLowerCase(); if (/inducci[oó]n/.test(s)) return 'Inducción'; if (/vitrocer[aá]mica|vitro/.test(s)) return 'Vitrocerámica'; if (/gas/.test(s)) return 'Gas'; return null; } },
    { label: 'Zonas', extract: (n) => { const m = n.match(/(\d)\s*zonas?/i); return m ? `${m[1]} zonas` : null; } },
  ],
  campana: [
    { label: 'Tipo', extract: (n) => { const s = n.toLowerCase(); if (/telescop/.test(s)) return 'Telescópica'; if (/isla/.test(s)) return 'Isla'; if (/pared/.test(s)) return 'Pared'; if (/integr/.test(s)) return 'Integrable'; return null; } },
    { label: 'Ancho', extract: (n) => { const m = n.match(/(\d{2,3})\s*cm/i); return m ? `${m[1]} cm` : null; } },
  ],
  campanas: [
    { label: 'Tipo', extract: (n) => { const s = n.toLowerCase(); if (/telescop/.test(s)) return 'Telescópica'; if (/isla/.test(s)) return 'Isla'; if (/pared/.test(s)) return 'Pared'; if (/integr/.test(s)) return 'Integrable'; return null; } },
    { label: 'Ancho', extract: (n) => { const m = n.match(/(\d{2,3})\s*cm/i); return m ? `${m[1]} cm` : null; } },
  ],
  aspirador: [
    { label: 'Tipo', extract: (n) => { const s = n.toLowerCase(); if (/robot/.test(s)) return 'Robot'; if (/escoba|stick/.test(s)) return 'Escoba'; if (/sin\s*bolsa/.test(s)) return 'Sin bolsa'; if (/con\s*bolsa/.test(s)) return 'Con bolsa'; return null; } },
  ],
  aspiradores: [
    { label: 'Tipo', extract: (n) => { const s = n.toLowerCase(); if (/robot/.test(s)) return 'Robot'; if (/escoba|stick/.test(s)) return 'Escoba'; if (/sin\s*bolsa/.test(s)) return 'Sin bolsa'; if (/con\s*bolsa/.test(s)) return 'Con bolsa'; return null; } },
  ],
};

function getAttrConfigs(subcategory: string): AttrConfig[] {
  const key = subcategory
    .normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  return ATTR_CONFIG[key] ?? [];
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
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
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

  useEffect(() => { setSelectedAttrs({}); }, [selectedCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, 'electrodomesticos'));
        const EXCLUDED = new Set([
          'name', 'price', 'category', 'subcategoria', 'fotos',
          'urlImg', 'imageUrl', 'imagen', 'foto', 'img', 'url', 'image',
          'hasDefect', 'isOferta', 'stock', 'creadoEn', 'updatedAt', 'createdAt',
          'observaciones', 'marca', 'medidas', 'offerPrice', 'grupo',
        ]);
        const electroProducts: Product[] = snap.docs.map((d) => {
          const raw = d.data() as Record<string, unknown>;
          const extras: Record<string, string> = {};
          for (const [key, value] of Object.entries(raw)) {
            if (!EXCLUDED.has(key) && typeof value === 'string') {
              const v = value.trim();
              if (!v) continue;
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
          if (label && !seen.has(label)) { seen.add(label); cats.push(label); }
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
    // Aplica todos los filtros de atributo seleccionados
    const configs = getAttrConfigs(selectedCategory);
    configs.forEach((cfg) => {
      const val = selectedAttrs[cfg.label];
      if (val) updated = updated.filter(p => cfg.extract(p.name) === val);
    });
    const ep = (p: Product) => (p.offerPrice && p.offerPrice > 0 && p.offerPrice < p.price) ? p.offerPrice : p.price;
    if (sortBy === 'price-asc') updated.sort((a, b) => ep(a) - ep(b));
    else if (sortBy === 'price-desc') updated.sort((a, b) => ep(b) - ep(a));
    else if (sortBy === 'name-asc') updated.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'name-desc') updated.sort((a, b) => b.name.localeCompare(a.name));
    updated.sort((a, b) => (a.stock === 0 ? 1 : 0) - (b.stock === 0 ? 1 : 0));
    setFilteredItems(updated);
  }, [selectedCategory, selectedAttrs, sortBy, items]);

  const countFor = (cat: string) => {
    if (cat === 'Todos') return items.length;
    return items.filter((p) => normalizeForCompare(p.subcategoria || p.category) === normalizeForCompare(cat)).length;
  };

  const toggleAttr = (label: string, val: string) => {
    setSelectedAttrs(prev => ({ ...prev, [label]: prev[label] === val ? '' : val }));
  };

  if (loading) return <p className="opacity-70 py-10 text-center">Cargando productos…</p>;

  const matchedCategory = selectedCategory !== 'Todos' ? selectedCategory : null;
  const attrConfigs = getAttrConfigs(selectedCategory);
  const itemsInCategory = selectedCategory === 'Todos'
    ? items
    : items.filter(p => normalizeForCompare(p.subcategoria || p.category) === normalizeForCompare(selectedCategory));

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">
        Electrodomésticos
        {matchedCategory && <span className="text-neutral-400 font-normal"> › {matchedCategory}</span>}
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

          {/* Secciones de filtro por atributo */}
          {attrConfigs.map((cfg) => {
            const vals = getAttrValues(cfg, itemsInCategory);
            if (vals.length < 2) return null;
            const selected = selectedAttrs[cfg.label] || '';
            return (
              <div key={cfg.label} className="border-t border-neutral-100">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{cfg.label}</span>
                </div>
                <ul className="py-2">
                  <li>
                    <button
                      onClick={() => toggleAttr(cfg.label, '')}
                      className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${selected === ''
                        ? 'bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-500'
                        : 'text-neutral-700 hover:bg-neutral-50'}`}
                    >
                      Todos
                    </button>
                  </li>
                  {vals.map(val => (
                    <li key={val}>
                      <button
                        onClick={() => toggleAttr(cfg.label, val)}
                        className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${selected === val
                          ? 'bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-500'
                          : 'text-neutral-700 hover:bg-neutral-50'}`}
                      >
                        {val}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </aside>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">

          {/* Barra superior */}
          <div className="mb-5 bg-white rounded-xl border border-neutral-200 px-3 sm:px-4 py-3 flex flex-col gap-2">

            {/* Chips subcategoría móvil */}
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

            {/* Chips de atributos móvil */}
            {attrConfigs.map((cfg) => {
              const vals = getAttrValues(cfg, itemsInCategory);
              if (vals.length < 2) return null;
              const selected = selectedAttrs[cfg.label] || '';
              return (
                <div key={cfg.label} className="flex lg:hidden overflow-x-auto gap-2 scrollbar-none -mx-3 sm:-mx-4 px-3 sm:px-4 pb-1">
                  <span className="shrink-0 text-[10px] font-semibold text-neutral-400 uppercase self-center pr-1">{cfg.label}:</span>
                  {vals.map(val => (
                    <button
                      key={val}
                      onClick={() => toggleAttr(cfg.label, val)}
                      className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={selected === val
                        ? { backgroundColor: '#f97316', color: '#ffffff' }
                        : { backgroundColor: '#f3f4f6', color: '#4b5563' }}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              );
            })}

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
