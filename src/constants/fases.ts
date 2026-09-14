/**
 * Las cuatro etapas del recorrido que se narra en la home ("Nuestro
 * acompañamiento abarca"). Vienen de la maqueta que entregó el cliente en la
 * revisión de septiembre de 2026.
 *
 * Cada nodo lleva su propio título y etiqueta porque la narrativa de la home
 * no coincide uno a uno con el catálogo de /servicios: hay nodos que hoy no
 * tienen página propia (Diseño de proyectos, Análisis de mercado,
 * Caracterización fisicoquímica, Estrategia regulatoria). Los que sí tienen
 * página apuntan a ella por `slug`; ese enlace se comprueba en build contra
 * servicios.ts para que no quede roto en producción.
 */

import type { IconName } from './servicios';

export interface NodoRuta {
   titulo: string;
   tag: string;
   icono: IconName;
   acento: 'verde' | 'azul';
   /** Slug de SERVICIOS con el que enlaza el nodo. Sin slug, no es enlace. */
   slug?: string;
}

export interface Fase {
   numero: string;
   titulo: string;
   lema: string;
   /** Nombre abreviado para el gráfico orbital del hero. */
   corto: string;
   /** Icono de la etapa en la franja del hero. */
   icono: IconName;
   acento: 'verde' | 'azul';
   nodos: NodoRuta[];
}

export const FASES: Fase[] = [
   {
      numero: '01',
      titulo: 'Planeación del proyecto',
      lema: 'Diagnóstico y ruta de desarrollo',
      corto: 'Planeación',
      icono: 'clipboard',
      acento: 'verde',
      nodos: [
         { titulo: 'Diseño de proyectos', tag: 'Planeación', icono: 'clipboard', acento: 'verde' },
         { titulo: 'Evaluación TRL', tag: 'Madurez', icono: 'target', acento: 'azul', slug: 'evaluacion-trl' },
         { titulo: 'Análisis de mercado', tag: 'Mercado', icono: 'trending', acento: 'verde' },
      ],
   },
   {
      numero: '02',
      titulo: 'Evaluación preclínica',
      lema: 'Evidencia biológica',
      corto: 'Preclínica',
      icono: 'microscope',
      acento: 'azul',
      nodos: [
         {
            titulo: 'Bioensayos celulares',
            tag: 'Inmunología',
            icono: 'microscope',
            acento: 'verde',
            slug: 'bioensayos-celulares',
         },
         { titulo: 'Modelos in vivo', tag: 'Preclínica', icono: 'mouse', acento: 'azul', slug: 'modelos-in-vivo' },
         {
            titulo: 'Inmunogenicidad y toxicología',
            tag: 'Seguridad',
            icono: 'shield',
            acento: 'azul',
            slug: 'inmunogenicidad-y-toxicologia',
         },
         {
            titulo: 'Biodistribución y PK/PD',
            tag: 'Cinética',
            icono: 'chart',
            acento: 'azul',
            slug: 'biodistribucion',
         },
      ],
   },
   {
      numero: '03',
      titulo: 'Caracterización analítica',
      lema: 'Atributos críticos de calidad',
      corto: 'Analítica',
      icono: 'atom',
      acento: 'verde',
      nodos: [
         { titulo: 'Caracterización fisicoquímica', tag: 'Fisicoquímica', icono: 'atom', acento: 'verde' },
         {
            titulo: 'Evaluación farmacéutica',
            tag: 'Calidad',
            icono: 'flask',
            acento: 'verde',
            slug: 'evaluacion-farmaceutica',
         },
         {
            titulo: 'Estudios de vida útil',
            tag: 'Estabilidad',
            icono: 'clock',
            acento: 'verde',
            slug: 'estudios-de-vida-util',
         },
      ],
   },
   {
      numero: '04',
      titulo: 'Regulación y propiedad intelectual',
      lema: 'Cumplimiento y protección',
      corto: 'Regulación e IP',
      icono: 'folder',
      acento: 'azul',
      nodos: [
         {
            titulo: 'Estrategia regulatoria',
            tag: 'Regulación',
            icono: 'folder',
            acento: 'azul',
            slug: 'dossier-regulatorio',
         },
         {
            titulo: 'Asesoría en patentes',
            tag: 'Propiedad',
            icono: 'scroll',
            acento: 'azul',
            slug: 'asesoria-en-patentes',
         },
         {
            titulo: 'Traducción especializada',
            tag: 'Documentación',
            icono: 'translate',
            acento: 'azul',
            slug: 'traduccion-tecnica',
         },
      ],
   },
];

export const OBJETIVO_FINAL = {
   titulo: 'Expediente regulatorio',
   descripcion:
      'La evidencia de cada etapa se integra en un expediente técnico sólido para su evaluación ante las agencias sanitarias.',
};

/** Nota de cierre del recorrido, junto al enlace al catálogo. */
export const IMPLEMENTACION = {
   titulo: 'Implementación en tu laboratorio.',
   descripcion: 'Cuando se requiere, transferimos la metodología en sitio y capacitamos a tu equipo.',
   cta: 'Ver catálogo de servicios',
};
