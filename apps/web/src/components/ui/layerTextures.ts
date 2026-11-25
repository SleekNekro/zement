/*
 * Textura y grosor relativo de cada capa del sistema, de abajo arriba: preparación → base →
 * acabado → protección. Los grosores son representación visual, no medidas.
 * Lo comparten el corte de la página del sistema (LayerStack) y el de la portada (SystemAnnotated).
 */
export const layerTextures = [
  {
    grow: 1.1,
    texture:
      'bg-stone bg-[repeating-linear-gradient(135deg,color-mix(in_srgb,var(--zm-color-navy)_30%,transparent)_0_1px,transparent_1px_7px)]',
  },
  {
    grow: 2.2,
    texture:
      'bg-[color-mix(in_srgb,var(--zm-color-stone),var(--zm-color-navy)_9%)] bg-[radial-gradient(color-mix(in_srgb,var(--zm-color-navy)_45%,transparent)_1px,transparent_1.2px)] bg-[length:9px_9px]',
  },
  {
    grow: 1.4,
    texture:
      'bg-white bg-[radial-gradient(color-mix(in_srgb,var(--zm-color-navy-soft)_30%,transparent)_0.6px,transparent_0.8px)] bg-[length:5px_5px]',
  },
  {
    grow: 0.55,
    texture:
      'bg-white bg-[linear-gradient(100deg,transparent_20%,color-mix(in_srgb,var(--zm-color-white)_90%,transparent)_45%,transparent_70%),linear-gradient(var(--zm-color-white),var(--zm-color-stone))]',
  },
];

/** Reparación: masilla y parches sobre el soporte, antes de la primera capa del sistema. */
export const repairTexture =
  'bg-[color-mix(in_srgb,var(--zm-color-stone),var(--zm-color-navy)_14%)] bg-[radial-gradient(circle_at_22%_30%,color-mix(in_srgb,var(--zm-color-stone),var(--zm-color-white)_40%)_0_7%,transparent_7.5%),radial-gradient(circle_at_64%_58%,color-mix(in_srgb,var(--zm-color-stone),var(--zm-color-white)_40%)_0_5%,transparent_5.5%),radial-gradient(circle_at_80%_22%,color-mix(in_srgb,var(--zm-color-stone),var(--zm-color-white)_40%)_0_3.5%,transparent_4%),radial-gradient(color-mix(in_srgb,var(--zm-color-navy)_18%,transparent)_0.6px,transparent_0.8px)] bg-[length:100%_100%,100%_100%,100%_100%,6px_6px]';

/** Soporte existente: la superficie sobre la que se aplica el sistema. */
export const supportTexture =
  'bg-[color-mix(in_srgb,var(--zm-color-stone),var(--zm-color-navy)_28%)] bg-[repeating-linear-gradient(45deg,color-mix(in_srgb,var(--zm-color-night)_30%,transparent)_0_1px,transparent_1px_12px)]';
