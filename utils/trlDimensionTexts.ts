import { Dimension } from '../types';

export interface TrlDimensionText {
  title: string;
  description: string;
}

/**
 * What each TRL means for each dimension. Source: "Dimensiones del TRL explicado"
 * (sheet 2), provided by the client. Keyed by TRL, then by API dimension code.
 */
export const TRL_DIMENSION_TEXTS: Record<number, Record<Dimension, TrlDimensionText>> = {
  1: {
    TECHNOLOGICAL: {
      title: "Principios tecnológicos identificados.",
      description: "Existe evidencia científica o conceptual sobre los principios fundamentales que sustentan la tecnología, sin demostración experimental de su aplicación."
    },
    COMMERCIAL: {
      title: "Necesidad u oportunidad identificada.",
      description: "Se reconoce un problema, necesidad o posible aplicación de la tecnología, pero todavía no existe una propuesta de valor definida ni evidencia de mercado."
    },
    LEGAL_REGULATORY: {
      title: "Contexto regulatorio e IP preliminar identificado.",
      description: "Se reconocen las normas, regulaciones y aspectos de propiedad intelectual potencialmente relacionados con la tecnología, se ha explorado las patentes y artículos científicos relacionados a la tecnología, aún no se tiene una estrategia formal definida."
    },
    ORGANIZATIONAL: {
      title: "Capacidades iniciales identificadas.",
      description: "Se reconoce el conocimiento, experiencia y recursos humanos necesarios para investigar o desarrollar la tecnología, aunque la estructura organizacional todavía es incipiente."
    }
  },
  2: {
    TECHNOLOGICAL: {
      title: "Concepto tecnológico formulado.",
      description: "Se ha definido una hipótesis tecnológica, concepto de aplicación o arquitectura preliminar y se han identificado posibles mecanismos de funcionamiento."
    },
    COMMERCIAL: {
      title: "Aplicaciones y usuarios potenciales definidos.",
      description: "Se identifican posibles usos, segmentos o usuarios y comienza a formularse una propuesta de valor."
    },
    LEGAL_REGULATORY: {
      title: "Requisitos legales y regulatorios preliminares definidos.",
      description: "Se identifican las normas aplicables, posibles restricciones regulatorias y alternativas iniciales de protección de PI."
    },
    ORGANIZATIONAL: {
      title: "Equipo y responsabilidades iniciales definidos.",
      description: "Se identifican actores clave, roles y capacidades necesarias para avanzar desde la investigación hacia el desarrollo."
    }
  },
  3: {
    TECHNOLOGICAL: {
      title: "Prueba de concepto experimental.",
      description: "Los principios y componentes fundamentales han sido demostrados experimentalmente y existe evidencia inicial de factibilidad técnica."
    },
    COMMERCIAL: {
      title: "Oportunidad de mercado caracterizada.",
      description: "Se han realizado exploraciones iniciales con usuarios, clientes o actores del mercado y se cuenta con evidencia preliminar de interés o necesidad."
    },
    LEGAL_REGULATORY: {
      title: "Ruta de protección y cumplimiento preliminar definida.",
      description: "Se analiza la posibilidad de proteger la tecnología, su titularidad y, cuando corresponde, la libertad de operación (freedom to operate), junto con los requisitos regulatorios relevantes."
    },
    ORGANIZATIONAL: {
      title: "Estructura de desarrollo establecida.",
      description: "Existe un equipo responsable, un plan inicial de trabajo, asignación de recursos y mecanismos básicos de seguimiento del desarrollo tecnológico."
    }
  },
  4: {
    TECHNOLOGICAL: {
      title: "Tecnología validada en laboratorio.",
      description: "Un prototipo o conjunto de componentes integrados ha demostrado funcionamiento en condiciones controladas de laboratorio."
    },
    COMMERCIAL: {
      title: "Propuesta de valor validada inicialmente.",
      description: "Existe evidencia de aceptación o interés de usuarios potenciales y se comienza a evaluar la viabilidad económica y las condiciones de adopción."
    },
    LEGAL_REGULATORY: {
      title: "Requisitos regulatorios y de PI incorporados al desarrollo.",
      description: "Los requisitos normativos, estándares técnicos y estrategia de propiedad intelectual comienzan a integrarse formalmente en el diseño de la tecnología."
    },
    ORGANIZATIONAL: {
      title: "Gestión estructurada del desarrollo.",
      description: "Se establecen procesos de gestión del proyecto, control documental, gestión de riesgos y responsabilidades más claramente definidas."
    }
  },
  5: {
    TECHNOLOGICAL: {
      title: "Tecnología validada en entorno relevante.",
      description: "El prototipo funciona en condiciones que representan de manera significativa el ambiente en el que será utilizado."
    },
    COMMERCIAL: {
      title: "Modelo de negocio preliminar definido.",
      description: "Se han estimado costos, precio o disposición a pagar, segmentos objetivo, canales y condiciones básicas de comercialización."
    },
    LEGAL_REGULATORY: {
      title: "Cumplimiento regulatorio en desarrollo y protección de PI avanzada.",
      description: "Se generan evidencias técnicas y documentales para demostrar cumplimiento; la protección de PI se ha definido, se ha avanzado mediante solicitudes, registros, contratos u otros mecanismos pertinentes."
    },
    ORGANIZATIONAL: {
      title: "Capacidad de escalamiento planificada.",
      description: "La organización ha definido necesidades de recursos, proveedores, infraestructura, calidad, capacidades técnicas y procesos requeridos para pasar de prototipo a piloto."
    }
  },
  6: {
    TECHNOLOGICAL: {
      title: "Tecnología demostrada en entorno relevante.",
      description: "El sistema o prototipo ha sido probado con éxito en condiciones representativas y se dispone de evidencia de desempeño y confiabilidad."
    },
    COMMERCIAL: {
      title: "Estrategia de comercialización validada preliminarmente.",
      description: "Se han probado aspectos del modelo de negocio y se dispone de evidencia de interés de clientes, usuarios, aliados o potenciales compradores."
    },
    LEGAL_REGULATORY: {
      title: "Preparación regulatoria y legal para el piloto.",
      description: "Se han completado o avanzado sustancialmente las pruebas y documentación requeridas para autorizaciones, certificaciones o registros aplicables; la situación de PI se encuentra claramente definida."
    },
    ORGANIZATIONAL: {
      title: "Organización preparada para el piloto/escalamiento.",
      description: "Existen procesos, responsables, recursos, alianzas y mecanismos de coordinación capaces de soportar pruebas piloto y una producción o implementación inicial."
    }
  },
  7: {
    TECHNOLOGICAL: {
      title: "Prototipo demostrado en ambiente operativo real.",
      description: "La tecnología funciona como sistema integrado en condiciones reales de operación y ha demostrado su desempeño con usuarios o clientes."
    },
    COMMERCIAL: {
      title: "Producto mínimo viable comercialmente preparado.",
      description: "Existe una oferta definida, con características, precio, segmento objetivo y canales de acceso al mercado suficientemente establecidos para una introducción controlada."
    },
    LEGAL_REGULATORY: {
      title: "Tecnología habilitada para su uso previsto.",
      description: "Se cuenta con las autorizaciones, certificaciones o condiciones legales necesarias para realizar el uso previsto, según corresponda, y la protección de PI está consolidada o suficientemente asegurada."
    },
    ORGANIZATIONAL: {
      title: "Organización preparada para operar con clientes.",
      description: "Existen procesos funcionales de producción/servicio, soporte, atención al cliente, calidad y coordinación entre las áreas involucradas."
    }
  },
  8: {
    TECHNOLOGICAL: {
      title: "Sistema completo, integrado y certificado/validado.",
      description: "La tecnología ha alcanzado su configuración final y su desempeño ha sido validado en condiciones reales; su manufacturabilidad o capacidad de implementación ha sido demostrada."
    },
    COMMERCIAL: {
      title: "Comercialización preparada y validada.",
      description: "Existe capacidad para producir/prestar, vender y distribuir la solución; se dispone de clientes, contratos, alianzas o evidencia suficiente de viabilidad comercial."
    },
    LEGAL_REGULATORY: {
      title: "Cumplimiento legal y regulatorio consolidado.",
      description: "Se han obtenido los registros, certificaciones, autorizaciones o aprobaciones aplicables; la PI se encuentra protegida y gestionada y existen acuerdos legales necesarios para la explotación de la tecnología."
    },
    ORGANIZATIONAL: {
      title: "Organización consolidada para la operación.",
      description: "La organización cuenta con estructura, procedimientos, sistema de calidad, recursos, proveedores, alianzas y capacidades de gestión suficientes para sostener la operación."
    }
  },
  9: {
    TECHNOLOGICAL: {
      title: "Tecnología plenamente operativa y probada en el mercado.",
      description: "El producto o sistema funciona de manera estable en condiciones reales y se encuentra desplegado o utilizado de forma rutinaria."
    },
    COMMERCIAL: {
      title: "Tecnología comercialmente consolidada.",
      description: "El producto o servicio se encuentra disponible en el mercado, con ventas o adopción efectiva, mecanismos comerciales establecidos y capacidad de sostenibilidad y crecimiento."
    },
    LEGAL_REGULATORY: {
      title: "Cumplimiento y gestión legal en operación.",
      description: "La tecnología mantiene sus autorizaciones y obligaciones regulatorias, se gestionan riesgos legales, propiedad intelectual, renovaciones, vigilancia y defensa de derechos cuando corresponde."
    },
    ORGANIZATIONAL: {
      title: "Organización sostenible y orientada a mejora continua.",
      description: "La organización posee capacidades permanentes para producir, comercializar, dar soporte, gestionar riesgos y mejorar continuamente la tecnología y el modelo de negocio."
    }
  }
};
