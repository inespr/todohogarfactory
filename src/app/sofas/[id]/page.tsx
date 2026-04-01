'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShareProductButton } from '@/components/ShareProductButton';

type SofaItem = {
  id: string;
  name: string;
  observaciones: string;
  price: number;
  stock: number;
  category: string;
  subcategoria?: string;
  fotos: string[];
  hasDefect: boolean;
  marca?: string;
  medidas?: string;
  isOferta?: boolean;
};

export default function SofaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<SofaItem | null>(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, 'sofas', id));
        if (!snap.exists()) {
          setNotFound(true);
        } else {
          const raw = snap.data() as Record<string, unknown>;
          const fotosArr = (raw.fotos as string[]) || [];
          const singleImg = raw.urlImg || raw.imageUrl || raw.imagen || raw.foto || raw.img || raw.url || raw.image;
          const fotos = fotosArr.length > 0 ? fotosArr : (singleImg ? [singleImg as string] : []);
          const stockRaw = raw.stock;
          const stock = typeof stockRaw === 'boolean' ? (stockRaw ? 1 : 0) : ((stockRaw as number) ?? 0);
          setProduct({
            id: snap.id,
            name: raw.name as string || '',
            observaciones: (raw.observaciones as string) || (raw.description as string) || '',
            price: (raw.price as number) ?? 0,
            stock,
            category: (raw.category as string) || '',
            subcategoria: raw.subcategoria as string | undefined,
            fotos,
            hasDefect: (raw.hasDefect as boolean) || false,
            marca: raw.marca as string | undefined,
            medidas: raw.medidas as string | undefined,
            isOferta: raw.isOferta as boolean | undefined,
          });
        }
      } catch (e) {
        console.error(e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-10 opacity-70">Cargando producto…</div>;
  if (notFound || !product) return <div className="max-w-5xl mx-auto px-4 py-10">Producto no encontrado.</div>;

  const mainImg = product.fotos[selectedImg] || null;
  const precioFormateado = product.price > 0
    ? product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
    : null;

  const subcat = product.subcategoria || (
    product.category && product.category.toLowerCase() !== 'sofas' && product.category.toLowerCase() !== 'sofás'
      ? product.category : null
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-400 mb-6">
        <Link href="/" className="hover:text-neutral-700 transition-colors">Inicio</Link>
        <span>›</span>
        <Link href="/sofas" className="hover:text-neutral-700 transition-colors">Sofás</Link>
        {subcat && (
          <>
            <span>›</span>
            <Link href={`/sofas?subcategory=${encodeURIComponent(subcat.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, '-'))}`} className="hover:text-neutral-700 transition-colors">
              {subcat}
            </Link>
          </>
        )}
        <span>›</span>
        <span className="text-neutral-700 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

        {/* Imagen */}
        <div className="flex flex-col gap-3">
          <div className="relative bg-white rounded-2xl border border-neutral-200 overflow-hidden" style={{ height: '400px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainImg || '/placeholders/sofas.svg'}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '32px', cursor: 'pointer' }}
              onClick={() => setIsModalOpen(true)}
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholders/sofas.svg'; }}
            />
            {product.hasDefect && (
              <div className="absolute top-3 left-3 bg-amber-50 border border-amber-300 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                Ocasión
              </div>
            )}
            {product.isOferta && (
              <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                Oferta
              </div>
            )}
          </div>
          {product.fotos.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {product.fotos.map((foto, i) => (
                <div key={i} className="relative group">
                  <button
                    onClick={() => setSelectedImg(i)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all bg-white ${selectedImg === i ? 'border-orange-500 shadow-sm' : 'border-neutral-200 hover:border-neutral-400'}`}
                    style={{ width: '72px', height: '72px' }}
                  >
                    <Image src={foto} alt={`Foto ${i + 1}`} fill className="object-contain p-1.5" unoptimized />
                  </button>
                  {/* Tooltip con imagen más grande */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="bg-white border border-neutral-300 rounded-lg shadow-lg p-2">
                      <Image src={foto} alt={`Vista previa ${i + 1}`} width={200} height={200} className="object-contain rounded" unoptimized />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600 uppercase tracking-wide">
              Sofás
            </span>
            {subcat && (
              <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-semibold text-orange-700">
                {subcat}
              </span>
            )}
            {product.hasDefect && (
              <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700">
                Artículo de ocasión
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.stock > 0 ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
              {product.stock > 0 ? '● Disponible' : '● No disponible'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight">{product.name}</h1>

          {precioFormateado && (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-orange-600">{precioFormateado}</span>
              <span className="text-sm text-neutral-400">IVA incluido</span>
            </div>
          )}

          <hr className="border-neutral-200" />

          {(product.marca || product.medidas || product.observaciones) && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Características</h2>
              <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 space-y-3">
                {product.marca && (
                  <div className="flex items-center gap-3">
                    <span className="text-orange-500">•</span>
                    <span className="text-sm font-medium text-neutral-600 min-w-0 flex-shrink-0">Marca</span>
                    <span className="text-sm text-neutral-900">{product.marca}</span>
                  </div>
                )}
                {product.medidas && (
                  <div className="flex items-center gap-3">
                    <span className="text-orange-500">•</span>
                    <span className="text-sm font-medium text-neutral-600 min-w-0 flex-shrink-0">Medidas</span>
                    <span className="text-sm text-neutral-900">{product.medidas}</span>
                  </div>
                )}
                {product.observaciones && (
                  <div className="flex items-start gap-3">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span className="text-sm font-medium text-neutral-600 min-w-0 flex-shrink-0">Notas</span>
                    <span className="text-sm text-neutral-900">{product.observaciones}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <hr className="border-neutral-200" />

          <div className="flex flex-col gap-3">
            <p className="text-sm text-neutral-500">Contáctanos para disponibilidad, precio final y transporte.</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://wa.me/34692211145?text=Hola%2C%20me%20interesa%20el%20producto%3A%20${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
                style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                  <path d="M16.04 5C10.55 5 6.11 9.44 6.11 14.93c0 2.1.61 4.03 1.78 5.72L6 26.96l6.48-1.87a9.97 9.97 0 0 0 3.56.65h.01c5.49 0 9.93-4.44 9.93-9.93C26 9.44 21.55 5 16.04 5Zm0 17.9h-.01a8 8 0 0 1-3.43-.81l-.25-.12-3.84 1.11 1.03-3.75-.16-.27a7.9 7.9 0 0 1-1.22-4.24c0-4.38 3.57-7.95 7.96-7.95 2.13 0 4.13.83 5.63 2.33a7.9 7.9 0 0 1 2.33 5.63c0 4.39-3.57 7.96-7.94 7.96Z" />
                </svg>
                WhatsApp
              </a>
              <Link href="/contacto" className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ border: '1px solid #d4d4d4', color: '#404040' }}>
                Contacto
              </Link>
              <ShareProductButton title={product.name} description={product.observaciones} />
            </div>
          </div>
        </div>

      </div>

      {/* Modal para imagen grande */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 sm:p-8 z-50" onClick={() => setIsModalOpen(false)}>
          <div className="relative w-full max-w-[92vw] max-h-[92vh] rounded-xl bg-white p-2 sm:p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={mainImg || '/placeholders/sofas.svg'}
              alt={product.name}
              className="w-full h-full max-h-[84vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 bg-white/90 text-gray-700 rounded-full w-9 h-9 flex items-center justify-center text-lg font-bold shadow-sm hover:bg-white transition"
              aria-label="Cerrar vista detallada"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
