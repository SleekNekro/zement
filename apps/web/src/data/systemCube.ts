import type { ImageMetadata } from 'astro';
import support from '../assets/provisional/fase-soporte.jpg';
import repair from '../assets/provisional/aplicacion-llana.jpg';
import preparation from '../assets/provisional/fase-preparacion.jpg';
import base from '../assets/provisional/textura-llana.jpg';
import finish from '../assets/provisional/nave-suelo-continuo.jpg';
import protection from '../assets/provisional/bano-microcemento.jpg';

/**
 * Fondo del cubo del sistema (portada): una foto real por fase, que cambia con el montaje.
 * Orden: soporte, reparación, preparación, base, acabado y protección. El cubo es una simulación
 * del material; el fondo enseña el producto de verdad.
 *
 * PROVISIONAL: fotos orientativas de Unsplash (ver assets/provisional/README.md). Sustituir por
 * fotos reales de Zement antes de publicar.
 */
export const cubeBackdrops: (ImageMetadata | undefined)[] = [
  support,
  repair,
  preparation,
  base,
  finish,
  protection,
];
