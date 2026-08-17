/**
 * Equipo científico. Los textos son literales del PPTX de marca.
 *
 * Las fotos del PPTX están marcadas por el propio cliente como provisionales
 * ("Las fotos serán otras"), así que no se incluyen: la ficha renderiza un
 * avatar con iniciales. Cuando lleguen las definitivas basta con añadir
 * `foto` aquí y el componente las usa.
 */

export interface MiembroEquipo {
   nombre: string;
   iniciales: string;
   area: string;
   credenciales: string[];
   bio: string;
   foto?: ImageMetadata;
}

export const EQUIPO: MiembroEquipo[] = [
   {
      nombre: 'Dr. Luis Vallejo Castillo',
      iniciales: 'LV',
      area: 'Caracterización analítica',
      credenciales: ['Doctor en Farmacología, CINVESTAV', 'Químico Farmacéutico Biólogo, FES Zaragoza'],
      bio: 'Más de diez años de experiencia en investigación preclínica de péptidos y proteínas terapéuticas, con énfasis en caracterización fisicoquímica, control de calidad, eficacia y seguridad bajo guías internacionales como las de la ICH. Fue miembro del Consejo Científico de la COFEPRIS (2023–2025).',
   },
   {
      nombre: 'M. en C. Ismael Trejo Martínez',
      iniciales: 'IT',
      area: 'Modelos in vivo',
      credenciales: ['Maestro en Ciencias en Inmunología, ENCB-IPN', 'Químico Bacteriólogo Parasitólogo, ENCB-IPN'],
      bio: 'Especialista en ciencias biológicas enfocado en investigación preclínica. Su trabajo se centra en el diseño, desarrollo y ejecución de modelos in vivo, particularmente en alergias, y en la redacción de protocolos preclínicos y procedimientos operativos bajo buenas prácticas de documentación.',
   },
   {
      nombre: 'Dra. Ana Laura Fragozo Ortiz',
      iniciales: 'AF',
      area: 'Modelos in vivo',
      credenciales: ['Doctora en Ciencias en Inmunología, IPN', 'Química Farmacéutica Bióloga, UNAM'],
      bio: 'Doctora en Ciencias en Inmunología por el IPN y QFB por la UNAM, con más de cinco años de experiencia en investigación biomédica traslacional y desarrollo de bioterapéuticos. Especialista en la caracterización biológica de candidatos terapéuticos innovadores, vacunas de ARN y terapias CAR-T, bajo estándares regulatorios internacionales.',
   },
];

/** Diferenciadores de la diapositiva "¿Por qué elegirnos?". */
export const DIFERENCIADORES = [
   {
      titulo: 'Acompañamiento personalizado',
      descripcion:
         'Desde el primer contacto, cada proyecto es asignado a un equipo de asesores especializados que lo acompañan de principio a fin, garantizando continuidad, seguimiento cercano y respuestas oportunas en cada etapa del proceso.',
   },
   {
      titulo: 'Experiencia',
      descripcion:
         'Nuestro equipo científico cuenta con más de 5 años de experiencia en investigación biofarmacéutica y preclínica, en los que se ha preparado para apoyarlo en sus retos.',
   },
];

/** Copy de "¿Quiénes somos?" y "Compromiso" — literal del PPTX. */
export const QUIENES_SOMOS = [
   'Somos una consultoría biofarmacéutica especializada en el desarrollo preclínico, la validación analítica, el control de calidad y la regulación de productos biológicos y biofarmacéuticos. Ofrecemos asesoría integral, acompañándote en cada etapa del proceso, desde el análisis del reto hasta la obtención y el análisis de los resultados.',
   'Integramos rigor científico y experiencia especializada en inmunología, farmacología, desarrollo farmacéutico y modelos preclínicos murinos, con un enfoque estratégico que conecta la ciencia de vanguardia con las necesidades reales de la industria farmacéutica. Trabajamos conforme a estándares regulatorios nacionales e internacionales para garantizar resultados sólidos, confiables y con proyección internacional.',
];

export const COMPROMISO =
   'Nuestro compromiso es ofrecer un acompañamiento cercano y personalizado, donde cada proyecto cuenta con un equipo de asesores capaces que lo guían de inicio a fin.';
