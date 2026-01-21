'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';

// Componente para manejar errores de carga de imágenes
function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
    setImgError(false);
  }, [src]);

  if (imgError) {
    return (
      <div className="w-full h-40 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
        Error al cargar imagen
      </div>
    );
  }

  return (
    <div className="relative w-full h-40 rounded-md overflow-hidden bg-gray-200">
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        unoptimized={imgSrc.includes('firebasestorage') || imgSrc.includes('firebase')}
        onError={() => {
          console.error('Error cargando imagen:', imgSrc);
          setImgError(true);
        }}
      />
    </div>
  );
}

type ElectroItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: boolean; // true = disponible, false = no disponible
  category: string;
  urlImg?: string;
  hasDefect?: boolean; // 👈 nuevo campo para ocasión
};
type ElectroItemData = Omit<ElectroItem, 'id'>;

export function ElectroList() {
  const [items, setItems] = useState<ElectroItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ElectroItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [sortBy, setSortBy] = useState<string>('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'electrodomesticos'));
        const snap = await getDocs(q);
        const data: ElectroItem[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as ElectroItemData),
        }));

        setItems(data);
        setFilteredItems(data);

        // Categorías únicas + Ocasión
        const uniqueCategories = Array.from(
          new Set(data.map((p) => p.category || 'Sin categoría'))
        );
        setCategories(['Todos', 'Ocasión', ...uniqueCategories]);
      } catch (e: unknown) {
        console.error('Firestore error:', e);
        if (e && typeof e === 'object' && 'message' in e) {
          setError((e as { message: string }).message);
        } else {
          setError('Error al cargar productos');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtro por categoría + ocasión
  useEffect(() => {
    let updated = [...items];

    if (selectedCategory !== 'Todos') {
      if (selectedCategory === 'Ocasión') {
        updated = updated.filter((p) => p.hasDefect);
      } else {
        updated = updated.filter((p) => p.category === selectedCategory);
      }
    }

    // Ordenación
    if (sortBy === 'price-asc') {
      updated.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      updated.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      updated.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      updated.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFilteredItems(updated);
  }, [selectedCategory, sortBy, items]);

  if (loading) return <p className="opacity-70">Cargando productos…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1 rounded-lg text-sm font-medium transition ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Ordenar */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="default">Ordenar por…</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
            <option value="name-asc">Nombre: A-Z</option>
            <option value="name-desc">Nombre: Z-A</option>
          </select>
        </div>
      </div>

      {/* Lista de productos */}
      {filteredItems.length === 0 ? (
        <p className="opacity-70">No hay productos en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((p) => (
            <div
              key={p.id}
              className="relative rounded-lg border border-black/[.08] dark:border-white/[.145] p-6 space-y-2 bg-white shadow-sm hover:shadow-md transition"
            >
              {/* Badge de ocasión arriba a la izquierda */}
              {p.hasDefect && (
                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  Ocasión
                </div>
              )}

              {p.urlImg ? (
                <ProductImage src={p.urlImg} alt={p.name} />
              ) : (
                <div className="w-full h-40 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                  Sin imagen
                </div>
              )}

              <h3 className="font-semibold">{p.name}</h3>
              <p className="opacity-70 text-sm">{p.description}</p>

              <div className="flex items-center justify-between pt-2">
                <span className="font-medium">
                  {p.price?.toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </span>
                <span
                  className={`text-xs font-medium ${
                    p.stock ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {p.stock ? 'Disponible' : 'No disponible'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
