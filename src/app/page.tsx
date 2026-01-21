'use client';

import Link from 'next/link';
import { PRODUCTS, Product } from '../lib/products';
import { Card as UiCard, CardHeader, CardBody } from '../components/Card';

function getFeaturedProducts(): Product[] {
  const el = PRODUCTS.filter((p) => p.category === 'electrodomesticos').slice(0, 2);
  const sf = PRODUCTS.filter((p) => p.category === 'sofas').slice(0, 2);
  const hg = PRODUCTS.filter((p) => p.category === 'hogar').slice(0, 2);
  return [...el, ...sf, ...hg];
}

export default function Home() {
  const featuredProducts = getFeaturedProducts();

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Selección de productos variados */}
        <section>
          <h1 className="text-2xl font-semibold mb-8 text-center">
            Selección de productos
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <UiCard key={product.id}>
                <CardHeader
                  title={product.name}
                  actions={
                    <span className="px-2 py-1 rounded-full text-xs bg-neutral-100 text-neutral-700 capitalize">
                      {product.category}
                    </span>
                  }
                />
                <CardBody>
                  <p className="text-sm text-neutral-600 mb-4">{product.description}</p>
                  <Link
                    href={
                      product.category === 'electrodomesticos'
                        ? '/electrodomesticos'
                        : product.category === 'sofas'
                        ? '/sofas'
                        : '/hogar'
                    }
                    className="inline-flex items-center text-sm font-medium text-neutral-800 hover:underline"
                  >
                    Ver más
                  </Link>
                </CardBody>
              </UiCard>
            ))}
          </div>
        </section>
      </div>

      {/* Botón flotante de WhatsApp */}
      <a
        href="https://wa.me/34692211145?text=Hola%20quiero%20informaci%C3%B3n%20sobre%20Todo%20Hogar%20Factory"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        style={{
          position: 'fixed',
          right: '24px',
          bottom: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#25D366',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 18px rgba(0,0,0,0.25)',
          zIndex: 9999,
          cursor: 'pointer',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="h-7 w-7"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill="currentColor"
            d="M16.04 5C10.55 5 6.11 9.44 6.11 14.93c0 2.1.61 4.03 1.78 5.72L6 26.96l6.48-1.87a9.97 9.97 0 0 0 3.56.65h.01c5.49 0 9.93-4.44 9.93-9.93C26 9.44 21.55 5 16.04 5Zm0 17.9h-.01a8 8 0 0 1-3.43-.81l-.25-.12-3.84 1.11 1.03-3.75-.16-.27a7.9 7.9 0 0 1-1.22-4.24c0-4.38 3.57-7.95 7.96-7.95 2.13 0 4.13.83 5.63 2.33a7.9 7.9 0 0 1 2.33 5.63c0 4.39-3.57 7.96-7.94 7.96Zm4.36-5.97c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.18-.71-.63-1.19-1.41-1.33-1.64-.14-.24-.01-.36.11-.48.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.41-.54-.42-.14-.01-.3-.01-.46-.01-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.52.58.18 1.1.15 1.52.09.46-.07 1.43-.58 1.63-1.15.2-.57.2-1.06.14-1.15-.06-.09-.22-.16-.46-.28Z"
          />
        </svg>
      </a>
    </>
  );
}
