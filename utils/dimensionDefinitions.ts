import { Dimension } from '../types';

export interface DimensionDefinition {
  dimension: Dimension;
  title: string;
  definition: string;
}

/**
 * Fixed, informational definitions of each maturity dimension, as summarized
 * by the client ("Definición resumida").
 */
export const DIMENSION_DEFINITIONS: DimensionDefinition[] = [
  {
    dimension: 'TECHNOLOGICAL',
    title: 'Madurez tecnológica',
    definition:
      'Grado en que una tecnología ha demostrado su factibilidad, funcionamiento, desempeño, confiabilidad e integración, desde su concepción hasta su operación en condiciones reales.'
  },
  {
    dimension: 'COMMERCIAL',
    title: 'Madurez comercial',
    definition:
      'Grado en que una tecnología cuenta con las condiciones para generar valor en el mercado, considerando necesidades, usuarios, propuesta de valor, modelo de negocio, costos, precios y canales comerciales.'
  },
  {
    dimension: 'LEGAL_REGULATORY',
    title: 'Madurez legal/regulatoria',
    definition:
      'Grado en que una tecnología identifica, gestiona y cumple los requisitos legales, normativos, regulatorios y de propiedad intelectual necesarios para su desarrollo, transferencia y explotación.'
  },
  {
    dimension: 'ORGANIZATIONAL',
    title: 'Madurez organizacional',
    definition:
      'Grado en que una organización dispone de las capacidades, recursos, estructuras, procesos y alianzas necesarios para desarrollar, transferir, implementar y escalar una tecnología de forma sostenible.'
  }
];
