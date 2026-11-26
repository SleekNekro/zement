/**
 * Listado de una familia (módulo zementcommerce, plantilla listing.tpl): filtros rápidos por capa
 * y tipo, contador «4 de 12 productos» y cambio entre tarjetas y tabla, sin recargar la página.
 * Las tarjetas del tema se reconocen por data-id-product; la tabla, por data-zm-row.
 * La vista elegida se recuerda en la sesión del navegador.
 */
(() => {
  const root = document.querySelector('[data-zm-listing]');

  if (!root) {
    return;
  }

  let index = [];
  try {
    index = JSON.parse(root.querySelector('[data-zm-listing-index]')?.textContent ?? '[]');
  } catch {
    return;
  }

  const VIEW_KEY = 'zm-listing-view';
  const filters = {};
  const status = root.querySelector('[data-zm-status]');
  const empty = root.querySelector('[data-zm-empty]');
  const table = root.querySelector('[data-zm-table]');
  const filterButtons = [...root.querySelectorAll('[data-zm-filter]')];
  const viewButtons = [...root.querySelectorAll('[data-zm-view]')];
  const cardList = () => document.getElementById('js-product-list');

  /** Entrada escalonada de lo que vuelve a verse (estilo .zm-enter del tema, solo con movimiento). */
  const enter = (elements) => {
    elements.forEach((element, position) => {
      element.classList.remove('zm-enter');
      element.style.setProperty('--zm-enter-index', String(Math.min(position, 11)));
    });
    // Forzar el cálculo para que la animación vuelva a empezar.
    void root.offsetWidth;
    for (const element of elements) {
      element.classList.add('zm-enter');
    }
  };

  const matches = (product) =>
    Object.entries(filters).every(([field, value]) => !value || product[field] === value);

  const apply = (animate = false) => {
    const visible = new Set(index.filter(matches).map((product) => String(product.id)));
    const active = Object.values(filters).some(Boolean);

    const shown = [];
    for (const card of document.querySelectorAll('#js-product-list [data-id-product]')) {
      // La tarjeta va dentro de una columna de la rejilla: se oculta la columna entera.
      const cell = card.closest('.products > *') ?? card;
      cell.hidden = !visible.has(card.getAttribute('data-id-product'));
      if (!cell.hidden) {
        shown.push(cell);
      }
    }
    for (const row of root.querySelectorAll('[data-zm-row]')) {
      row.hidden = !visible.has(row.getAttribute('data-zm-row'));
      if (!row.hidden) {
        shown.push(row);
      }
    }
    if (animate) {
      enter(shown);
    }

    status.textContent = active
      ? root
          .getAttribute('data-zm-shown')
          .replace('%1$s', String(visible.size))
          .replace('%2$s', String(index.length))
      : '';
    empty.hidden = visible.size > 0;
  };

  const setView = (view, animate = false) => {
    const isTable = view === 'table';
    table.hidden = !isTable;
    const list = cardList();
    if (list) {
      list.hidden = isTable;
    }
    if (animate) {
      enter(
        isTable
          ? [...root.querySelectorAll('[data-zm-row]:not([hidden])')]
          : [...document.querySelectorAll('#js-product-list .products > :not([hidden])')],
      );
    }
    for (const button of viewButtons) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-zm-view') === view));
    }
    try {
      sessionStorage.setItem(VIEW_KEY, view);
    } catch {
      // Sin almacenamiento (modo privado): la vista no se recuerda.
    }
  };

  const setFilter = (field, value) => {
    filters[field] = value;
    for (const button of filterButtons) {
      if (button.getAttribute('data-zm-filter') === field) {
        button.setAttribute('aria-pressed', String(button.getAttribute('data-zm-value') === value));
      }
    }
    apply(true);
  };

  for (const button of filterButtons) {
    button.addEventListener('click', () =>
      setFilter(button.getAttribute('data-zm-filter'), button.getAttribute('data-zm-value')),
    );
  }
  for (const button of viewButtons) {
    button.addEventListener('click', () => setView(button.getAttribute('data-zm-view'), true));
  }
  root.querySelector('[data-zm-clear]')?.addEventListener('click', () => {
    for (const field of Object.keys(filters)) {
      setFilter(field, '');
    }
  });

  for (const element of root.querySelectorAll('[data-zm-js]')) {
    element.hidden = false;
  }

  let saved = 'cards';
  try {
    saved = sessionStorage.getItem(VIEW_KEY) ?? 'cards';
  } catch {
    // Sin almacenamiento: tarjetas.
  }
  setView(saved === 'table' ? 'table' : 'cards');

  // Al ordenar, el tema vuelve a pintar las tarjetas: se aplican de nuevo filtros y vista.
  window.prestashop?.on?.('updateProductList', () =>
    setTimeout(() => {
      apply();
      setView(table.hidden ? 'cards' : 'table');
    }),
  );
})();
