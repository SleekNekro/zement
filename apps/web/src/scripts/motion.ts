/**
 * Movimiento e interacción de la web (sin dependencias).
 * - Se activa solo si el usuario no ha pedido «reducir movimiento».
 * - Usa IntersectionObserver y requestAnimationFrame; los listeners de scroll son pasivos.
 * - Todo el contenido es visible sin este script (mejora progresiva).
 */

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const narrowScreen = window.matchMedia('(width < 64rem)');

if (!reducedMotion) {
  root.classList.add('motion');
}

setupHeader();
setupShopBar();
setupMobileMenu();

if (!reducedMotion) {
  setupReveals();
  setupScrubWords();
}

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
    const text = block.textContent?.trim() ?? '';
    const words = text.split(/\s+/);

    // Copia accesible del texto completo; las palabras animadas quedan ocultas a lectores de pantalla.
    const accessibleCopy = document.createElement('span');
    accessibleCopy.className = 'sr-only';
    accessibleCopy.textContent = text;

    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    visual.append(
      ...words.flatMap((word, index) => {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = word;
        return index < words.length - 1 ? [span, document.createTextNode(' ')] : [span];
      }),
    );

    block.replaceChildren(accessibleCopy, visual);
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

/**
 * Barra de la tienda (móvil/tablet): visible tras el hero, oculta con el menú abierto o mientras se
 * escribe en un campo (el teclado en pantalla la empujaría sobre el formulario).
 */
function setupShopBar(): void {
  const bar = document.querySelector<HTMLElement>('[data-shop-bar]');
  const link = bar?.querySelector<HTMLAnchorElement>('[data-shop-bar-link]');
  if (!bar || !link) return;
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const menu = document.querySelector<HTMLDetailsElement>('[data-mobile-menu]');
  let showFrom = 0;
  let isTyping = false;
  let lastVisible = '';

  const measure = (): void => {
    showFrom = hero ? hero.offsetTop + hero.offsetHeight * 0.6 : window.innerHeight * 0.5;
  };
  const update = (): void => {
    const visible = String(window.scrollY > showFrom && !isTyping && !menu?.open);
    if (visible === lastVisible) return;
    bar.dataset.visible = lastVisible = visible;
    // Fuera de la vista no recibe el foco del teclado.
    link.tabIndex = visible === 'true' ? 0 : -1;
    root.classList.toggle('has-shop-bar', visible === 'true');
  };
  const isField = (target: EventTarget | null): boolean =>
    target instanceof HTMLElement && target.matches('input, textarea, select');

  measure();
  window.addEventListener('resize', measure, { passive: true });
  document.addEventListener('focusin', (event) => {
    isTyping = isField(event.target);
    update();
  });
  document.addEventListener('focusout', () => {
    isTyping = false;
    update();
  });
  menu?.addEventListener('toggle', update);
  onScrollFrame(update);
}

/** Cabecera: transparente sobre el hero; en móvil se oculta al bajar y reaparece al subir. */
function setupHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (!header) return;
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  let lastY = window.scrollY;

  // Medidas que solo cambian al redimensionar: se leen entonces, no en cada fotograma de scroll.
  let heroBottom = 0;
  let headerHeight = 0;
  const measure = (): void => {
    headerHeight = header.offsetHeight;
    heroBottom = hero ? hero.offsetTop + hero.offsetHeight - headerHeight : 0;
  };
  measure();
  window.addEventListener('resize', measure, { passive: true });

  // Solo se escribe en el DOM cuando el valor cambia (evita recalcular estilos en cada fotograma).
  let lastOverHero = '';
  let lastHidden = '';
  let lastOffset = '';
  const update = (): void => {
    const y = window.scrollY;
    // En pantallas estrechas el texto del hero pasa bajo la cabecera enseguida: sólida al empezar el scroll.
    const transparentUntil = narrowScreen.matches ? 24 : heroBottom;
    const overHero = String(Boolean(hero) && y < transparentUntil);
    const menuOpen = header.querySelector('details[open]') !== null;
    // Solo en móvil/tablet se oculta al bajar (allí la tienda queda en la barra inferior); en
    // escritorio la cabecera, con su botón «Tienda», está siempre visible.
    const isHidden =
      narrowScreen.matches && !reducedMotion && !menuOpen && y > 400 && y > lastY + 2;
    const hidden = String(isHidden);
    const offset = isHidden ? '0px' : `${headerHeight}px`;

    if (overHero !== lastOverHero) header.dataset.overHero = lastOverHero = overHero;
    if (hidden !== lastHidden) header.dataset.hidden = lastHidden = hidden;
    if (offset !== lastOffset) root.style.setProperty('--header-offset', (lastOffset = offset));
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
  // Mientras el menú está abierto, todo lo que queda detrás es inerte (no recibe foco ni clics).
  const behind = [...document.querySelectorAll<HTMLElement>('main, footer, [data-menu-behind]')];
  menu.addEventListener('toggle', () => {
    document.body.style.overflow = menu.open ? 'hidden' : '';
    for (const element of behind) element.inert = menu.open;
  });
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
