export const metadata = {
  title: "Sofás | Todo Hogar Factory",
  description: "Sofás cama, chaise longue y sillones para tu salón.",
};

import { Suspense } from "react";
import { CategoryList } from "@/components/CategoryList";

export default function SofasPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl font-bold mb-6">Sofás</h1>
      <Suspense fallback={<p className="opacity-70 py-10 text-center">Cargando productos…</p>}>
        <CategoryList
          collection="sofas"
          placeholder="/placeholders/sofas.svg"
          detailBase="/sofas"
        />
      </Suspense>
    </div>
  );
}
