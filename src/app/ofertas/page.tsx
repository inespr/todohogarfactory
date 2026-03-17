import { getProductsByCategory } from "@/lib/products";

export const metadata = {
  title: "Ofertas | Todo Hogar Factory",
  description: "Consulta las últimas ofertas en electrodomésticos, sofás y artículos para el hogar.",
};

export default function OfertasPage() {
  const electro = getProductsByCategory("electrodomesticos").slice(0, 4);
  const sofas = getProductsByCategory("sofas").slice(0, 4);
  const hogar = getProductsByCategory("hogar").slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-3 text-center">Ofertas</h1>
      <p className="opacity-80 mb-8 text-center max-w-2xl mx-auto">
        Descubre una selección de productos destacados con precio especial. Para ver todas las ofertas
        disponibles, consúltanos en tienda o por WhatsApp.
      </p>

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-semibold mb-4">Electrodomésticos en oferta</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {electro.map((p) => (
              <article
                key={p.id}
                className="h-full flex flex-col rounded-lg border border-black/[.08] p-6 bg-white shadow-sm hover:shadow-md transition"
              >
                <h3 className="font-semibold mb-1">{p.name}</h3>
                <p className="opacity-70 text-sm mb-3 line-clamp-3">{p.description}</p>
                <p className="mt-auto text-xs uppercase tracking-wide text-orange-600 font-semibold">
                  Oferta en tienda
                </p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Sofás en oferta</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sofas.map((p) => (
              <article
                key={p.id}
                className="h-full flex flex-col rounded-lg border border-black/[.08] p-6 bg-white shadow-sm hover:shadow-md transition"
              >
                <h3 className="font-semibold mb-1">{p.name}</h3>
                <p className="opacity-70 text-sm mb-3 line-clamp-3">{p.description}</p>
                <p className="mt-auto text-xs uppercase tracking-wide text-orange-600 font-semibold">
                  Oferta en tienda
                </p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Hogar en oferta</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hogar.map((p) => (
              <article
                key={p.id}
                className="h-full flex flex-col rounded-lg border border-black/[.08] p-6 bg-white shadow-sm hover:shadow-md transition"
              >
                <h3 className="font-semibold mb-1">{p.name}</h3>
                <p className="opacity-70 text-sm mb-3 line-clamp-3">{p.description}</p>
                <p className="mt-auto text-xs uppercase tracking-wide text-orange-600 font-semibold">
                  Oferta en tienda
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

