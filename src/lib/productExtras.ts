// Campos a excluir siempre de los extras mostrados
export const EXCLUDED_EXTRA_FIELDS = new Set([
  'name', 'price', 'category', 'subcategoria', 'fotos',
  'urlImg', 'imageUrl', 'imagen', 'foto', 'img', 'url', 'image',
  'hasDefect', 'isOferta', 'stock', 'creadoEn', 'updatedAt', 'createdAt',
  'observaciones', 'marca', 'medidas', 'offerPrice', 'grupo',
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
  instalacion: 'Instalación',
  'Cn2 Tipo': 'Tipo',
  'Cn2 Instalacion': 'Instalación',
  'Cn2 Capacidad': 'Capacidad',
  'cn2 tipo': 'Tipo',
  'cn2 instalacion': 'Instalación',
  'cn2 capacidad': 'Capacidad',
  Cn2Tipo: 'Tipo',
  Cn2Instalacion: 'Instalación',
  Cn2Capacidad: 'Capacidad',
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
  // Quita prefijos tipo "Cn2 ", "cn2 ", "AB3" (1-4 letras + dígitos + espacio opcional)
  const stripped = key
    .replace(/^[A-Za-z]{1,4}\d+\s*/i, '')    // "Cn2 Tipo"→"Tipo", "cn2tipo"→"tipo"
    .replace(/^[a-z]{1,3}(?=[A-Z])/, '')      // tsPotencia → Potencia
    .replace(/^[a-z]{1,3}\s+/, '');           // "ts potencia" → "potencia"
  // Intenta lookup: tal cual, en minúscula, y sin espacios en minúscula
  const tries = [
    stripped,
    stripped.charAt(0).toLowerCase() + stripped.slice(1),
    stripped.toLowerCase(),
    stripped.toLowerCase().replace(/\s+/g, ''),
  ];
  for (const t of tries) {
    if (FIELD_LABELS[t]) return FIELD_LABELS[t];
  }
  const cleaned = stripped
    .replace(/([A-Z])/g, ' $1')
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
