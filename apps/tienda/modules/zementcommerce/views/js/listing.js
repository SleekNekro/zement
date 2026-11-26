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

  const matches = (product) =>
    Object.entries(filters).every(([field, value]) => !value || product[field] === value);

  const apply = () => {
    const visible = new Set(index.filter(matches).map((product) => String(product.id)));
    const active = Object.values(filters).some(Boolean);

    for (const card of document.querySelectorAll('#js-product-list [data-id-product]')) {
      // La tarjeta va dentro de una columna de la rejilla: se oculta la columna entera.
      const cell = card.closest('.products > *') ?? card;
      cell.hidden = !visible.has(card.getAttribute('data-id-product'));
    }
    for (const row of root.querySelectorAll('[data-zm-row]')) {
      row.hidden = !visible.has(row.getAttribute('data-zm-row'));
    }

    status.textContent = active
      ? root
          .getAttribute('data-zm-shown')
          .replace('%1$s', String(visible.size))
          .replace('%2$s', String(index.length))
      : '';
    empty.hidden = visible.size > 0;
  };

  const setView = (view) => {
    const isTable = view === 'table';
    table.hidden = !isTable;
    const list = cardList();
    if (list) {
      list.hidden = isTable;
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
    apply();
  };

  for (const button of filterButtons) {
    button.addEventListener('click', () =>
      setFilter(button.getAttribute('data-zm-filter'), button.getAttribute('data-zm-value')),
    );
  }
  for (const button of viewButtons) {
    button.addEventListener('click', () => setView(button.getAttribute('data-zm-view')));
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
