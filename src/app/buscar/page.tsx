import Link from "next/link";
import Image from "next/image";
import { searchProducts } from "@/lib/products";

export const metadata = {
  title: "Buscar | Todo Hogar Factory",
  description: "Resultados de búsqueda de productos.",
};

export default function BuscarPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const qParam = searchParams?.q;
  const q = Array.isArray(qParam) ? qParam[0] : qParam || "";
  const results = searchProducts({ query: q });

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">
        {q ? `Resultados para "${q}"` : "Buscar productos"}
      </h1>
      {results.length === 0 ? (
        <p className="text-center opacity-70 py-16">No se encontraron productos.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4" style={{ gridAutoRows: "280px" }}>
          {results.map((p) => (
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


