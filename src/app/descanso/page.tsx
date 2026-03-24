export const metadata = {
  title: "Descanso Naturcolchó | Todo Hogar Factory",
  description: "Colchones, almohadas, canapés, bases y más. Trabajamos solo Naturcolchó.",
};

import { CategoryList } from "@/components/CategoryList";

export default function DescansoPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Descanso</h1>
      <CategoryList
        collection="descanso"
        placeholder="/placeholders/descanso.svg"
        detailBase="/descanso"
      />
    </div>
  );
}
