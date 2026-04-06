'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SUBCATEGORY_NAMES } from '@/lib/products';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';

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

export function ElectroList() {
  const searchParams = useSearchParams();
  const subcategoryParam = searchParams.get('subcategory') || '';

  const [items, setItems] = useState<Product[]>([]);
  const [filteredItems, setFilteredItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const normalizeForCompare = (str: string) =>
    str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

  // Sincroniza el filtro con el parámetro de la URL (?subcategory=lavadora)
  const normalizeSubcategorySlug = (slug: string) => {
    const candidate = SUBCATEGORY_NAMES[slug.toLowerCase()];
    if (candidate) return candidate;
    const decoded = decodeURIComponent(slug || '').replace(/-/g, ' ');
    return decoded
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    if (!subcategoryParam) { setSelectedCategory('Todos'); return; }
    setSelectedCategory(normalizeSubcategorySlug(subcategoryParam));
  }, [subcategoryParam]);
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
    if (sortBy === 'price-asc') updated.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') updated.sort((a, b) => b.price - a.price);
    else if (sortBy === 'name-asc') updated.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'name-desc') updated.sort((a, b) => b.name.localeCompare(a.name));
    updated.sort((a, b) => (a.stock === 0 ? 1 : 0) - (b.stock === 0 ? 1 : 0));
    setFilteredItems(updated);
  }, [selectedCategory, sortBy, items]);

  const countFor = (cat: string) => {
    if (cat === 'Todos') return items.length;
    return items.filter((p) => normalizeForCompare(p.subcategoria || p.category) === normalizeForCompare(cat)).length;
  };

  if (loading) return <p className="opacity-70 py-10 text-center">Cargando productos…</p>;

  const matchedCategory = selectedCategory !== 'Todos' ? selectedCategory : null;

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
        </aside>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">

          {/* Barra superior */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 bg-white rounded-xl border border-neutral-200 px-4 py-3">
            <div className="flex lg:hidden flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedCategory === cat
                    ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-400'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <p className="hidden lg:block text-sm text-neutral-500">
              <span className="font-semibold text-neutral-800">{filteredItems.length}</span> productos
            </p>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="ml-auto rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="default">Ordenar por…</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="name-asc">Nombre: A–Z</option>
              <option value="name-desc">Nombre: Z–A</option>
            </select>
          </div>

          {/* Lista de productos */}
          {filteredItems.length === 0 ? (
            <p className="text-center opacity-70 py-16">No hay productos en esta categoría.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredItems.map((p) => (
                <Link
                  key={p.id}
                  href={`/electrodomesticos/${p.id}`}
                  className="group flex flex-row bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                  style={{ height: '160px' }}
                >
                  {/* Imagen */}
                  <div className="relative bg-neutral-50 shrink-0 overflow-hidden" style={{ width: '150px', minWidth: '150px' }}>
                    <Image
                      src={p.fotos[0] || '/placeholders/electrodomesticos.svg'}
                      alt={p.name}
                      fill
                      className={`object-contain p-3 transition-all${p.stock === 0 ? ' grayscale opacity-50' : ''}`}
                      sizes="150px"
                      unoptimized
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholders/electrodomesticos.svg'; }}
                    />
                    {p.offerPrice && p.offerPrice < p.price && p.stock !== 0 && (
                      <div className="absolute top-2 left-2 text-white text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: '#f97316' }}>
                        -{Math.round(((p.price - p.offerPrice) / p.price) * 100)}%
                      </div>
                    )}
                    {p.stock === 0 && (
                      <div className="absolute inset-x-0 bottom-0 bg-red-600 text-white text-[11px] font-black uppercase tracking-widest text-center py-1.5">
                        VENDIDO
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 flex flex-col justify-between flex-1 overflow-hidden">
                    <div>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wide truncate">{p.subcategoria || p.category}</p>
                      <h3 className="mt-0.5 text-sm font-semibold text-neutral-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                        {p.name}
                      </h3>
                      <p className="text-xs text-neutral-600 mt-1 line-clamp-2">{p.observaciones}</p>
                    </div>
                    {p.price > 0 && (
                      <div className="mt-1 flex flex-col">
                        {p.offerPrice && p.offerPrice < p.price ? (
                          <>
                            {/* Precio oferta grande */}
                            <span className="text-base font-bold text-red-600 leading-none">
                              {p.offerPrice.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                            </span>

                            {/* Precio original tachado */}
                            <span className="text-xs text-neutral-400 line-through">
                              Antes: {p.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-neutral-900">
                            {p.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
