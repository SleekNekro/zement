/**
 * Movimiento e interacción de la web (sin dependencias).
 * - Se activa solo si el usuario no ha pedido «reducir movimiento».
 * - Usa IntersectionObserver y requestAnimationFrame; los listeners de scroll son pasivos.
 * - Todo el contenido es visible sin este script (mejora progresiva).
 */

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (!reducedMotion) {
  root.classList.add('motion');
}

setupHeader();
setupMobileMenu();

if (!reducedMotion) {
  setupReveals();
  setupScrubWords();
  setupHeroLight();
}
setupLayers();

/** Apariciones al entrar en pantalla (`data-reveal`, `data-reveal-lines`, `data-reveal-rule`). */
function setupReveals(): void {
  const targets = document.querySelectorAll<HTMLElement>(
    '[data-reveal], [data-reveal-lines], [data-reveal-rule]',
  );
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
  );
  for (const target of targets) observer.observe(target);
}

/** Texto que se ilumina palabra a palabra según avanza el scroll (`data-scrub-words`). */
function setupScrubWords(): void {
  const blocks = [...document.querySelectorAll<HTMLElement>('[data-scrub-words]')];
  if (blocks.length === 0) return;

  const prepared = blocks.map((block) => {
    const words = block.textContent?.trim().split(/\s+/) ?? [];
    block.setAttribute('aria-label', words.join(' '));
    block.replaceChildren(
      ...words.flatMap((word, index) => {
        const span = document.createElement('span');
        span.className = 'word';
        span.setAttribute('aria-hidden', 'true');
        span.textContent = word;
        return index < words.length - 1 ? [span, document.createTextNode(' ')] : [span];
      }),
    );
    return { block, words: [...block.querySelectorAll<HTMLElement>('.word')] };
  });

  const update = (): void => {
    const viewport = window.innerHeight;
    for (const { block, words } of prepared) {
      const rect = block.getBoundingClientRect();
      // 0 cuando el bloque entra por abajo, 1 cuando su final llega al 40 % superior.
      const progress = clamp((viewport * 0.85 - rect.top) / (rect.height + viewport * 0.45), 0, 1);
      const lit = progress * words.length;
      words.forEach((word, index) => {
        word.style.setProperty('--word-on', String(clamp(lit - index, 0, 1)));
      });
    }
  };

  onScrollFrame(update);
}

/** Luz que sigue al puntero en el hero (solo ratón; en táctil hay una deriva automática en CSS). */
function setupHeroLight(): void {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero || !finePointer) return;

  let targetX = 70;
  let targetY = 35;
  let currentX = targetX;
  let currentY = targetY;
  let frame = 0;

  const animate = (): void => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    hero.style.setProperty('--light-x', `${currentX.toFixed(2)}%`);
    hero.style.setProperty('--light-y', `${currentY.toFixed(2)}%`);
    frame =
      Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05
        ? requestAnimationFrame(animate)
        : 0;
  };

  hero.addEventListener(
    'pointermove',
    (event) => {
      const rect = hero.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width) * 100;
      targetY = ((event.clientY - rect.top) / rect.height) * 100;
      if (!frame) frame = requestAnimationFrame(animate);
    },
    { passive: true },
  );
}

/** Cabecera: transparente sobre el hero, se oculta al bajar y reaparece al subir. */
function setupHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (!header) return;
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  let lastY = window.scrollY;

  const update = (): void => {
    const y = window.scrollY;
    const heroBottom = hero ? hero.offsetTop + hero.offsetHeight - header.offsetHeight : 0;
    header.dataset.overHero = String(Boolean(hero) && y < heroBottom);
    const menuOpen = header.querySelector('details[open]') !== null;
    header.dataset.hidden = String(!reducedMotion && !menuOpen && y > 400 && y > lastY + 2);
    if (Math.abs(y - lastY) > 2) lastY = y;
  };

  onScrollFrame(update);
}

/** Menú móvil: se cierra al elegir un enlace o pulsar Escape. */
function setupMobileMenu(): void {
  const menu = document.querySelector<HTMLDetailsElement>('[data-mobile-menu]');
  if (!menu) return;
  menu.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a')) menu.open = false;
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      menu.querySelector('summary')?.focus();
    }
  });
  menu.addEventListener('toggle', () => {
    document.body.style.overflow = menu.open ? 'hidden' : '';
  });
}

/**
 * Sistema por capas: al llegar cada paso, se «construye» su capa en la sección del sistema
 * y queda resaltada la activa.
 */
function setupLayers(): void {
  const steps = [...document.querySelectorAll<HTMLElement>('[data-layer-step]')];
  const layers = [...document.querySelectorAll<HTMLElement>('[data-layer]')];
  if (steps.length === 0 || layers.length === 0) return;

  const activate = (index: number): void => {
    layers.forEach((layer) => {
      const layerIndex = Number(layer.dataset.layer);
      layer.classList.toggle('is-built', layerIndex <= index);
      layer.classList.toggle('is-active', layerIndex === index);
    });
    steps.forEach((step) => {
      step.dataset.active = String(Number(step.dataset.layerStep) === index);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activate(Number((entry.target as HTMLElement).dataset.layerStep));
      }
    },
    { rootMargin: '-45% 0px -45% 0px' },
  );
  for (const step of steps) observer.observe(step);
}

/** Ejecuta `callback` como mucho una vez por fotograma mientras haya scroll o cambio de tamaño. */
function onScrollFrame(callback: () => void): void {
  let ticking = false;
  const schedule = (): void => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      callback();
    });
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  callback();
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
