import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import Image from "next/image";

export const metadata = {
  title: "Productos | Todo Hogar Factory",
  description: "Catálogo de productos destacados por categoría.",
};

const getPlaceholder = (category: string) => {
  switch (category) {
    case "electrodomesticos":
      return "/placeholders/electrodomesticos.svg";
    case "sofas":
      return "/placeholders/sofas.svg";
    case "hogar":
      return "/placeholders/hogar.svg";
    default:
      return "/placeholders/descanso.svg";
  }
};

export default function ProductosPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Productos</h1>
      {PRODUCTS.length === 0 ? (
        <p className="text-center opacity-70 py-16">No hay productos disponibles.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4" style={{ gridAutoRows: "280px" }}>
          {PRODUCTS.map((p) => (
            <div key={p.id} style={{ height: "280px", minHeight: "280px", maxHeight: "280px" }}>
              <Link
                href={`/productos/${p.id}`}
                className="group flex flex-col bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all w-full"
                style={{ height: "280px" }}
              >
                <div className="relative bg-neutral-50 shrink-0" style={{ height: "160px", minHeight: "160px" }}>
                  <Image
                    src={getPlaceholder(p.category)}
                    alt={p.name}
                    fill
                    className="object-contain p-3"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute left-3 top-3">
                    <span className="inline-flex items-center rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-neutral-800 shadow-sm">
                      {p.category}
                    </span>
                  </div>
                </div>
                <div className="p-3 flex flex-col flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-neutral-950 line-clamp-2">
                    {p.name}
                  </h3>
                  <p className="text-xs text-neutral-600 mt-1 line-clamp-2">{p.description}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

