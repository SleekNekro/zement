/**
 * Aviso de cookies de Zement (web y tienda): una sola implementación, sin dependencias.
 *
 * Configuración en la página, antes de este script:
 *   <script type="application/json" id="zm-consent-config">
 *     { "version": 1, "gaId": "G-…", "policyUrl": "…", "strings": { … } }
 *   </script>
 *
 * - Primera visita: aviso con «Aceptar todo», «Rechazar todo» (mismo nivel) y «Configurar».
 * - La elección se guarda en la cookie técnica `zm_consent` (6 meses) y se puede cambiar desde
 *   cualquier enlace a «#zm-cookies» o con `window.zementConsent.open()`.
 * - Google Analytics 4 (gaId) solo se carga si se acepta la analítica: modo de consentimiento
 *   básico de Google (nada se descarga antes). La publicidad (ad_storage, ad_user_data,
 *   ad_personalization) se concede aparte. Sin gaId, no se carga nada de Google.
 * - Si cambia `version` (nuevas finalidades), se vuelve a preguntar.
 */
(() => {
  const config = (() => {
    try {
      return JSON.parse(document.getElementById('zm-consent-config')?.textContent ?? 'null');
    } catch {
      return null;
    }
  })();

  if (!config?.strings) {
    return;
  }

  const COOKIE = 'zm_consent';
  const MAX_AGE = 60 * 60 * 24 * 182;
  const t = config.strings;
  const categories = ['analytics', 'ads'];

  const read = () => {
    const raw = document.cookie.split('; ').find((part) => part.startsWith(`${COOKIE}=`));
    if (!raw) {
      return null;
    }
    try {
      const value = JSON.parse(decodeURIComponent(raw.slice(COOKIE.length + 1)));
      return value?.v === config.version ? value : null;
    } catch {
      return null;
    }
  };

  const write = (choice) => {
    const value = encodeURIComponent(
      JSON.stringify({ v: config.version, ...choice, at: Date.now() }),
    );
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${COOKIE}=${value}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  };

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }

  let googleLoaded = false;

  const apply = (choice) => {
    if (!config.gaId || !choice.analytics) {
      return;
    }
    const granted = (value) => (value ? 'granted' : 'denied');
    const state = {
      analytics_storage: 'granted',
      ad_storage: granted(choice.ads),
      ad_user_data: granted(choice.ads),
      ad_personalization: granted(choice.ads),
    };

    if (googleLoaded) {
      gtag('consent', 'update', state);
      return;
    }

    gtag('consent', 'default', state);
    gtag('js', new Date());
    gtag('config', config.gaId);
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.gaId)}`;
    document.head.append(script);
    googleLoaded = true;
  };

  const element = (tag, attributes = {}, text = '') => {
    const node = document.createElement(tag);
    for (const [name, value] of Object.entries(attributes)) {
      node.setAttribute(name, value);
    }
    if (text) {
      node.textContent = text;
    }
    return node;
  };

  const policyLink = () => {
    const link = element('a', { href: config.policyUrl, class: 'zm-consent__policy' }, t.policy);
    return link;
  };

  let banner = null;
  let dialog = null;

  const closeBanner = () => {
    banner?.remove();
    banner = null;
  };

  const decide = (choice) => {
    write(choice);
    apply(choice);
    closeBanner();
    dialog?.close();
  };

  const all = (value) => Object.fromEntries(categories.map((key) => [key, value]));

  const openSettings = () => {
    const current = read() ?? all(false);

    if (!dialog) {
      dialog = element('dialog', {
        class: 'zm-consent-dialog',
        'aria-labelledby': 'zm-consent-dialog-title',
      });
      const form = element('form', { method: 'dialog', class: 'zm-consent-dialog__form' });
      form.append(
        element(
          'h2',
          { id: 'zm-consent-dialog-title', class: 'zm-consent__title' },
          t.settingsTitle,
        ),
      );
      form.append(element('p', { class: 'zm-consent__text' }, t.settingsText));

      const rows = [
        { key: 'necessary', title: t.necessaryTitle, text: t.necessaryText, locked: true },
        { key: 'analytics', title: t.analyticsTitle, text: t.analyticsText },
        { key: 'ads', title: t.adsTitle, text: t.adsText },
      ];

      for (const row of rows) {
        const id = `zm-consent-${row.key}`;
        const wrapper = element('div', { class: 'zm-consent-dialog__row' });
        const input = element('input', {
          type: 'checkbox',
          id,
          name: row.key,
          class: 'zm-consent-dialog__check',
        });
        if (row.locked) {
          input.checked = true;
          input.disabled = true;
        }
        const label = element('label', { for: id, class: 'zm-consent-dialog__label' });
        label.append(element('span', { class: 'zm-consent-dialog__name' }, row.title));
        if (row.locked) {
          label.append(element('span', { class: 'zm-consent-dialog__always' }, t.alwaysOn));
        }
        label.append(element('span', { class: 'zm-consent-dialog__desc' }, row.text));
        wrapper.append(input, label);
        form.append(wrapper);
      }

      const actions = element('div', { class: 'zm-consent__actions' });
      const save = element(
        'button',
        { type: 'submit', class: 'zm-consent__button', value: 'save' },
        t.save,
      );
      const reject = element(
        'button',
        { type: 'submit', class: 'zm-consent__button', value: 'reject' },
        t.reject,
      );
      const accept = element(
        'button',
        { type: 'submit', class: 'zm-consent__button', value: 'accept' },
        t.accept,
      );
      actions.append(reject, save, accept);
      form.append(actions, policyLink());
      dialog.append(form);
      document.body.append(dialog);

      dialog.addEventListener('close', () => {
        const action = dialog.returnValue;
        if (action === 'accept') {
          decide(all(true));
        } else if (action === 'reject') {
          decide(all(false));
        } else if (action === 'save') {
          decide(Object.fromEntries(categories.map((key) => [key, form.elements[key].checked])));
        }
        dialog.returnValue = '';
      });
    }

    for (const key of categories) {
      dialog.querySelector(`[name="${key}"]`).checked = Boolean(current[key]);
    }
    dialog.showModal();
  };

  const showBanner = () => {
    banner = element('section', {
      class: 'zm-consent',
      'aria-labelledby': 'zm-consent-title',
      'aria-live': 'polite',
    });
    banner.append(element('h2', { id: 'zm-consent-title', class: 'zm-consent__title' }, t.title));
    const text = element('p', { class: 'zm-consent__text' }, `${t.text} `);
    text.append(policyLink());
    banner.append(text);

    const actions = element('div', { class: 'zm-consent__actions' });
    const reject = element('button', { type: 'button', class: 'zm-consent__button' }, t.reject);
    const settings = element('button', { type: 'button', class: 'zm-consent__button' }, t.settings);
    const accept = element('button', { type: 'button', class: 'zm-consent__button' }, t.accept);
    reject.addEventListener('click', () => decide(all(false)));
    settings.addEventListener('click', openSettings);
    accept.addEventListener('click', () => decide(all(true)));
    actions.append(reject, settings, accept);
    banner.append(actions);
    document.body.append(banner);
  };

  document.addEventListener('click', (event) => {
    const link =
      event.target instanceof Element ? event.target.closest('a[href$="#zm-cookies"]') : null;
    if (link) {
      event.preventDefault();
      openSettings();
    }
  });

  window.zementConsent = { open: openSettings, get: read };

  const saved = read();
  const start = () => (saved ? apply(saved) : showBanner());

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
