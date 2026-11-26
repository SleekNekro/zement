/**
 * Muestra del sistema (portada): presenta el soporte y aplica las capas fase a fase como un vídeo. Se
 * reproduce sola al entrar en pantalla, se puede pausar y cada pista salta a su fase (y pausa). Con
 * «reducir movimiento» no se reproduce sola: se muestra terminada y se recorre con las pistas.
 */
const PHASE_MS = 3000;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll<HTMLElement>('[data-sample]').forEach(setupSample);

function setupSample(figure: HTMLElement): void {
  const slabs = [...figure.querySelectorAll<HTMLElement>('[data-slab]')];
  const steps = [...figure.querySelectorAll<HTMLButtonElement>('[data-sample-step]')];
  const panels = [...figure.querySelectorAll<HTMLElement>('[data-sample-panel]')];
  const intro = figure.querySelector<HTMLElement>('[data-sample-intro]');
  const backdrops = [...figure.querySelectorAll<HTMLElement>('[data-sample-backdrop]')];
  const live = figure.querySelector<HTMLElement>('[data-sample-live]');
  const play = figure.querySelector<HTMLButtonElement>('[data-sample-play]');
  if (slabs.length === 0 || !play) return;

  const last = steps.length - 1;
  let current = -1;
  let timer = 0;
  let isPlaying = false;

  figure.dataset.ready = '';
  figure.style.setProperty('--phase-ms', `${PHASE_MS}ms`);

  const render = (index: number): void => {
    current = index;
    for (const slab of slabs) {
      const slabIndex = Number(slab.dataset.slab);
      // El soporte (0) está siempre; cada capa se aplica al llegar a su fase.
      slab.classList.toggle('is-built', slabIndex === 0 || slabIndex <= index);
      slab.classList.toggle('is-active', slabIndex === index);
      // Al aplicar la reparación (fase 1), las grietas del soporte se cierran.
      if (slabIndex === 0) slab.classList.toggle('is-repaired', index >= 1);
    }
    for (const step of steps) {
      const stepIndex = Number(step.dataset.sampleStep);
      const state = stepIndex < index ? 'done' : stepIndex === index ? 'current' : 'todo';
      // Reasignar el estado reinicia la barra de progreso de la pista actual.
      step.dataset.state = '';
      void step.offsetWidth;
      step.dataset.state = state;
      step.setAttribute('aria-pressed', String(stepIndex === index));
    }
    for (const panel of panels) {
      panel.dataset.visible = String(Number(panel.dataset.samplePanel) === index);
    }
    if (intro) intro.dataset.visible = String(index < 0);
    // Fondo de la fase; antes de empezar, el del soporte.
    const backdrop = Math.max(index, 0);
    for (const photo of backdrops) {
      photo.dataset.visible = String(Number(photo.dataset.sampleBackdrop) === backdrop);
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
      render(Number(step.dataset.sampleStep));
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
  observer.observe(figure.querySelector('[data-sample-scene]') ?? figure);
}

// Módulo propio: sus constantes no comparten ámbito con los demás scripts.
export {};
