'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProductListCard } from '../components/ProductListCard';
import { buildExtras, fieldLabel } from '../lib/productExtras';

type Product = {
  id: string;
  name: string;
  observaciones: string;
  price: number;
  offerPrice?: number;
  fotos: string[];
  category: string;
  subcategoria?: string;
  stock: number;
  coleccion: string;
  marca?: string;
  extras: Record<string, string>;
};

const CATEGORIAS = [
  { key: 'electrodomesticos', label: 'Electrodomésticos', placeholder: '/placeholders/electrodomesticos.svg', href: '/electrodomesticos' },
  { key: 'sofas', label: 'Sofás', placeholder: '/placeholders/sofas.svg', href: '/sofas' },
  { key: 'hogar', label: 'Hogar', placeholder: '/placeholders/hogar.svg', href: '/hogar' },
  { key: 'descanso', label: 'Descanso', placeholder: '/placeholders/descanso.svg', href: '/descanso' },
];


function SectionHeader({ title, subtitle, href }: { title: string; subtitle?: string; href: string }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      <Link href={href} className="shrink-0 text-sm font-semibold text-orange-600 hover:text-orange-800 transition-colors">
        Ver más →
      </Link>
    </div>
  );
}

export default function Home() {
  const [ofertas, setOfertas] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const ofertasArr: Product[] = [];
        const catMap: Record<string, Product[]> = {};

        await Promise.all(
          CATEGORIAS.map(async ({ key, placeholder }) => {
            const snap = await getDocs(query(collection(db, key), limit(20)));
            const products: Product[] = snap.docs.map((d) => {
              const raw = d.data() as Record<string, unknown>;
              const fotosArr = (raw.fotos as string[]) || [];
              const singleImg = raw.urlImg || raw.imageUrl || raw.imagen || raw.foto || raw.img || raw.url || raw.image;
              return {
                id: d.id,
                name: raw.name as string,
                observaciones: (raw.observaciones as string) || '',
                price: (raw.price as number) ?? 0,
                offerPrice: raw.offerPrice as number | undefined,
                fotos: fotosArr.length > 0 ? fotosArr : (singleImg ? [singleImg as string] : []),
                category: (raw.category as string) || key,
                subcategoria: (raw.subcategoria as string) || '',
                stock: (raw.stock as number) ?? 0,
                coleccion: key,
                marca: raw.marca as string | undefined,
                extras: buildExtras(raw),
              };
            });

            // Productos en oferta con descuento
            products.forEach((p) => {
              if (p.offerPrice && p.offerPrice < p.price) {
                ofertasArr.push(p);
              }
            });

            // Primeros 4 para la sección de categoría
            catMap[key] = products.slice(0, 4);

            void placeholder;
          })
        );

        // Ordenar ofertas por % de descuento descendente, mostrar top 4
        ofertasArr.sort((a, b) => {
          const da = ((a.price - a.offerPrice!) / a.price) * 100;
          const db2 = ((b.price - b.offerPrice!) / b.price) * 100;
          return db2 - da;
        });
        setOfertas(ofertasArr.slice(0, 4));
        setCategorias(catMap);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <>
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-6 sm:py-10 flex flex-col">

        {/* Sección Ofertas */}
        {(loading || ofertas.length > 0) && (
          <section className="py-10 border-b border-neutral-200" style={{ borderImage: 'linear-gradient(to right, transparent, #e5e7eb 20%, #e5e7eb 80%, transparent) 1' }}>
            <SectionHeader
              title="Ofertas destacadas"
              subtitle="Los mejores descuentos del momento"
              href="/ofertas"
            />
            {loading ? (
              <p className="text-center opacity-60 py-10">Cargando…</p>
            ) : (
              <div className="list-grid">
                {ofertas.map((p) => (
                  <ProductListCard
                    key={`${p.coleccion}-${p.id}`}
                    href={`/${p.coleccion}/${p.id}`}
                    image={p.fotos[0] || ''}
                    placeholder={CATEGORIAS.find(c => c.key === p.coleccion)?.placeholder || '/placeholders/electrodomesticos.svg'}
                    name={p.name}
                    subcategory={p.subcategoria || p.category}
                    price={p.price}
                    offerPrice={p.offerPrice}
                    stock={p.stock}
                    marca={p.marca}
                    specs={Object.entries(p.extras).slice(0, 6).map(([k, v]) => ({ label: fieldLabel(k), value: v }))}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Secciones por categoría */}
        {CATEGORIAS.map(({ key, label, placeholder, href }, i) => {
          const items = categorias[key] || [];
          if (!loading && items.length === 0) return null;
          return (
            <section key={key} className={`py-10 ${i < CATEGORIAS.length - 1 ? 'border-b border-neutral-200' : ''}`} style={i < CATEGORIAS.length - 1 ? { borderImage: 'linear-gradient(to right, transparent, #e5e7eb 20%, #e5e7eb 80%, transparent) 1' } : {}}>
              <SectionHeader title={label} href={href} />
              {loading ? (
                <p className="text-center opacity-60 py-10">Cargando…</p>
              ) : (
                <div className="list-grid">
                  {items.map((p) => (
                    <ProductListCard
                      key={p.id}
                      href={`/${p.coleccion}/${p.id}`}
                      image={p.fotos[0] || ''}
                      placeholder={placeholder}
                      name={p.name}
                      subcategory={p.subcategoria || p.category}
                      price={p.price}
                      offerPrice={p.offerPrice}
                      stock={p.stock}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}

      </div>

      {/* Botón flotante de WhatsApp */}
      <a
        href="https://wa.me/34692211145?text=Hola%20quiero%20informaci%C3%B3n%20sobre%20Todo%20Hogar%20Factory"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        style={{
          position: 'fixed', right: '24px', bottom: '24px',
          width: '56px', height: '56px', borderRadius: '50%',
          backgroundColor: '#25D366', color: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 18px rgba(0,0,0,0.25)', zIndex: 9999, cursor: 'pointer',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M16.04 5C10.55 5 6.11 9.44 6.11 14.93c0 2.1.61 4.03 1.78 5.72L6 26.96l6.48-1.87a9.97 9.97 0 0 0 3.56.65h.01c5.49 0 9.93-4.44 9.93-9.93C26 9.44 21.55 5 16.04 5Zm0 17.9h-.01a8 8 0 0 1-3.43-.81l-.25-.12-3.84 1.11 1.03-3.75-.16-.27a7.9 7.9 0 0 1-1.22-4.24c0-4.38 3.57-7.95 7.96-7.95 2.13 0 4.13.83 5.63 2.33a7.9 7.9 0 0 1 2.33 5.63c0 4.39-3.57 7.96-7.94 7.96Zm4.36-5.97c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.18-.71-.63-1.19-1.41-1.33-1.64-.14-.24-.01-.36.11-.48.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.41-.54-.42-.14-.01-.3-.01-.46-.01-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.52.58.18 1.1.15 1.52.09.46-.07 1.43-.58 1.63-1.15.2-.57.2-1.06.14-1.15-.06-.09-.22-.16-.46-.28Z" />
        </svg>
      </a>
    </>
  );
}
