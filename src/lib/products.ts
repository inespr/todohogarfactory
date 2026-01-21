export type ProductCategory = "electrodomesticos" | "sofas" | "hogar";

export type ElectroSubcategory = "lavadora" | "secadora" | "frigorifico-combi" | "arcon-congelador" | "placa-induccion" | "placa-gas" | "microondas" | "lavavajillas";
export type SofaSubcategory = "sofa-cama" | "chaise-longue" | "sillon" | "butaca" | "3+2";
export type HogarSubcategory = "cafetera-italiana" | "cafetera" | "ollas" | "cubiertos" | "vasos" | "secador" | "ropa-cama" | "toallas";

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  subcategory?: ElectroSubcategory | SofaSubcategory | HogarSubcategory;
}

export const PRODUCTS: Product[] = [
  // Electrodomésticos
  { id: "el-1", name: "Frigorífico Combi", description: "A+++, bajo consumo y gran capacidad", category: "electrodomesticos", subcategory: "frigorifico-combi" },
  { id: "el-2", name: "Lavadora 8kg", description: "Programas rápidos y silenciosa", category: "electrodomesticos", subcategory: "lavadora" },
  { id: "el-3", name: "Secadora 8kg", description: "Eficiencia energética A++", category: "electrodomesticos", subcategory: "secadora" },
  { id: "el-4", name: "Arcon Congelador", description: "Gran capacidad de almacenamiento", category: "electrodomesticos", subcategory: "arcon-congelador" },
  { id: "el-5", name: "Placa de Inducción", description: "Rápida y segura", category: "electrodomesticos", subcategory: "placa-induccion" },
  { id: "el-6", name: "Placa de Gas", description: "Control preciso del fuego", category: "electrodomesticos", subcategory: "placa-gas" },
  { id: "el-7", name: "Microondas Grill", description: "Compacto y eficiente", category: "electrodomesticos", subcategory: "microondas" },
  { id: "el-8", name: "Lavavajillas 12 servicios", description: "Eficiencia y silencio", category: "electrodomesticos", subcategory: "lavavajillas" },
  // Sofás
  { id: "sf-1", name: "Sofá Chaise Longue", description: "Amplio y con arcón", category: "sofas", subcategory: "chaise-longue" },
  { id: "sf-2", name: "Sofá Cama", description: "Práctico para invitados", category: "sofas", subcategory: "sofa-cama" },
  { id: "sf-3", name: "Sillón Relax", description: "Reclinable y muy confortable", category: "sofas", subcategory: "sillon" },
  { id: "sf-4", name: "Sofá 3+2", description: "Tejido antimanchas", category: "sofas", subcategory: "3+2" },
  { id: "sf-5", name: "Butaca Escandinava", description: "Estilo y comodidad", category: "sofas", subcategory: "butaca" },
  // Hogar
  { id: "hg-1", name: "Cafetera Italiana", description: "Sabor auténtico italiano", category: "hogar", subcategory: "cafetera-italiana" },
  { id: "hg-2", name: "Cafetera", description: "Automática con múltiples funciones", category: "hogar", subcategory: "cafetera" },
  { id: "hg-3", name: "Ollas Premium", description: "Acero inoxidable de alta calidad", category: "hogar", subcategory: "ollas" },
  { id: "hg-4", name: "Cubiertos de Acero", description: "Juego completo de cubiertos", category: "hogar", subcategory: "cubiertos" },
  { id: "hg-5", name: "Vasos de Cristal", description: "Elegantes y resistentes", category: "hogar", subcategory: "vasos" },
  { id: "hg-6", name: "Secador de Pelo", description: "Iónico y potente", category: "hogar", subcategory: "secador" },
  { id: "hg-7", name: "Ropa de Cama", description: "Sábanas y fundas nórdicas", category: "hogar", subcategory: "ropa-cama" },
  { id: "hg-8", name: "Juego de Toallas", description: "Algodón 100%", category: "hogar", subcategory: "toallas" },
];

export function getProductsByCategory(category: ProductCategory): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function getProductsBySubcategory(
  category: ProductCategory,
  subcategory: ElectroSubcategory | SofaSubcategory | HogarSubcategory
): Product[] {
  return PRODUCTS.filter((p) => p.category === category && p.subcategory === subcategory);
}

export function getSubcategoriesByCategory(category: ProductCategory): string[] {
  const subcategories = PRODUCTS
    .filter((p) => p.category === category && p.subcategory)
    .map((p) => p.subcategory!)
    .filter((value, index, self) => self.indexOf(value) === index);
  return subcategories;
}

export function searchProducts(params: { 
  query?: string; 
  category?: ProductCategory | ""; 
  subcategory?: string;
}): Product[] {
  const normalizedQuery = (params.query || "").trim().toLowerCase();
  const normalizedCategory = (params.category || "") as ProductCategory | "";
  const normalizedSubcategory = params.subcategory || "";

  return PRODUCTS.filter((p) => {
    const matchesCategory = normalizedCategory ? p.category === normalizedCategory : true;
    const matchesSubcategory = normalizedSubcategory ? p.subcategory === normalizedSubcategory : true;
    const matchesQuery = normalizedQuery
      ? p.name.toLowerCase().includes(normalizedQuery) || 
        p.description.toLowerCase().includes(normalizedQuery) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(normalizedQuery))
      : true;
    return matchesCategory && matchesSubcategory && matchesQuery;
  });
}

// Mapeo de subcategorías a nombres legibles
export const SUBCATEGORY_NAMES: Record<string, string> = {
  // Electrodomésticos
  "lavadora": "Lavadora",
  "secadora": "Secadora",
  "frigorifico-combi": "Frigorífico Combi",
  "arcon-congelador": "Arcón Congelador",
  "placa-induccion": "Placa de Inducción",
  "placa-gas": "Placa de Gas",
  "microondas": "Microondas",
  "lavavajillas": "Lavavajillas",
  // Sofás
  "sofa-cama": "Sofá Cama",
  "chaise-longue": "Chaise Longue",
  "sillon": "Sillón",
  "butaca": "Butaca",
  "3+2": "Sofá 3+2",
  // Hogar
  "cafetera-italiana": "Cafetera Italiana",
  "cafetera": "Cafetera",
  "ollas": "Ollas",
  "cubiertos": "Cubiertos",
  "vasos": "Vasos",
  "secador": "Secador",
  "ropa-cama": "Ropa de Cama",
  "toallas": "Toallas",
};


