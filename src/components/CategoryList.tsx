'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SUBCATEGORY_NAMES } from '@/lib/products';
import Image from 'next/image';
import Link from 'next/link';

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
};


interface CategoryListProps {
  collection: string;
  placeholder: string;
  detailBase: string;
}

export function CategoryList({ collection: collectionName, placeholder, detailBase }: CategoryListProps) {
  const searchParams = useSearchParams();
  const subcategoryParam = searchParams.get('subcategory') || '';

  const [items, setItems] = useState<CategoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<CategoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [sortBy, setSortBy] = useState<string>('default');
  const [loading, setLoading] = useState(true);

  const normalizeForCompare = (str: string) =>
    str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

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
    if (!subcategoryParam) {
      setSelectedCategory('Todos');
      return;
    }

    const normalized = normalizeSubcategorySlug(subcategoryParam);
    setSelectedCategory(normalized);
  }, [subcategoryParam]);

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
    if (sortBy === 'price-asc') updated.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    else if (sortBy === 'price-desc') updated.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    else if (sortBy === 'name-asc') updated.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'name-desc') updated.sort((a, b) => b.name.localeCompare(a.name));
    updated.sort((a, b) => ((a.stock ?? 0) === 0 ? 1 : 0) - ((b.stock ?? 0) === 0 ? 1 : 0));
    setFilteredItems(updated);
  }, [selectedCategory, sortBy, items]);

  const countFor = (cat: string) => {
    if (cat === 'Todos') return items.length;
    return items.filter((p) => normalizeForCompare(p.subcategoria || p.category || '') === normalizeForCompare(cat)).length;
  };

  if (loading) return <p className="opacity-70 py-10 text-center">Cargando productos…</p>;

  return (
    <div className="flex gap-6 items-start">

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-52 shrink-0 sticky top-24 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-100">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Categorías</span>
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

        {/* Barra superior: filtros móvil + sort + conteo */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 bg-white rounded-xl border border-neutral-200 px-4 py-3">
          {/* Filtros categoría (solo móvil) */}
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
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4" style={{ gridAutoRows: '280px' }}>
            {filteredItems.map((p) => {
              const hasOffer = p.offerPrice != null && p.offerPrice > 0 && p.price != null && p.offerPrice < p.price;
              const discount = hasOffer ? Math.round(((p.price! - p.offerPrice!) / p.price!) * 100) : 0;
              const formatPrice = (n: number) =>
                n % 1 === 0 ? `${n} €` : n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
              return (
                <Link
                  key={p.id}
                  href={`${detailBase}/${p.id}`}
                  className="group relative flex flex-col bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  {/* Badge porcentaje */}
                  {hasOffer && (p.stock ?? 0) !== 0 && (
                    <div className="absolute top-2 left-2 z-20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: '#f97316' }}>
                      -{discount}%
                    </div>
                  )}

                  {/* Imagen */}
                  <div className="relative bg-neutral-50 w-full shrink-0 overflow-hidden" style={{ height: '160px' }}>
                    <Image
                      src={p.fotos[0] || placeholder}
                      alt={p.name}
                      fill
                      className={`object-cover transition-transform duration-300 group-hover:scale-105 ${(p.stock ?? 0) === 0 ? 'grayscale opacity-60' : ''}`}
                      sizes="(max-width: 768px) 50vw, 33vw"
                      unoptimized
                      onError={(e) => { (e.target as HTMLImageElement).src = placeholder; }}
                    />
                    {(p.stock ?? 0) === 0 ? (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded">
                          Vendido
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Info */}
                  <div className="p-3 flex flex-col" style={{ height: '120px', overflow: 'hidden' }}>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wide truncate">{p.subcategoria || p.category}</p>
                    <h3
                      className="mt-0.5 text-sm font-semibold text-neutral-900 group-hover:text-orange-600 transition-colors leading-snug"
                      style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    >
                      {p.name}
                    </h3>
                    {(p.price ?? 0) > 0 && (
                      <div className="flex flex-col mt-auto">
                        {hasOffer ? (
                          <>
                            <span className="text-base font-bold text-red-600 leading-none">{formatPrice(p.offerPrice!)}</span>
                            <span className="text-xs text-neutral-400 line-through">Antes: {formatPrice(p.price!)}</span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-neutral-900">{formatPrice(p.price ?? 0)}</span>
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
  );
}
