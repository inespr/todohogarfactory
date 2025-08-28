export const metadata = {
  title: "Electrodomésticos | Todo Hogar Factory",
  description: "Compra frigoríficos, lavadoras, hornos, microondas y más.",
};

import { ElectroList } from "./ElectroList";

export default function ElectrodomesticosPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Electrodomésticos</h1>
      <ElectroList />
    </div>
  );
}


