export type ProductCategory = "electrodomesticos" | "sofas" | "hogar";

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
}

export const PRODUCTS: Product[] = [
  // Electrodomésticos
  { id: "el-1", name: "Frigorífico Combi", description: "A+++, bajo consumo y gran capacidad", category: "electrodomesticos" },
  { id: "el-2", name: "Lavadora 8kg", description: "Programas rápidos y silenciosa", category: "electrodomesticos" },
  { id: "el-3", name: "Horno Multifunción", description: "Convección y limpieza pirolítica", category: "electrodomesticos" },
  { id: "el-4", name: "Placa de Inducción", description: "Rápida y segura", category: "electrodomesticos" },
  { id: "el-5", name: "Microondas Grill", description: "Compacto y eficiente", category: "electrodomesticos" },
  { id: "el-6", name: "Lavavajillas 12 servicios", description: "Eficiencia y silencio", category: "electrodomesticos" },
  // Sofás
  { id: "sf-1", name: "Sofá Chaise Longue", description: "Amplio y con arcón", category: "sofas" },
  { id: "sf-2", name: "Sofá Cama", description: "Práctico para invitados", category: "sofas" },
  { id: "sf-3", name: "Sillón Relax", description: "Reclinable y muy confortable", category: "sofas" },
  { id: "sf-4", name: "Sofá 3 Plazas", description: "Tejido antimanchas", category: "sofas" },
  { id: "sf-5", name: "Sofá Modular", description: "Configurable a medida", category: "sofas" },
  { id: "sf-6", name: "Butaca Escandinava", description: "Estilo y comodidad", category: "sofas" },
  // Hogar
  { id: "hg-1", name: "Batería de Cocina", description: "Acero inoxidable de alta calidad", category: "hogar" },
  { id: "hg-2", name: "Pack Organización", description: "Cajas y separadores", category: "hogar" },
  { id: "hg-3", name: "Juego de Toallas", description: "Algodón 100%", category: "hogar" },
  { id: "hg-4", name: "Set Decorativo", description: "Velas y jarrones", category: "hogar" },
  { id: "hg-5", name: "Ropa de Cama", description: "Sábanas y fundas nórdicas", category: "hogar" },
  { id: "hg-6", name: "Alfombra Lavable", description: "Fácil mantenimiento", category: "hogar" },
];

export function getProductsByCategory(category: ProductCategory): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function searchProducts(params: { query?: string; category?: ProductCategory | "" }): Product[] {
  const normalizedQuery = (params.query || "").trim().toLowerCase();
  const normalizedCategory = (params.category || "") as ProductCategory | "";

  return PRODUCTS.filter((p) => {
    const matchesCategory = normalizedCategory ? p.category === normalizedCategory : true;
    const matchesQuery = normalizedQuery
      ? p.name.toLowerCase().includes(normalizedQuery) || p.description.toLowerCase().includes(normalizedQuery)
      : true;
    return matchesCategory && matchesQuery;
  });
}


