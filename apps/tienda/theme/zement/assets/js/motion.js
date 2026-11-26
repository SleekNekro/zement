/**
 * Movimiento de la tienda, con el mismo lenguaje que la web de marca (apps/web/src/scripts/motion.ts).
 *
 * - Se carga en <head> (theme.yml) para poner la clase `motion` en <html> antes de pintar: así lo
 *   que aparece al desplazarse no se ve un instante y luego desaparece.
 * - Sin JavaScript o con «reducir movimiento» no se añade la clase y todo se ve quieto.
 * - Qué aparece y cómo está en zement.css (sección «Movimiento»): aquí solo se marca cada elemento
 *   como visible (`is-visible`) cuando entra en pantalla, con un retraso escalonado entre hermanos.
 * - Solo se animan transform, opacity y clip-path.
 */
(() => {
  const root = document.documentElement;

  if (
    !('IntersectionObserver' in window) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  root.classList.add('motion');

  /** Lo que aparece al entrar en pantalla (mismos selectores que en zement.css). */
  const REVEAL = [
    '.zm-proof__item',
    '.zm-projects__title',
    '.zm-projects__list > li',
    '.zm-home-row__head',
    '.products > *',
    '.zm-listing__bar',
    '.zm-sheet__stat',
    '.zm-system__step',
    '.zm-trust',
    '.footer__before',
  ].join(',');

  /** Elementos con más de un hermano visible: se escalonan de cuatro en cuatro (una fila). */
  const STAGGER = 4;

  let observer;

  const watch = () => {
    for (const element of document.querySelectorAll(REVEAL)) {
      if (element.dataset.zmWatched) {
        continue;
      }
      element.dataset.zmWatched = '1';
      const siblings = [...element.parentElement.children].filter((child) => child.matches(REVEAL));
      element.style.setProperty('--zm-reveal-index', String(siblings.indexOf(element) % STAGGER));
      observer.observe(element);
    }
  };

  const start = () => {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    watch();

    // Red de seguridad: con un desplazamiento muy rápido el observador puede no ver pasar un
    // elemento; todo lo que ya está por encima del borde inferior de la pantalla se muestra.
    let pending = false;
    const catchUp = () => {
      pending = false;
      for (const element of document.querySelectorAll('[data-zm-watched]:not(.is-visible)')) {
        if (element.getBoundingClientRect().top < window.innerHeight) {
          element.classList.add('is-visible');
          observer.unobserve(element);
        }
      }
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!pending) {
          pending = true;
          setTimeout(() => requestAnimationFrame(catchUp), 250);
        }
      },
      { passive: true },
    );

    // El tema vuelve a pintar el listado al ordenar o filtrar: se vigilan las tarjetas nuevas.
    let queued = false;
    new MutationObserver(() => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          watch();
        });
      }
    }).observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try {
        start();
      } catch {
        // Si algo falla, nada se queda oculto.
        root.classList.remove('motion');
      }
    });
  } else {
    start();
  }
})();
