/**
 * Catálogo de servicios.
 *
 * Es la fuente única: alimenta el grid filtrable de /servicios, las páginas de
 * detalle /servicios/[slug], el JSON-LD de tipo Service, el sitemap y los
 * enlaces del footer. En los mockups originales estaban escritos a mano en el
 * HTML, lo que hacía imposible generar las páginas de detalle.
 *
 * `resumen` y `alcance` son textuales de la documentación de marca. `detalle`
 * amplía el resumen con la variante de copy de la maqueta "constelación"
 * cuando el servicio aparecía en ambas; no introduce afirmaciones técnicas
 * que no estuvieran en la fuente.
 */

export type CategoriaId = 'evaluacion-preclinica' | 'caracterizacion-analitica' | 'estrategia-desarrollo';

export interface Categoria {
   id: CategoriaId;
   numero: string;
   nombre: string;
   lema: string;
   /** Texto del CTA de las tarjetas de esta categoría, según los mockups. */
   cta: string;
   descripcion: string;
}

export interface Servicio {
   slug: string;
   titulo: string;
   categoria: CategoriaId;
   tag: string;
   /** Cuál de los dos acentos de marca usa la etiqueta. */
   acento: 'verde' | 'azul';
   icono: IconName;
   resumen: string;
   detalle: string;
   alcance: string[];
}

export type IconName =
   | 'microscope'
   | 'mouse'
   | 'shield'
   | 'chart'
   | 'flask'
   | 'clock'
   | 'trending'
   | 'translate'
   | 'folder'
   | 'target'
   | 'search'
   | 'scroll';

export const CATEGORIAS: Categoria[] = [
   {
      id: 'evaluacion-preclinica',
      numero: '01',
      nombre: 'Evaluación preclínica',
      lema: 'Evidencia biológica defendible',
      cta: 'Ver metodología',
      descripcion:
         'Generamos el paquete de evidencia biológica que sostiene tu candidato: potencia, seguridad y comportamiento en modelos animales, con criterios de aceptación definidos antes de empezar.',
   },
   {
      id: 'caracterizacion-analitica',
      numero: '02',
      nombre: 'Caracterización analítica',
      lema: 'Producto y atributos críticos',
      cta: 'Explorar análisis',
      descripcion:
         'Definimos qué es exactamente tu producto y qué atributos determinan su calidad, para que el expediente hable de una molécula caracterizada y no de una promesa.',
   },
   {
      id: 'estrategia-desarrollo',
      numero: '03',
      nombre: 'Estrategia y desarrollo',
      lema: 'De la ciencia al activo protegido',
      cta: 'Ver consultoría',
      descripcion:
         'Convertimos los resultados en un expediente sometible y en propiedad intelectual defendible, identificando los huecos antes de que los encuentre la autoridad.',
   },
];

