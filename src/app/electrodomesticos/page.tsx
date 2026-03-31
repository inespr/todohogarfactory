export const metadata = {
  title: "Electrodomésticos | Todo Hogar Factory",
  description: "Compra frigoríficos, lavadoras, hornos, microondas y más.",
};

import { Suspense } from "react";
import { ElectroList } from "./ElectroList";

export default function ElectrodomesticosPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <Suspense fallback={<p className="opacity-70 py-10 text-center">Cargando productos…</p>}>
        <ElectroList />
      </Suspense>
    </div>
  );
}


