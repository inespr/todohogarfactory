export const metadata = {
  title: "Descanso Naturcolchó | Todo Hogar Factory",
  description: "Colchones, almohadas, canapés, bases y más. Trabajamos solo Naturcolchó.",
};

import { getProductsByCategory, SUBCATEGORY_NAMES } from "@/lib/products";

export default function DescansoPage() {
  const products = getProductsByCategory("descanso");

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Descanso</h1>
      <p className="opacity-80 mb-8">
        Colchones, almohadas, canapés, bases y más. Trabajamos <span className="font-semibold">solo</span> la marca{" "}
        <span className="font-semibold text-orange-700">Naturcolchó</span>.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="h-full flex flex-col rounded-lg border border-black/[.08] dark:border-white/[.145] p-6 bg-white shadow-sm"
          >
            <p className="text-xs uppercase tracking-wide text-orange-600 font-semibold mb-1">
              Naturcolchó{p.subcategory ? ` · ${SUBCATEGORY_NAMES[p.subcategory] ?? p.subcategory}` : ""}
            </p>
            <h3 className="font-semibold mb-1">{p.name}</h3>
            <p className="opacity-70 text-sm line-clamp-3">{p.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

