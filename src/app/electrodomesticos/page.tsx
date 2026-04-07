export const metadata = {
  title: "Electrodomésticos | Todo Hogar Factory",
  description: "Compra frigoríficos, lavadoras, hornos, microondas y más.",
};

import { Suspense } from "react";
import { ElectroList } from "./ElectroList";

export default function ElectrodomesticosPage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
      <Suspense fallback={<p className="opacity-70 py-10 text-center">Cargando productos…</p>}>
        <ElectroList />
      </Suspense>
    </div>
  );
}


