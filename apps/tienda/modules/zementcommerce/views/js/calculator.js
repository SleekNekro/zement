/**
 * Calculadora de cantidades de la ficha de producto (módulo zementcommerce).
 *
 * Con la superficie (y las capas o el espesor) calcula el producto necesario y el número de
 * envases, para el producto de la ficha y para cada paso de su sistema. Los consumos vienen de
 * la ficha técnica (data/commerce.json) en data-zm-calculator / data-zm-step:
 *   mode «coats»: rate por capa y m² · «thickness»: rate por mm y m² · «area»: rate por m².
 * Sin JavaScript la ficha sigue mostrando el sistema con su formato.
 */
(() => {
  const root = document.querySelector('[data-zm-tools]');

  if (!root) {
    return;
  }

  const MARGIN = 0.1;
  const number = new Intl.NumberFormat(document.documentElement.lang || undefined, {
    maximumFractionDigits: 1,
  });
  const read = (element, fallback) => {
    const value = Number.parseFloat(String(element?.value ?? '').replace(',', '.'));
    return Number.isFinite(value) && value > 0 ? value : fallback;
  };
  const parse = (element, attribute) => {
    try {
      return JSON.parse(element.getAttribute(attribute));
    } catch {
      return null;
    }
  };

  const area = root.querySelector('[data-zm-area]');
  const calculatorBox = root.querySelector('[data-zm-calculator]');
  const calculator = calculatorBox ? parse(calculatorBox, 'data-zm-calculator') : null;
  const coats = root.querySelector('[data-zm-coats]');
  const thickness = root.querySelector('[data-zm-thickness]');
  const margin = root.querySelector('[data-zm-margin]');
  const result = root.querySelector('[data-zm-result]');
  const useButton = root.querySelector('[data-zm-use]');
  const quantityInput = document.querySelector('#quantity_wanted');
  const steps = [...root.querySelectorAll('[data-zm-step]')].map((element) => ({
    element,
    data: parse(element, 'data-zm-step'),
    output: element.querySelector('[data-zm-qty]'),
  }));

  /** Cantidad y envases; los envases en litros se convierten a kg con la densidad si hace falta. */
  const estimate = (data, surface, layers, millimetres) => {
    const factor =
      data.mode === 'coats'
        ? (layers ?? data.coats ?? 1)
        : data.mode === 'thickness'
          ? (millimetres ?? data.thickness ?? 1)
          : 1;
    const amount = surface * data.rate * factor * (margin?.checked === false ? 1 : 1 + MARGIN);
    let packAmount = data.pack.size;

    if (data.pack.unit === 'L' && data.rateUnit === 'kg' && data.density) {
      packAmount = data.pack.size * data.density;
    }

    const packs = Math.max(1, Math.ceil(amount / packAmount - 1e-9));

    return {
      text: `${number.format(amount)} ${data.rateUnit} → ${packs} × ${number.format(data.pack.size)} ${data.pack.unit}`,
      packs,
    };
  };

  let lastPacks = 1;

  const update = () => {
    const surface = read(area, 20);

    if (calculator && result) {
      const { text, packs } = estimate(
        calculator,
        surface,
        read(coats, null),
        read(thickness, null),
      );
      result.textContent = text;
      lastPacks = packs;
    }

    for (const step of steps) {
      if (step.data && step.output) {
        step.output.textContent = estimate(step.data, surface, null, null).text;
      }
    }

    // Para «Solicitar presupuesto»: lo calculado viaja en el mensaje del formulario de contacto.
    window.zementCalculation = {
      area: surface,
      coats: calculator?.mode === 'coats' ? read(coats, calculator.coats) : null,
      thickness: calculator?.mode === 'thickness' ? read(thickness, calculator.thickness) : null,
      quantity: calculator && result ? result.textContent : null,
      system: steps
        .filter((step) => step.data && step.output)
        .map((step) => {
          // «Z.02 · Este producto» → «Z.02».
          const code = step.element.querySelector('.zm-system__code')?.textContent.split(' · ')[0];
          const name = step.element.querySelector('.zm-system__product')?.textContent;
          return `${(code ?? '').trim()} ${(name ?? '').trim()}: ${step.output.textContent}`.trim();
        }),
    };
    document.dispatchEvent(new CustomEvent('zm:calculated', { detail: window.zementCalculation }));
  };

  for (const element of root.querySelectorAll('[data-zm-js]')) {
    element.hidden = false;
  }

  if (useButton && quantityInput) {
    useButton.hidden = false;
    useButton.addEventListener('click', () => {
      quantityInput.value = String(lastPacks);
      quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
      quantityInput.focus();
    });
  }

  root.addEventListener('input', update);
  root.addEventListener('change', update);
  update();
})();

/**
 * «Solicitar presupuesto» (productos sin precio todavía): reescribe el enlace al formulario de
 * contacto con el formato elegido y lo calculado, para que el cliente no tenga que volver a
 * escribirlo. Sin JavaScript, el enlace ya lleva el producto.
 */
(() => {
  const box = document.querySelector('[data-zm-quote]');
  const link = box?.querySelector('[data-zm-quote-link]');

  if (!box || !link) {
    return;
  }

  let quote;
  try {
    quote = JSON.parse(box.getAttribute('data-zm-quote'));
  } catch {
    return;
  }

  let calculation = window.zementCalculation ?? null;
  const labels = quote.labels;

  const selectedFormat = () => {
    const input = document.querySelector(
      '.product__variants input:checked, .product-variants input:checked',
    );
    if (input) {
      // La etiqueta lleva oculto el nombre del grupo («Gebinde - …»): solo el valor visible.
      const label = document.querySelector(`label[for="${input.id}"]`)?.cloneNode(true);
      label?.querySelectorAll('.visually-hidden, .sr-only').forEach((hidden) => hidden.remove());
      return label?.textContent.replace(/\s+/g, ' ').trim() || null;
    }
    const select = document.querySelector('.product__variants select, .product-variants select');
    return select ? (select.options[select.selectedIndex]?.textContent.trim() ?? null) : null;
  };

  const message = () => {
    const lines = [...quote.base];
    const format = selectedFormat();
    if (format) {
      lines.push(`${labels.format}: ${format}`);
    }
    if (calculation) {
      const detail = [`${labels.area}: ${calculation.area} m²`];
      if (calculation.coats) {
        detail.push(`${labels.coats}: ${calculation.coats}`);
      }
      if (calculation.thickness) {
        detail.push(`${labels.thickness}: ${calculation.thickness} mm`);
      }
      lines.push(detail.join(' · '));
      if (calculation.quantity) {
        lines.push(`${labels.quantity}: ${calculation.quantity}`);
      }
      if (calculation.system.length) {
        lines.push(`${labels.system}:`, ...calculation.system.map((line) => `- ${line}`));
      }
    }
    // Una sola línea con « | »: la redirección canónica de PrestaShop descarta los saltos de línea.
    return [...lines, quote.delivery].join(' | ');
  };

  const refresh = () => {
    const params = new URLSearchParams({ id_product: String(quote.productId), message: message() });
    link.href = `${quote.url}?${params.toString()}`;
  };

  document.addEventListener('zm:calculated', (event) => {
    calculation = event.detail;
    refresh();
  });
  document.addEventListener('change', refresh);
  window.prestashop?.on?.('updatedProduct', refresh);
  refresh();
})();
