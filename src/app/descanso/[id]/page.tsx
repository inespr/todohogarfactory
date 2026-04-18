'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ShareProductButton } from '@/components/ShareProductButton';

type CoMedida = {
  medida: string;
  precio: number;
  precioOferta?: number;
};

type DescansoItem = {
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
  offerPrice?: number;
  // Colchón specific
  coMedidas?: CoMedida[];
  coModelo?: string;
  coNucleo?: string;
  coParaCanape?: boolean;
  coValAdaptacion?: number;
  coValDurabilidad?: number;
  coValFirmeza?: number;
};

export default function DescansoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<DescansoItem | null>(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedida, setSelectedMedida] = useState(0);
  const [barsReady, setBarsReady] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, 'descanso', id));
        if (!snap.exists()) {
          setNotFound(true);
        } else {
          const raw = snap.data() as Record<string, unknown>;
          const fotosArr = (raw.fotos as string[]) || [];
          const singleImg = raw.urlImg || raw.imageUrl || raw.imagen || raw.foto || raw.img || raw.url || raw.image;
          const fotos = fotosArr.length > 0 ? fotosArr : (singleImg ? [singleImg as string] : []);
          const stockRaw = raw.stock;
          const stock = typeof stockRaw === 'boolean' ? (stockRaw ? 1 : 0) : ((stockRaw as number) ?? 0);
          const coMedidasRaw = raw.coMedidas as Array<Record<string, unknown>> | undefined;
          const coMedidas: CoMedida[] | undefined = coMedidasRaw?.map((m) => ({
            medida: m.medida as string,
            precio: m.precio as number,
            precioOferta: m.precioOferta as number | undefined,
          }));
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
            offerPrice: raw.offerPrice as number | undefined,
            coMedidas,
            coModelo: raw.coModelo as string | undefined,
            coNucleo: raw.coNucleo as string | undefined,
            coParaCanape: raw.coParaCanape as boolean | undefined,
            coValAdaptacion: raw.coValAdaptacion as number | undefined,
            coValDurabilidad: raw.coValDurabilidad as number | undefined,
            coValFirmeza: raw.coValFirmeza as number | undefined,
          });
        }
      } catch (e) {
        console.error(e);
        setNotFound(true);
      } finally {
        setLoading(false);
        // Pequeño delay para que la barra arranque desde 0 y se vea el fill
        setTimeout(() => setBarsReady(true), 100);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-4 animate-fade-in">
      <div className="skeleton h-5 w-48" />
      <div className="flex gap-8 mt-2">
        <div className="skeleton flex-1 h-80 rounded-2xl" />
        <div className="flex-1 flex flex-col gap-3">
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-4 w-1/3" />
          <div className="skeleton h-4 w-full mt-4" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-10 w-32 mt-4" />
        </div>
      </div>
    </div>
  );
  if (notFound || !product) return <div className="max-w-6xl mx-auto px-4 py-10">Producto no encontrado.</div>;

  const mainImg = product.fotos[selectedImg] || null;

  // Si hay coMedidas, el precio viene de la medida seleccionada
  const activeMedida = product.coMedidas?.[selectedMedida];
  const activePrice = activeMedida ? activeMedida.precio : product.price;
  const activeOfferPrice = activeMedida ? activeMedida.precioOferta : product.offerPrice;

  const fmt = (v: number) =>
    v % 1 === 0 ? `${v} €` : v.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  const precioFormateado = activePrice > 0 ? fmt(activePrice) : null;
  const ofertaFormateado = activeOfferPrice ? fmt(activeOfferPrice) : null;

  const subcat = product.subcategoria || (
    product.category && product.category.toLowerCase() !== 'descanso'
      ? product.category : null
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-4">
        ← Volver
      </button>
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-400 mb-6">
        <Link href="/" className="hover:text-neutral-700 transition-colors">Inicio</Link>
        <span>›</span>
        <Link href="/descanso" className="hover:text-neutral-700 transition-colors">Descanso</Link>
        {subcat && (
          <>
            <span>›</span>
            <Link href={`/descanso?subcategory=${encodeURIComponent(subcat.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, '-'))}`} className="hover:text-neutral-700 transition-colors">
              {subcat}
            </Link>
          </>
        )}
        <span>›</span>
        <span className="text-neutral-700 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="detail-grid">

        {/* Columna imágenes */}
        <div className="flex flex-col gap-3 animate-slide-left">
          {/* Imagen principal */}
          <div className="relative bg-white rounded-2xl border border-neutral-200 overflow-hidden" style={{ aspectRatio: '1/1', maxHeight: '780px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainImg || '/placeholders/descanso.svg'}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '32px', cursor: 'pointer' }}
              onClick={() => setIsModalOpen(true)}
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholders/descanso.svg'; }}
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

          {/* Miniaturas */}
          {product.fotos.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {product.fotos.map((foto, i) => (
                <div key={i} className="relative group">
                  <button
                    onClick={() => setSelectedImg(i)}
                    className={`relative w-18 h-18 rounded-xl overflow-hidden border-2 transition-all bg-white ${selectedImg === i ? 'border-orange-500 shadow-sm' : 'border-neutral-200 hover:border-neutral-400'}`}
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

        {/* Columna info */}
        <div className="flex flex-col gap-5 animate-slide-up anim-d100">

          {/* Nombre */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight">{product.name}</h1>
            {/* Badges inline bajo el nombre */}
            <div className="flex flex-wrap gap-2 mt-2">
              {subcat && (
                <span className="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-xs font-semibold text-orange-700">
                  {subcat}
                </span>
              )}
              {product.hasDefect && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700">
                  Artículo de ocasión
                </span>
              )}
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${product.stock > 0 ? 'border text-white' : 'bg-red-50 border border-red-200 text-red-600'}`} style={product.stock > 0 ? { backgroundColor: '#16a34a', borderColor: '#15803d' } : {}}>
                {product.stock > 0 ? '● Disponible' : '● Entra para pedirlo'}
              </span>
            </div>
          </div>

          {product.stock === 0 && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 flex flex-col gap-3">
              <p className="text-sm font-semibold text-orange-800">Este artículo está vendido pero se puede encargar</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://wa.me/34692211145?text=Hola%2C%20quiero%20encargar%3A%20${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ backgroundColor: '#16a34a' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-4 h-4" fill="currentColor" aria-hidden="true"><path d="M16.04 5C10.55 5 6.11 9.44 6.11 14.93c0 2.1.61 4.03 1.78 5.72L6 26.96l6.48-1.87a9.97 9.97 0 0 0 3.56.65h.01c5.49 0 9.93-4.44 9.93-9.93C26 9.44 21.55 5 16.04 5Zm0 17.9h-.01a8 8 0 0 1-3.43-.81l-.25-.12-3.84 1.11 1.03-3.75-.16-.27a7.9 7.9 0 0 1-1.22-4.24c0-4.38 3.57-7.95 7.96-7.95 2.13 0 4.13.83 5.63 2.33a7.9 7.9 0 0 1 2.33 5.63c0 4.39-3.57 7.96-7.94 7.96Z" /></svg>
                  Encargar por WhatsApp
                </a>
                <a
                  href="tel:+34692211145"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-neutral-300 text-neutral-700 bg-white"
                >
                  📞 Llamar: 692 211 145
                </a>
              </div>
            </div>
          )}

          {/* Descripción */}
          {product.observaciones && (
            <p className="text-sm text-neutral-600 leading-relaxed">{product.observaciones}</p>
          )}

          {/* Barras de valoración */}
          {(product.coValFirmeza !== undefined || product.coValDurabilidad !== undefined || product.coValAdaptacion !== undefined) && (
            <div className="flex flex-col gap-3">
              {[
                { label: 'Firmeza', value: product.coValFirmeza },
                { label: 'Adaptación', value: product.coValAdaptacion },
                { label: 'Durabilidad', value: product.coValDurabilidad },
              ].map(({ label, value }) =>
                value !== undefined ? (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-neutral-500 w-24 flex-shrink-0">{label}</span>
                    <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: barsReady ? `${value}%` : '0%',
                          backgroundColor: value >= 70 ? '#16a34a' : value >= 40 ? '#f97316' : '#dc2626',
                          transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
                        }}
                      />
                    </div>
                    <span className="text-xs text-neutral-400 w-9 text-right flex-shrink-0">{value}%</span>
                  </div>
                ) : null
              )}
            </div>
          )}

          <hr className="border-neutral-200" />

          {/* Selector de medidas */}
          {product.coMedidas && product.coMedidas.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Medida</h2>
              <div className="flex flex-wrap gap-2">
                {product.coMedidas.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedMedida(i)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all active:scale-95 ${selectedMedida === i
                        ? 'border-orange-500 bg-orange-50 text-orange-700 scale-[1.02]'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:scale-[1.02]'
                      }`}
                  >
                    {m.medida}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Precio */}
          {precioFormateado && (
            <div className="flex flex-col gap-2">
              {product.stock !== 0 && activeOfferPrice && activeOfferPrice < activePrice && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: '#f97316', color: '#ffffff' }}>
                    -{Math.round(((activePrice - activeOfferPrice) / activePrice) * 100)}%
                  </span>
                  <span className="text-neutral-400 line-through text-lg">
                    {fmt(activePrice)}
                  </span>
                </div>
              )}
              <span className={`leading-none ${product.stock === 0 ? 'text-2xl font-semibold text-neutral-400' : 'text-4xl font-extrabold text-red-600'}`}>
                {activeOfferPrice && activeOfferPrice < activePrice && product.stock !== 0 ? ofertaFormateado : precioFormateado}
              </span>
              <div className="flex flex-col text-sm text-neutral-500 gap-1">
                <span className="underline cursor-pointer">IVA incl.</span>
                {product.stock === 0 && <span className="text-xs text-neutral-400">* precio orientativo, puede variar</span>}
                <span className="underline cursor-pointer text-blue-600">Envío disponible</span>
                <span className="text-emerald-700 font-semibold">✓ Garantía 3 años en todos nuestros productos</span>
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
          {(product.marca || product.medidas || product.coModelo || product.coNucleo || product.coParaCanape !== undefined) && (
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Características</h2>
              <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-2">
                {product.marca && (
                  <div className="flex items-center gap-3 border-b border-neutral-100 pb-2">
                    <span className="text-orange-500 flex-shrink-0">•</span>
                    <span className="text-sm font-medium text-neutral-600 w-28 flex-shrink-0">Marca</span>
                    <span className="text-sm text-neutral-900">{product.marca}</span>
                  </div>
                )}
                {product.coModelo && (
                  <div className="flex items-center gap-3 border-b border-neutral-100 pb-2">
                    <span className="text-orange-500 flex-shrink-0">•</span>
                    <span className="text-sm font-medium text-neutral-600 w-28 flex-shrink-0">Modelo</span>
                    <span className="text-sm text-neutral-900">{product.coModelo}</span>
                  </div>
                )}
                {product.coNucleo && (
                  <div className="flex items-center gap-3 border-b border-neutral-100 pb-2">
                    <span className="text-orange-500 flex-shrink-0">•</span>
                    <span className="text-sm font-medium text-neutral-600 w-28 flex-shrink-0">Núcleo</span>
                    <span className="text-sm text-neutral-900">{product.coNucleo}</span>
                  </div>
                )}
                {product.coParaCanape !== undefined && (
                  <div className="flex items-center gap-3">
                    <span className="text-orange-500 flex-shrink-0">•</span>
                    <span className="text-sm font-medium text-neutral-600 w-28 flex-shrink-0">Para canapé</span>
                    <span className="text-sm text-neutral-900">{product.coParaCanape ? 'Sí' : 'No'}</span>
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
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex items-center px-4 py-3 border-b">
              <span className="text-sm font-medium text-gray-600 truncate pr-10">{product.name}</span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-3 flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
                aria-label="Cerrar vista detallada"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <Image
                src={mainImg || '/placeholders/descanso.svg'}
                alt={product.name}
                height={300}
                width={300}
                className="w-full max-h-[75vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