export const SERVICIOS: Servicio[] = [
   // --- 01 · Evaluación preclínica ------------------------------------------
   {
      slug: 'bioensayos-celulares',
      titulo: 'Bioensayos celulares',
      categoria: 'evaluacion-preclinica',
      tag: 'Inmunología',
      acento: 'verde',
      icono: 'microscope',
      resumen: 'Evaluación de potencia y viabilidad celular mediante metodologías estandarizadas.',
      detalle:
         'Evaluamos potencia y viabilidad celular con metodologías estandarizadas y criterios de aceptación estrictos, definidos antes de generar el primer dato. El resultado es un ensayo reproducible que puede sostenerse frente a una revisión regulatoria, no una medición aislada.',
      alcance: ['Cultivos primarios y líneas celulares', 'Ensayos de neutralización y eficacia'],
   },
   {
      slug: 'modelos-in-vivo',
      titulo: 'Modelos in vivo',
      categoria: 'evaluacion-preclinica',
      tag: 'Preclínica',
      acento: 'verde',
      icono: 'mouse',
      resumen: 'Diseño y ejecución de modelos biológicos con estrictos criterios de aceptación.',
      detalle:
         'Diseñamos y ejecutamos modelos biológicos —con experiencia particular en modelos murinos y de alergia— cuidando por igual el diseño experimental y el cumplimiento ético. La selección del modelo se justifica frente a la pregunta que necesitas responder.',
      alcance: [
         'Diseño experimental estadísticamente robusto',
         'Selección precisa del modelo animal',
         'Cumplimiento de normativas éticas',
      ],
   },
   {
      slug: 'inmunogenicidad-y-toxicologia',
      titulo: 'Inmunogenicidad y toxicología',
      categoria: 'evaluacion-preclinica',
      tag: 'Seguridad',
      acento: 'azul',
      icono: 'shield',
      resumen: 'Evaluación de la respuesta inmune y perfil de seguridad preclínica del candidato.',
      detalle:
         'Caracterizamos la respuesta inmune frente al candidato y su perfil de seguridad preclínica. La inmunogenicidad es uno de los puntos donde más expedientes de biológicos se detienen, y conviene resolverla antes del sometimiento, no durante.',
      alcance: ['Detección de anticuerpos anti-fármaco (ADA)', 'Dosis letal y toxicidad aguda'],
   },
   {
      slug: 'biodistribucion',
      titulo: 'Biodistribución',
      categoria: 'evaluacion-preclinica',
      tag: 'Cinética',
      acento: 'verde',
      icono: 'chart',
      resumen: 'Perfiles completos de distribución, metabolismo y excreción en modelos animales.',
      detalle:
         'Determinamos cómo se distribuye, metaboliza y excreta la molécula en modelos animales, incluyendo el marcaje necesario para seguirla. Es la evidencia que conecta la dosis administrada con el efecto observado.',
      alcance: ['Marcaje de moléculas', 'Farmacocinética y farmacodinamia (PK/PD)'],
   },

   // --- 02 · Caracterización analítica ---------------------------------------
   {
      slug: 'evaluacion-farmaceutica',
      titulo: 'Evaluación farmacéutica',
      categoria: 'caracterizacion-analitica',
      tag: 'Calidad',
      acento: 'verde',
      icono: 'flask',
      resumen: 'Análisis integral del producto biológico y determinación de sus atributos críticos.',
      detalle:
         'Analizamos el producto biológico de forma integral —pureza, impurezas y actividad biológica específica— para identificar sus atributos críticos de calidad (CQA). Sin esa definición, el control de calidad posterior no tiene contra qué compararse.',
      alcance: [
         'Perfil de pureza e impurezas',
         'Actividad biológica específica',
         'Identificación de atributos críticos de calidad (CQA)',
         'Validación de métodos analíticos',
      ],
   },
   {
      slug: 'estudios-de-vida-util',
      titulo: 'Estudios de vida útil',
      categoria: 'caracterizacion-analitica',
      tag: 'Estabilidad',
      acento: 'azul',
      icono: 'clock',
      resumen: 'Monitoreo de la estabilidad del producto bajo condiciones aceleradas y de largo plazo.',
      detalle:
         'Monitoreamos la degradación del producto bajo condiciones controladas para sustentar su vida útil declarada, combinando estudios acelerados, de largo plazo y de degradación forzada.',
      alcance: [
         'Estudios acelerados y a largo plazo',
         'Degradación forzada y estrés térmico',
         'Compatibilidad de envases',
      ],
   },
   {
      slug: 'analisis-estadistico',
      titulo: 'Análisis estadístico',
      categoria: 'caracterizacion-analitica',
      tag: 'Datos',
      acento: 'verde',
      icono: 'trending',
      resumen: 'Tratamiento de datos experimentales con software especializado para reportes regulatorios.',
      detalle:
         'Tratamos los datos experimentales con el rigor que exige un reporte regulatorio: la prueba correcta para el diseño usado, y una presentación que la autoridad pueda auditar.',
      alcance: ['Manejo experto de GraphPad Prism', 'Validación de métodos analíticos'],
   },
   {
      slug: 'traduccion-tecnica',
      titulo: 'Traducción técnica',
      categoria: 'caracterizacion-analitica',
      tag: 'Soporte',
      acento: 'azul',
      icono: 'translate',
      resumen: 'Traducción bidireccional (ES ⇄ EN) de documentación analítica y preclínica especializada.',
      detalle:
         'Traducimos documentación analítica y preclínica entre español e inglés sin perder precisión terminológica. La traducción la hace quien entiende el experimento, que es la única forma de que el término técnico sobreviva al cambio de idioma.',
      alcance: ['Precisión terminológica científica', 'Formatos listos para agencias'],
   },

   // --- 03 · Estrategia y desarrollo -----------------------------------------
   {
      slug: 'dossier-regulatorio',
      titulo: 'Dossier regulatorio',
      categoria: 'estrategia-desarrollo',
      tag: 'Regulatorio',
      acento: 'verde',
      icono: 'folder',
      resumen: 'Armado estratégico y estructuración técnica del expediente para sometimiento.',
      detalle:
         'Estructuramos el expediente técnico para sometimiento y revisamos qué falta antes de entregarlo. El objetivo es llegar a la autoridad sin huecos preclínicos evidentes, alineados con los requisitos de la agencia que corresponda.',
      alcance: ['Alineación con requisitos de autoridades sanitarias', 'Revisión de gaps preclínicos'],
   },
   {
      slug: 'evaluacion-trl',
      titulo: 'Evaluación TRL',
      categoria: 'estrategia-desarrollo',
      tag: 'Madurez',
      acento: 'azul',
      icono: 'target',
      resumen: 'Diagnóstico preciso del nivel de madurez tecnológica y siguientes pasos de desarrollo.',
      detalle:
         'Diagnosticamos en qué nivel de madurez tecnológica (TRL) está realmente el desarrollo y trazamos la ruta crítica hacia el siguiente. Incluye identificación de riesgos técnicos y regulatorios para mitigarlos temprano (de-risking), cuando todavía son baratos.',
      alcance: [
         'Mapeo de ruta crítica',
         'Identificación de riesgos (de-risking)',
         'Análisis de viabilidad técnica y regulatoria',
      ],
   },
   {
      slug: 'auditoria-cientifica',
      titulo: 'Auditoría científica',
      categoria: 'estrategia-desarrollo',
      tag: 'Auditoría',
      acento: 'verde',
      icono: 'search',
      resumen: 'Revisión exhaustiva de protocolos, metodologías y reportes de resultados.',
      detalle:
         'Revisamos protocolos, metodologías y reportes con la mirada de quien va a evaluarlos después. Verificamos trazabilidad del dato y consistencia documental para que el expediente resista una inspección.',
      alcance: ['Verificación de trazabilidad', 'Control de calidad documental'],
   },
   {
      slug: 'asesoria-en-patentes',
      titulo: 'Asesoría en patentes',
      categoria: 'estrategia-desarrollo',
      tag: 'Propiedad',
      acento: 'azul',
      icono: 'scroll',
      resumen: 'Apoyo técnico en la redacción de reivindicaciones para proteger la invención.',
      detalle:
         'Damos soporte técnico a la redacción de reivindicaciones: traducimos el hallazgo científico a un lenguaje legal robusto y respaldamos las respuestas a objeciones de la oficina de patentes con el dato experimental que las sostiene.',
      alcance: [
         'Traducción de ciencia a lenguaje legal',
         'Soporte técnico en respuestas a objeciones',
         'Análisis de libertad de operación (FTO)',
      ],
   },
];

export function getCategoria(id: CategoriaId): Categoria {
   const categoria = CATEGORIAS.find((c) => c.id === id);
   if (!categoria) throw new Error(`Categoría desconocida: ${id}`);
   return categoria;
}

export function serviciosPorCategoria(id: CategoriaId): Servicio[] {
   return SERVICIOS.filter((s) => s.categoria === id);
}

export function getServicio(slug: string): Servicio | undefined {
   return SERVICIOS.find((s) => s.slug === slug);
}
