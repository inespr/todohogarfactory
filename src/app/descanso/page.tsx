export const metadata = {
  title: "Descanso Naturcolchó | Todo Hogar Factory",
  description: "Colchones, almohadas, canapés, bases y más. Trabajamos solo Naturcolchó.",
};

import { Suspense } from "react";
import { CategoryList } from "@/components/CategoryList";

export default function DescansoPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Descanso (Naturcolchó)</h1>
      <Suspense fallback={<p className="opacity-70 py-10 text-center">Cargando productos…</p>}>
        <CategoryList
          collection="descanso"
          placeholder="/placeholders/descanso.svg"
          detailBase="/descanso"
        />
      </Suspense>
    </div>
  );
}
