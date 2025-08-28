export const metadata = {
  title: "Sofás | Todo Hogar Factory",
  description: "Sofás cama, chaise longue y sillones para tu salón.",
};

import { getProductsByCategory } from "@/lib/products";

export default function SofasPage() {
  const products = getProductsByCategory("sofas");
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Sofás</h1>
      <p className="opacity-80 mb-8">Modelos cómodos, resistentes y con diseños modernos para tu hogar.</p>

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


