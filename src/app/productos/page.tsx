import Link from "next/link";
import { PRODUCTS, SUBCATEGORY_NAMES } from "@/lib/products";

export const metadata = {
  title: "Productos | Todo Hogar Factory",
  description: "Catálogo de productos destacados por categoría.",
};

export default function ProductosPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-3 text-center">Productos</h1>
      <p className="opacity-80 mb-8 text-center max-w-2xl mx-auto">
        Explora una selección de productos destacados. Para ver el detalle completo de cada uno, haz clic en
        su ficha.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRODUCTS.map((p) => (
          <Link
            key={p.id}
            href={`/productos/${p.id}`}
            className="h-full flex flex-col rounded-lg border border-black/[.08] p-6 bg-white shadow-sm hover:shadow-md transition"
          >
            <p className="text-xs uppercase tracking-wide text-orange-600 font-semibold mb-1">
              {p.category}
              {p.subcategory ? ` · ${SUBCATEGORY_NAMES[p.subcategory] ?? p.subcategory}` : ""}
            </p>
            <h2 className="font-semibold mb-1">{p.name}</h2>
            <p className="opacity-70 text-sm line-clamp-3">{p.description}</p>
            <span className="mt-auto pt-4 inline-flex text-sm font-medium text-orange-600">
              Ver detalles
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

