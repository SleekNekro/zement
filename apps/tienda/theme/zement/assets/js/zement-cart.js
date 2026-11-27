/**
 * Carrito lateral (templates/_partials/zement-cart-drawer.tpl).
 *
 * - El icono del carrito lo abre con prestashop.blockcart.showModal: el panel es el «modal» del
 *   carrito de Hummingbird, que lo abre y lo cierra.
 * - Al añadir un producto no se abre el panel: el «modal» que llega (modules/ps_shoppingcart/
 *   modal.tpl) se cancela antes de abrirse y se muestra como aviso pequeño en una esquina, que
 *   se cierra solo a los 5 s (no mientras el ratón o el foco están encima).
 * - «Eliminar» quita la línea sin salir de la página y redibuja el panel abierto cuando
 *   ps_shoppingcart.js trae el carrito nuevo (sustituye .blockcart, con su <template> al día).
 */
(() => {
  const template = () => document.querySelector('.blockcart [data-zm-cart-template]');
  const openDrawer = () => document.querySelector('.zm-cart.show');
  let removing = false;

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-zm-cart-open]');
    if (opener) {
      const tpl = template();
      if (!tpl || !window.prestashop?.blockcart?.showModal || openDrawer()) {
        return;
      }
      event.preventDefault();
      window.prestashop.blockcart.showModal(tpl.innerHTML);
      return;
    }

    const remove = event.target.closest('[data-zm-cart-remove]');
    if (remove && window.prestashop) {
      event.preventDefault();
      removing = true;
      remove.closest('.zm-cart__item')?.classList.add('zm-cart__item--removing');
      const url = new URL(remove.href);
      url.searchParams.set('ajax', '1');
      url.searchParams.set('action', 'update');
      fetch(url, { method: 'POST', headers: { Accept: 'application/json' } })
        .then((response) => response.json())
        .then((resp) => {
          window.prestashop.emit('updateCart', {
            reason: { linkAction: 'delete-from-cart' },
            resp,
          });
        })
        .catch(() => {
          removing = false;
          window.location.href = remove.href;
        });
    }
  });

  // Aviso de producto añadido.
  const ADDED_MS = 5000;
  let toast = null;
  let timer = null;

  const closeToast = () => {
    clearTimeout(timer);
    if (!toast) {
      return;
    }
    const leaving = toast;
    toast = null;
    leaving.classList.remove('is-shown');
    setTimeout(() => leaving.remove(), 300);
  };

  const armTimer = () => {
    clearTimeout(timer);
    timer = setTimeout(closeToast, ADDED_MS);
  };

  document.addEventListener('show.bs.modal', (event) => {
    const carrier = event.target.closest?.('[data-zm-added]');
    if (!carrier) {
      return;
    }
    event.preventDefault();
    const content = carrier.querySelector('.zm-added');
    carrier.remove();
    if (!content) {
      return;
    }
    if (toast) {
      toast.remove();
    }
    toast = content;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast?.classList.add('is-shown'));
    toast.addEventListener('mouseenter', () => clearTimeout(timer));
    toast.addEventListener('mouseleave', armTimer);
    toast.addEventListener('focusin', () => clearTimeout(timer));
    toast.addEventListener('focusout', armTimer);
    armTimer();
  });

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-zm-added-close]') || event.target.closest('.zm-added [data-zm-cart-open]')) {
      closeToast();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeToast();
    }
  });

  // Tras «Eliminar», cuando llega el carrito nuevo, el panel abierto toma el <template> nuevo.
  // Solo entonces: al añadir, el panel ya viene al día (y con el aviso «Añadido»).
  new MutationObserver(() => {
    const drawer = openDrawer();
    const tpl = template();
    if (!removing || !drawer || !tpl) {
      return;
    }
    const fresh = tpl.content.querySelector('.modal-content');
    const current = drawer.querySelector('.modal-content');
    if (fresh && current && fresh.innerHTML !== current.innerHTML) {
      current.replaceWith(fresh.cloneNode(true));
      removing = false;
    }
  }).observe(document.body, { childList: true, subtree: true });
})();
