/**
 * Equipo científico. Los textos son literales del PPTX de marca.
 *
 * Las fotos salen de la diapositiva 5 del PPTX, recortadas con el mismo
 * encuadre que aplica la propia diapositiva (su `srcRect`) y cuadradas para el
 * avatar circular. OJO: el título de esa diapositiva dice literalmente
 * "Nuestro equipo (Las fotos serán otras)", así que el cliente las tiene por
 * provisionales; cuando lleguen las definitivas basta con sustituir los
 * archivos de src/assets/equipo.
 *
 * `foto` es opcional a propósito: si un miembro no la tiene, la ficha vuelve
 * al avatar con iniciales sin tocar el componente.
 */
import luisVallejo from '@assets/equipo/luis-vallejo.jpg';
import ismaelTrejo from '@assets/equipo/ismael-trejo.jpg';
import anaFragozo from '@assets/equipo/ana-fragozo.jpg';

export interface MiembroEquipo {
   nombre: string;
   iniciales: string;
   area: string;
   credenciales: string[];
   /**
    * Palabras clave que se muestran como etiquetas en la ficha. No son copy
    * nuevo: cada una resume algo que ya dice la `bio` del propio miembro.
    */
   etiquetas: string[];
   bio: string;
   foto?: ImageMetadata;
}

export const EQUIPO: MiembroEquipo[] = [
   {
      nombre: 'Dr. Luis Vallejo Castillo',
      iniciales: 'LV',
      foto: luisVallejo,
      area: 'Caracterización analítica',
      credenciales: ['Doctor en Farmacología, CINVESTAV', 'Químico Farmacéutico Biólogo, FES Zaragoza'],
      etiquetas: ['Guías ICH', 'Control de calidad', 'COFEPRIS'],
      bio: 'Más de diez años de experiencia en investigación preclínica de péptidos y proteínas terapéuticas, con énfasis en caracterización fisicoquímica, control de calidad, eficacia y seguridad bajo guías internacionales como las de la ICH. Fue miembro del Consejo Científico de la COFEPRIS (2023–2025).',
   },
   {
      nombre: 'M. en C. Ismael Trejo Martínez',
      iniciales: 'IT',
      foto: ismaelTrejo,
      area: 'Modelos in vivo',
      credenciales: ['Maestro en Ciencias en Inmunología, ENCB-IPN', 'Químico Bacteriólogo Parasitólogo, ENCB-IPN'],
      etiquetas: ['Modelos in vivo', 'Alergias', 'Protocolos'],
      bio: 'Especialista en ciencias biológicas enfocado en investigación preclínica. Su trabajo se centra en el diseño, desarrollo y ejecución de modelos in vivo, particularmente en alergias, y en la redacción de protocolos preclínicos y procedimientos operativos bajo buenas prácticas de documentación.',
   },
   {
      nombre: 'Dra. Ana Laura Fragozo Ortiz',
      iniciales: 'AF',
      foto: anaFragozo,
      area: 'Modelos in vivo',
      credenciales: ['Doctora en Ciencias en Inmunología, IPN', 'Química Farmacéutica Bióloga, UNAM'],
      etiquetas: ['Vacunas de ARN', 'CAR-T', 'Bioterapéuticos'],
      bio: 'Doctora en Ciencias en Inmunología por el IPN y QFB por la UNAM, con más de cinco años de experiencia en investigación biomédica traslacional y desarrollo de bioterapéuticos. Especialista en la caracterización biológica de candidatos terapéuticos innovadores, vacunas de ARN y terapias CAR-T, bajo estándares regulatorios internacionales.',
   },
];

/**
 * Diferenciadores de "Un equipo, no un proveedor" (home). Copy de la maqueta
 * de la revisión de septiembre de 2026; sustituye a las dos tarjetas largas
 * del PPTX original ("Acompañamiento personalizado" y "Experiencia").
 */
export const DIFERENCIADORES = [
   {
      titulo: 'Un mismo equipo de principio a fin',
      descripcion: 'Tu proyecto no cambia de manos entre etapas.',
   },
   {
      titulo: 'Ciencia con visión regulatoria',
      descripcion: 'Diseñamos cada estudio pensando en cómo será evaluado.',
   },
   {
      titulo: 'Implementación en tu laboratorio',
      descripcion: 'Transferimos la metodología y capacitamos a tu equipo.',
   },
];

/** Copy de "Quiénes somos" (home) y "Nuestro compromiso" — revisión de septiembre de 2026. */
export const QUIENES_SOMOS = [
   'Somos una consultoría biofarmacéutica con especialistas en inmunología, farmacología y desarrollo farmacéutico que acompañan a la industria biofarmacéutica desde el planteamiento hasta la interpretación de resultados.',
];

export const COMPROMISO =
   'Ofrecer un acompañamiento cercano y personalizado, donde cada proyecto cuenta con un equipo de asesores capaces que lo guían de inicio a fin.';

/** Cabecera de /nosotros, según la maqueta "Especialistas que responden por cada resultado". */
export const NOSOTROS_HERO = {
   titulo: 'Especialistas que responden por cada resultado',
   descripcion:
      'Somos un equipo de científicos en inmunología, farmacología y caracterización analítica que asume cada proyecto con la seriedad que exige la industria.',
};

export const VALORES = [
   { titulo: 'Responsabilidad', descripcion: 'Respondemos por cada dato que entregamos.' },
   { titulo: 'Compromiso', descripcion: 'Nos involucramos en tus objetivos, no solo en la tarea.' },
   { titulo: 'Integridad', descripcion: 'Reportamos los resultados tal como son.' },
];
