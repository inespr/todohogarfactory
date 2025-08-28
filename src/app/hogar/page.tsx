export const metadata = {
  title: "Hogar | Todo Hogar Factory",
  description: "Menaje, organización, decoración y más para tu hogar.",
};

import { getProductsByCategory } from "@/lib/products";

export default function HogarPage() {
  const products = getProductsByCategory("hogar");
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Hogar</h1>
      <p className="opacity-80 mb-8">Todo lo que necesitas para equipar y organizar tu casa.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="rounded-lg border border-black/[.08] dark:border-white/[.145] p-6">
            <h3 className="font-semibold mb-1">{p.name}</h3>
            <p className="opacity-70 text-sm">{p.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


