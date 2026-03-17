import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, SUBCATEGORY_NAMES } from "@/lib/products";

interface ProductPageProps {
  params: { id: string };
}

export function generateMetadata({ params }: ProductPageProps) {
  const product = getProductById(params.id);
  if (!product) {
    return {
      title: "Producto no encontrado | Todo Hogar Factory",
    };
  }
  return {
    title: `${product.name} | Todo Hogar Factory`,
    description: product.description,
  };
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const product = getProductById(params.id);

  if (!product) {
    notFound();
  }

  const readableCategory =
    product.category === "electrodomesticos"
      ? "Electrodomésticos"
      : product.category === "sofas"
      ? "Sofás"
      : "Hogar";

  const readableSubcategory = product.subcategory
    ? SUBCATEGORY_NAMES[product.subcategory] ?? product.subcategory
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        href="/productos"
        className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900 mb-6"
      >
        <span className="pi pi-arrow-left mr-2" aria-hidden="true" />
        Volver al listado de productos
      </Link>

      <div className="rounded-2xl border border-black/[.08] bg-white shadow-sm p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full bg-neutral-100 text-xs font-medium text-neutral-700">
            {readableCategory}
          </span>
          {readableSubcategory && (
            <span className="px-3 py-1 rounded-full bg-orange-50 text-xs font-medium text-orange-700">
              {readableSubcategory}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-3">{product.name}</h1>
        <p className="opacity-80 mb-6 text-sm sm:text-base">{product.description}</p>

        <div className="border-t border-black/[.06] pt-6 mt-4 space-y-4">
          <h2 className="text-lg font-semibold">Características</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base">
            <li>Categoría: {readableCategory}</li>
            {readableSubcategory && <li>Tipo: {readableSubcategory}</li>}
            <li>Disponibilidad y precio según stock en tienda.</li>
          </ul>
        </div>

        <div className="mt-8 rounded-xl bg-orange-50 border border-orange-100 p-4 sm:p-5">
          <h3 className="font-semibold mb-1 text-orange-800">¿Te interesa este producto?</h3>
          <p className="text-sm text-orange-900 mb-3">
            Ponte en contacto con nosotros y te informamos del precio actual, disponibilidad y opciones de
            transporte.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://wa.me/34692211145?text=Hola%20quiero%20informaci%C3%B3n%20sobre%20un%20producto%20de%20Todo%20Hogar%20Factory"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium"
            >
              <span className="pi pi-whatsapp mr-2" aria-hidden="true" />
              Preguntar por WhatsApp
            </a>
            <Link
              href="/contacto"
              className="inline-flex items-center px-4 py-2 rounded-lg border border-orange-300 text-orange-800 text-sm font-medium hover:bg-orange-100"
            >
              <span className="pi pi-envelope mr-2" aria-hidden="true" />
              Ir a contacto
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

