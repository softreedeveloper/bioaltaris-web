/**
 * Las tres fases del recorrido que se narra en la home (la maqueta
 * "constelación"). Cada fase apunta a servicios reales del catálogo por slug,
 * de modo que la narrativa y el catálogo no puedan divergir: si un servicio se
 * renombra o se va, el enlace se rompe en build, no en producción.
 */

import type { CategoriaId } from './servicios';

export interface Fase {
   numero: string;
   titulo: string;
   lema: string;
   categoria: CategoriaId;
   acento: 'verde' | 'azul';
   /** Slugs de SERVICIOS que se muestran como nodos de esta fase. */
   servicios: string[];
}

export const FASES: Fase[] = [
   {
      numero: '01',
      titulo: 'Evaluación preclínica',
      lema: 'Evidencia biológica defendible',
      categoria: 'evaluacion-preclinica',
      acento: 'verde',
      servicios: ['bioensayos-celulares', 'modelos-in-vivo', 'biodistribucion'],
   },
   {
      numero: '02',
      titulo: 'Caracterización analítica',
      lema: 'Atributos críticos de calidad',
      categoria: 'caracterizacion-analitica',
      acento: 'azul',
      servicios: ['evaluacion-farmaceutica', 'estudios-de-vida-util'],
   },
   {
      numero: '03',
      titulo: 'Estrategia y desarrollo',
      lema: 'De la ciencia al activo protegido',
      categoria: 'estrategia-desarrollo',
      acento: 'verde',
      servicios: ['evaluacion-trl', 'asesoria-en-patentes'],
   },
];

export const OBJETIVO_FINAL = {
   titulo: 'Expediente regulatorio',
   descripcion:
      'El fin de la constelación. Todos los nodos de calidad, seguridad y eficacia se unen aquí, listos para la aprobación de las agencias sanitarias y el éxito comercial.',
};
