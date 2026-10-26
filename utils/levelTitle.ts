
/**
 * Level titles from the API are full descriptive paragraphs
 * (e.g. "Producto terminado. Pruebas con éxito en entorno real...").
 * The first sentence/line is a concise, display-friendly label.
 */
export const getLevelShortTitle = (title: string): string => {
  const [first] = title.split(/[.\n]/);
  return first.trim();
};
