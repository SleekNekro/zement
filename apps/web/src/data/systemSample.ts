import type { ImageMetadata } from 'astro';
import support from '../assets/provisional/fase-soporte.jpg';
import repair from '../assets/provisional/aplicacion-llana.jpg';
import preparation from '../assets/provisional/fase-preparacion.jpg';
import base from '../assets/fotos/pared-microcemento-luz.jpg';
import finish from '../assets/fotos/arco-microcemento.jpg';
import protection from '../assets/fotos/encimera-microcemento.jpg';

/**
 * Fondo de la muestra del sistema (portada): una foto real por fase, que cambia con la aplicación.
 * Orden: soporte, reparación, preparación, base, acabado y protección. La muestra es una simulación
 * del material; el fondo enseña el producto de verdad.
 *
 * Base, acabado y protección: fotos de banco de imágenes (assets/fotos/README.md). Soporte,
 * reparación y preparación: provisionales de Unsplash (assets/provisional/README.md), hasta tener
 * fotos de obra propias.
 */
export const sampleBackdrops: (ImageMetadata | undefined)[] = [
  support,
  repair,
  preparation,
  base,
  finish,
  protection,
];
