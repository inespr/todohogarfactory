import { searchProducts, type ProductCategory } from "@/lib/products";

export const metadata = {
  title: "Buscar | Todo Hogar Factory",
  description: "Resultados de búsqueda de productos.",
};

function ResultCard({ name, description }: { name: string; description: string }) {
  return (
    <div className="rounded-lg border border-black/[.08] dark:border-white/[.145] p-6">
      <h3 className="font-semibold mb-1">{name}</h3>
      <p className="opacity-70 text-sm">{description}</p>
    </div>
  );
}

export default function BuscarPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const qParam = searchParams?.q;
  const catParam = searchParams?.cat;
  const q = Array.isArray(qParam) ? qParam[0] : qParam || "";
  const cat = (Array.isArray(catParam) ? catParam[0] : catParam || "") as ProductCategory | "";
  const results = searchProducts({ query: q, category: cat });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Resultados de búsqueda</h1>
      <p className="opacity-80 mb-6">{q ? `Término: "${q}"` : "Todos los productos"}{cat ? ` · Categoría: ${cat}` : ""}</p>
      {results.length === 0 ? (
        <p className="opacity-70">No se han encontrado productos.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((p) => (
            <ResultCard key={p.id} name={p.name} description={p.description} />
          ))}
        </div>
      )}
    </div>
  );
}


