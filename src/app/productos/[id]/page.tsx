'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { ShareProductButton } from '@/components/ShareProductButton';

type ProductData = {
  id: string;
  name: string;
  observaciones: string;
  price: number;
  stock: number;
  category: string;
  fotos: string[];
  hasDefect: boolean;
  marca?: string;
  medidas?: string;
  offerPrice?: number;
};

type ProductCategory = 'electrodomesticos' | 'sofas' | 'hogar' | 'descanso';

const COLLECTIONS: ProductCategory[] = ['electrodomesticos', 'sofas', 'hogar', 'descanso'];

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  electrodomesticos: 'Electrodomésticos',
  sofas: 'Sofás',
  hogar: 'Hogar',
  descanso: 'Descanso',
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ProductData & { collectionName: ProductCategory } | null>(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        for (const col of COLLECTIONS) {
          const snap = await getDocs(query(collection(db, col), where('__name__', '==', id)));
          if (!snap.empty) {
            const docSnap = snap.docs[0];
            const raw = docSnap.data() as Record<string, unknown>;
            setProduct({
              id: docSnap.id,
              name: raw.name as string,
              observaciones: raw.observaciones as string || '',
              price: raw.price as number ?? 0,
              stock: raw.stock as number ?? 0,
              category: raw.category as string || '',
              fotos: (raw.fotos as string[]) || [],
              hasDefect: raw.hasDefect as boolean || false,
              marca: raw.marca as string | undefined,
              medidas: raw.medidas as string | undefined,
              offerPrice: raw.offerPrice as number | undefined,
              collectionName: col,
            });
            return;
          }
        }
        setNotFound(true);
      } catch (e) {
        console.error(e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-10 opacity-70">Cargando producto…</div>;
  if (notFound || !product) return <div className="max-w-6xl mx-auto px-4 py-10">Producto no encontrado.</div>;

  const mainImg = product.fotos?.[selectedImg] || null;
  const precioFormateado = product.price > 0
    ? (product.price % 1 === 0
      ? `${product.price} €`
      : product.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €')
    : null;
  const ofertaFormateado = product.offerPrice
    ? (product.offerPrice % 1 === 0
      ? `${product.offerPrice} €`
      : product.offerPrice.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €')
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-4">
        ← Volver
      </button>
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-400 mb-6">
        <Link href="/" className="hover:text-neutral-700 transition-colors">Inicio</Link>
        <span>›</span>
        <Link href={`/${product.collectionName}`} className="hover:text-neutral-700 transition-colors">
          {CATEGORY_LABELS[product.collectionName]}
        </Link>
        {product.category && (
          <>
            <span>›</span>
            <Link href={`/${product.collectionName}?subcategory=${encodeURIComponent(product.category.toLowerCase().replace(/\s+/g, '-'))}`} className="hover:text-neutral-700 transition-colors">
              {product.category}
            </Link>
          </>
        )}
        <span>›</span>
        <span className="text-neutral-700 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

        {/* Columna imágenes */}
        <div className="flex flex-col gap-3">
          {/* Imagen principal */}
          <div className="relative bg-white rounded-2xl border border-neutral-200 overflow-hidden" style={{ height: '480px' }}>
            {mainImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mainImg}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '32px', cursor: 'pointer' }}
                onClick={() => setIsModalOpen(true)}
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholders/electrodomesticos.svg'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image
                  src="/placeholders/electrodomesticos.svg"
                  alt={product.name}
                  width={300}
                  height={300}
                  className="opacity-50"
                />
              </div>
            )}
            {product.hasDefect && (
              <div className="absolute top-3 left-3 bg-amber-50 border border-amber-300 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                Ocasión
              </div>
            )}
          </div>

          {/* Miniaturas */}
          {product.fotos && product.fotos.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {product.fotos.map((foto, idx) => (
                <div key={idx} className="relative group">
                  <button
                    onClick={() => setSelectedImg(idx)}
                    className={`relative w-18 h-18 rounded-xl overflow-hidden border-2 transition-all bg-white ${selectedImg === idx ? 'border-orange-500 shadow-sm' : 'border-neutral-200 hover:border-neutral-400'}`}
                    style={{ width: '72px', height: '72px' }}
                  >
                    <Image src={foto} alt={`Foto ${idx + 1}`} fill className="object-contain p-1.5" unoptimized />
                  </button>
                  {/* Tooltip con imagen más grande */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="bg-white border border-neutral-300 rounded-lg shadow-lg p-2">
                      <Image src={foto} alt={`Vista previa ${idx + 1}`} width={200} height={200} className="object-contain rounded" unoptimized />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna info */}
        <div className="flex flex-col gap-6">
          {/* Nombre */}
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight">{product.name}</h1>

          {/* Badges estado */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600 uppercase tracking-wide">
              {CATEGORY_LABELS[product.collectionName]}
            </span>
            {product.hasDefect && (
              <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700">
                Artículo de ocasión
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.stock > 0 ? 'border text-white' : 'bg-red-50 border border-red-200 text-red-600'}`} style={product.stock > 0 ? { backgroundColor: '#16a34a', borderColor: '#15803d' } : {}}>
              {product.stock > 0 ? '● Disponible' : '● Agotado'}
            </span>
          </div>

          {/* Precio */}
          {precioFormateado && (
            <div className="flex flex-col gap-2">

              {product.offerPrice && product.offerPrice < product.price && (
                <div className="flex items-center gap-2">
                  {/* % descuento */}
                  <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: '#f97316', color: '#ffffff' }}>
                    -{Math.round(((product.price - product.offerPrice) / product.price) * 100)}%
                  </span>
                  {/* Precio original tachado */}
                  <span className="text-neutral-400 line-through text-lg">
                    {precioFormateado}
                  </span>
                </div>
              )}

              {/* Precio principal */}
              <span className="text-4xl font-extrabold text-red-600 leading-none">
                {product.offerPrice && product.offerPrice < product.price
                  ? ofertaFormateado
                  : precioFormateado}
              </span>

              {/* Info extra */}
              <div className="flex flex-col text-sm text-neutral-500 gap-1">
                <span className="underline cursor-pointer">IVA incl.</span>
                <span className="underline cursor-pointer text-blue-600">Envío disponible</span>
              </div>

              {/* Botones WhatsApp y Compartir */}
              <div className="flex flex-wrap gap-3 pt-1">
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
                <ShareProductButton title={product.name} description={product.observaciones} />
              </div>
            </div>
          )}

          <hr className="border-neutral-200" />

          {/* Características */}
          {(product.marca || product.medidas || product.category || product.stock !== undefined || product.observaciones) && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Características</h2>
              <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-2">
                {product.marca && (
                  <div className="flex items-center gap-3 border-b border-neutral-100 pb-2">
                    <span className="text-orange-500 flex-shrink-0">•</span>
                    <span className="text-sm font-medium text-neutral-600 w-28 flex-shrink-0">Marca</span>
                    <span className="text-sm text-neutral-900">{product.marca}</span>
                  </div>
                )}
                {product.medidas && (
                  <div className="flex items-center gap-3 border-b border-neutral-100 pb-2">
                    <span className="text-orange-500 flex-shrink-0">•</span>
                    <span className="text-sm font-medium text-neutral-600 w-28 flex-shrink-0">Medidas</span>
                    <span className="text-sm text-neutral-900">{product.medidas}</span>
                  </div>
                )}
                {product.category && (
                  <div className="flex items-center gap-3 border-b border-neutral-100 pb-2">
                    <span className="text-orange-500 flex-shrink-0">•</span>
                    <span className="text-sm font-medium text-neutral-600 w-28 flex-shrink-0">Categoría</span>
                    <span className="text-sm text-neutral-900">{product.category}</span>
                  </div>
                )}
                {product.stock !== undefined && (
                  <div className="flex items-center gap-3 border-b border-neutral-100 pb-2">
                    <span className="text-orange-500 flex-shrink-0">•</span>
                    <span className="text-sm font-medium text-neutral-600 w-28 flex-shrink-0">Stock</span>
                    <span className="text-sm text-neutral-900">{product.stock > 0 ? `${product.stock} unidades` : 'Agotado'}</span>
                  </div>
                )}
                {product.observaciones && (
                  <div className="flex items-start gap-3">
                    <span className="text-orange-500 flex-shrink-0 mt-0.5">•</span>
                    <span className="text-sm font-medium text-neutral-600 w-28 flex-shrink-0">Notas</span>
                    <span className="text-sm text-neutral-900">{product.observaciones}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <hr className="border-neutral-200" />

          {/* Botón Contacto */}
          <div className="flex flex-wrap gap-3">
            <Link href="/contacto" className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ border: '1px solid #d4d4d4', color: '#404040' }}>
              Contacto
            </Link>
          </div>
        </div>

      </div>

      {/* Modal para imagen grande */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50" onClick={() => setIsModalOpen(false)}>
          <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex items-center px-4 py-3 border-b">
              <span className="text-sm font-medium text-gray-600 truncate pr-10">{product.name}</span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-3 flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
                aria-label="Cerrar vista detallada"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="p-4">
              <Image
                src={mainImg || '/placeholders/electrodomesticos.svg'}
                alt={product.name}
                className="w-full max-h-[75vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
