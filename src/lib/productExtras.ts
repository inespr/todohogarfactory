// Campos a excluir siempre de los extras mostrados
export const EXCLUDED_EXTRA_FIELDS = new Set([
  'name', 'price', 'category', 'subcategoria', 'fotos',
  'urlImg', 'imageUrl', 'imagen', 'foto', 'img', 'url', 'image',
  'hasDefect', 'isOferta', 'stock', 'creadoEn', 'updatedAt', 'createdAt',
  'observaciones', 'marca', 'medidas', 'offerPrice',
]);

// Labels legibles para cada clave de Firestore
export const FIELD_LABELS: Record<string, string> = {
  description: 'Descripción',
  modelo: 'Modelo',
  color: 'Color',
  colores: 'Colores',
  acabado: 'Acabado',
  material: 'Material',
  tapizado: 'Tapizado',
  estructura: 'Estructura',
  capacidad: 'Capacidad',
  carga: 'Carga máx.',
  peso: 'Peso',
  potencia: 'Potencia',
  voltaje: 'Voltaje',
  consumo: 'Consumo',
  eficienciaEnergetica: 'Eficiencia energética',
  clase: 'Clase energética',
  rpm: 'RPM',
  ruido: 'Ruido',
  dimensiones: 'Dimensiones',
  alto: 'Alto',
  ancho: 'Ancho',
  largo: 'Largo',
  fondo: 'Fondo',
  profundidad: 'Profundidad',
  programas: 'Programas',
  garantia: 'Garantía',
  plazas: 'Plazas',
  tipo: 'Tipo',
  relleno: 'Relleno',
  firmeza: 'Firmeza',
  patas: 'Patas',
  ranuras: 'Ranuras',
  rebanadas: 'Rebanadas',
  velocidades: 'Velocidades',
  funciones: 'Funciones',
  litros: 'Litros',
  botellas: 'Botellas',
  cubiertos: 'Cubiertos',
  kg: 'Capacidad',
  niveles: 'Niveles',
  temporizador: 'Temporizador',
  termostato: 'Termostato',
  temperatura: 'Temperatura',
  frecuencia: 'Frecuencia',
  presion: 'Presión',
  velocidad: 'Velocidad',
  conectividad: 'Conectividad',
  pantalla: 'Pantalla',
  deposito: 'Depósito',
  filtracion: 'Filtración',
  accesorios: 'Accesorios',
};

export function fieldLabel(key: string): string {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  // Limpia prefijos tipo "ts", "lv", "ab" seguidos de mayúscula o espacio (ej: "tsPotencia" → "potencia")
  const cleaned = key
    .replace(/^[a-z]{1,3}(?=[A-Z])/, '')   // tsPotencia → Potencia
    .replace(/^[a-z]{1,3}\s+/, '')          // "ts potencia" → "potencia"
    .replace(/([A-Z])/g, ' $1')             // camelCase → palabras
    .replace(/^./, s => s.toUpperCase())
    .trim();
  return cleaned || key;
}

/**
 * Construye el mapa de extras a partir de los datos crudos de Firestore.
 * Filtra:
 *  - Claves excluidas
 *  - Claves que no están en FIELD_LABELS y tienen ≤3 chars (parecen códigos: ts, lv, ab…)
 *  - Valores vacíos o que parecen códigos internos (≤3 chars no numéricos)
 */
export function buildExtras(raw: Record<string, unknown>): Record<string, string> {
  const extras: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (EXCLUDED_EXTRA_FIELDS.has(key)) continue;
    if (typeof value !== 'string') continue;
    const v = value.trim();
    if (!v) continue;
    // Descarta valores que parecen códigos internos
    if (v.length <= 3 && !/^\d+(\.\d+)?$/.test(v)) continue;
    // Descarta claves desconocidas que son abreviaciones cortas
    if (!FIELD_LABELS[key] && key.length <= 3) continue;
    extras[key] = v;
  }
  return extras;
}
