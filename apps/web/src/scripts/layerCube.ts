/**
 * Cubo del sistema (portada): presenta el soporte y monta las losas fase a fase como un vídeo. Se reproduce
 * solo al entrar en pantalla, se puede pausar y cada pista salta a su fase (y pausa). Con «reducir
 * movimiento» no se reproduce solo: se muestra montado y se recorre con las pistas.
 */
const PHASE_MS = 3000;
/** Tiempo desde que cae la protección hasta que el cubo se une en un bloque. */
const COMPLETE_MS = 2200;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll<HTMLElement>('[data-cube]').forEach(setupCube);

function setupCube(figure: HTMLElement): void {
  const slabs = [...figure.querySelectorAll<HTMLElement>('[data-slab]')];
  const steps = [...figure.querySelectorAll<HTMLButtonElement>('[data-cube-step]')];
  const panels = [...figure.querySelectorAll<HTMLElement>('[data-cube-panel]')];
  const intro = figure.querySelector<HTMLElement>('[data-cube-intro]');
  const backdrops = [...figure.querySelectorAll<HTMLElement>('[data-cube-backdrop]')];
  const cube = figure.querySelector<HTMLElement>('.cube');
  const live = figure.querySelector<HTMLElement>('[data-cube-live]');
  const play = figure.querySelector<HTMLButtonElement>('[data-cube-play]');
  if (slabs.length === 0 || !play) return;

  const last = slabs.length - 1;
  let current = -1;
  let timer = 0;
  let isPlaying = false;
  let completeTimer = 0;

  figure.dataset.ready = '';
  figure.style.setProperty('--phase-ms', `${PHASE_MS}ms`);

  const render = (index: number): void => {
    current = index;
    for (const slab of slabs) {
      const slabIndex = Number(slab.dataset.slab);
      // El soporte (0) está siempre; las capas aparecen al llegar a su fase.
      slab.classList.toggle('is-built', slabIndex === 0 || slabIndex <= index);
      slab.classList.toggle('is-active', slabIndex === index);
      // Al aplicar la reparación (fase 1), las grietas del soporte se cierran.
      if (slabIndex === 0) slab.classList.toggle('is-repaired', index >= 1);
    }
    for (const step of steps) {
      const stepIndex = Number(step.dataset.cubeStep);
      const state = stepIndex < index ? 'done' : stepIndex === index ? 'current' : 'todo';
      // Reasignar el estado reinicia la barra de progreso de la pista actual.
      step.dataset.state = '';
      void step.offsetWidth;
      step.dataset.state = state;
      step.setAttribute('aria-pressed', String(stepIndex === index));
    }
    for (const panel of panels) {
      panel.dataset.visible = String(Number(panel.dataset.cubePanel) === index);
    }
    if (intro) intro.dataset.visible = String(index < 0);
    // Con la protección aplicada, las capas se unen en un bloque compacto tras su destello.
    window.clearTimeout(completeTimer);
    cube?.classList.remove('is-complete');
    if (index === last) {
      completeTimer = window.setTimeout(
        () => cube?.classList.add('is-complete'),
        reducedMotion ? 0 : COMPLETE_MS,
      );
    }
    // Fondo de la fase; antes de empezar, el del soporte.
    const backdrop = Math.max(index, 0);
    for (const photo of backdrops) {
      photo.dataset.visible = String(Number(photo.dataset.cubeBackdrop) === backdrop);
    }
  };

  const setPlaying = (value: boolean): void => {
    isPlaying = value;
    figure.dataset.playing = String(value);
    const label = value ? 'labelPause' : current >= last ? 'labelReplay' : 'labelPlay';
    play.setAttribute('aria-label', play.dataset[label] ?? '');
  };

  const advance = (): void => {
    if (current >= last) {
      setPlaying(false);
      return;
    }
    render(current + 1);
    timer = window.setTimeout(advance, PHASE_MS);
  };

  const start = (): void => {
    window.clearTimeout(timer);
    if (current >= last) render(-1);
    setPlaying(true);
    // Primero se ve el soporte solo un instante; después, cada fase.
    timer = window.setTimeout(advance, current < 0 ? 900 : 0);
  };

  const stop = (): void => {
    window.clearTimeout(timer);
    setPlaying(false);
  };

  play.addEventListener('click', () => {
    if (live) live.setAttribute('aria-live', 'off');
    if (isPlaying) stop();
    else start();
  });
  for (const step of steps) {
    step.addEventListener('click', () => {
      // Solo se anuncia la ficha cuando la elige el visitante, no en cada fase de la reproducción.
      if (live) live.setAttribute('aria-live', 'polite');
      stop();
      render(Number(step.dataset.cubeStep));
      setPlaying(false);
    });
  }

  if (reducedMotion) {
    render(last);
    setPlaying(false);
    return;
  }

  // Antes de empezar se ve el soporte solo.
  render(-1);
  setPlaying(false);
  // Arranca la primera vez que se ve; si sale de pantalla mientras se reproduce, se pausa.
  let hasStarted = false;
  const observer = new IntersectionObserver(
    (entries) => {
      const isVisible = entries.some((entry) => entry.isIntersecting);
      if (isVisible && !hasStarted) {
        hasStarted = true;
        start();
      } else if (!isVisible && isPlaying) {
        stop();
      }
    },
    { threshold: 0.5 },
  );
  observer.observe(figure.querySelector('.cube-scene') ?? figure);
}

// Módulo propio: sus constantes no comparten ámbito con los demás scripts.
export {};
