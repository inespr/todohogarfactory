export const metadata = {
  title: "Hogar | Todo Hogar Factory",
  description: "Menaje, organización, decoración y más para tu hogar.",
};

import { CategoryList } from "@/components/CategoryList";

export default function HogarPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Hogar</h1>
      <CategoryList
        collection="hogar"
        placeholder="/placeholders/hogar.svg"
        detailBase="/hogar"
      />
    </div>
  );
}
