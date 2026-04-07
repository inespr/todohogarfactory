'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';

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
  observaciones: string;
  price: number;
  offerPrice?: number;
  fotos: string[];
  category: string;
  subcategoria?: string;
  stock: number;
  coleccion: Coleccion;
};

export default function OfertasPage() {
  const [products, setProducts] = useState<OfertaProduct[]>([]);
  const [loading, setLoading] = useState(true);

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
                observaciones: (raw.observaciones as string) || (raw.description as string) || '',
                price: (raw.price as number) ?? 0,
                offerPrice: raw.offerPrice as number | undefined,
                fotos,
                category: (raw.category as string) || '',
                subcategoria: (raw.subcategoria as string) || '',
                stock: (raw.stock as number) ?? 0,
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

  if (loading) return <div className="max-w-6xl mx-auto px-6 py-10 opacity-70">Cargando ofertas…</div>;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-400 mb-6">
        <Link href="/" className="hover:text-neutral-700 transition-colors">Inicio</Link>
        <span>›</span>
        <span className="text-neutral-700 font-medium">Ofertas</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">Ofertas</h1>
        <p className="mt-1 text-sm text-neutral-500">Productos seleccionados a precio especial.</p>
      </div>

      {products.length === 0 ? (
        <p className="text-center opacity-70 py-16">No hay productos en oferta en este momento.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard
              key={`${p.coleccion}-${p.id}`}
              href={`/${p.coleccion}/${p.id}`}
              image={p.fotos[0] || ''}
              placeholder={PLACEHOLDER[p.coleccion]}
              name={p.name}
              subcategory={p.subcategoria || p.category || COLECCION_LABEL[p.coleccion]}
              price={p.price}
              offerPrice={p.offerPrice}
              stock={p.stock}
            />
          ))}
        </div>
      )}
    </div>
  );
}
