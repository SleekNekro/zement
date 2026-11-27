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
  const fill = (template, ...values) =>
    values.reduce((text, value, index) => text.replace(`%${index + 1}$s`, value), template ?? '');

  /**
   * Valor de un campo numérico o, si está vacío o fuera de su mínimo y máximo, el de la ficha.
   * Un valor no válido se marca (aria-invalid) y su aviso dice con qué cifra se sigue calculando.
   * Mientras se escribe, un campo vacío no se marca: el aviso llega al salir del campo.
   */
  const read = (element, fallback, event) => {
    if (!element) {
      return fallback;
    }
    const raw = String(element.value ?? '')
      .trim()
      .replace(',', '.');
    const value = Number.parseFloat(raw);
    const min = Number.parseFloat(element.min);
    const max = Number.parseFloat(element.max);
    const valid = Number.isFinite(value) && value > 0 && !(value < min) && !(value > max);
    const quiet = !valid && raw === '' && event?.type === 'input' && event.target === element;
    const error = document.getElementById(`${element.id}-error`);

    if (valid || quiet) {
      element.removeAttribute('aria-invalid');
      element.removeAttribute('aria-describedby');
      if (error) {
        error.hidden = true;
      }
    } else if (error && fallback !== null && fallback !== undefined) {
      error.textContent = Number.isFinite(max)
        ? fill(
            root.dataset.zmInvalidRange,
            number.format(min),
            number.format(max),
            number.format(fallback),
          )
        : fill(root.dataset.zmInvalidMin, number.format(min || 1), number.format(fallback));
      error.hidden = false;
      element.setAttribute('aria-invalid', 'true');
      element.setAttribute('aria-describedby', error.id);
    }

    return valid ? value : fallback;
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

  /**
   * Envase del formato elegido en la ficha (radios o desplegable de combinaciones). Cada envase
   * lleva el valor «Formato» de su combinación (attribute); sin formatos, el único envase.
   */
  const selectedPack = (data) => {
    if (!data.packs?.length) {
      return data.pack;
    }
    const choice = document.querySelector(
      '.product__variants input[type="radio"]:checked, .product-variants input[type="radio"]:checked, .product__variants select, .product-variants select',
    );
    const value = Number(choice?.value);
    return data.packs.find((pack) => pack.attribute === value) ?? data.pack;
  };

  /**
   * Cantidad y envases. La cantidad se expresa en la unidad del envase: si el consumo de la ficha
   * va en kg y el envase en litros, se pasa a litros con la densidad («≈ 1,1 L → 1 × 5 L»).
   * Sin envase comparable (pack null: consumo en L y envase en kg, sin densidad), solo la cantidad.
   */
  const estimate = (data, surface, layers, millimetres, pack = data.pack) => {
    const factor =
      data.mode === 'coats'
        ? (layers ?? data.coats ?? 1)
        : data.mode === 'thickness'
          ? (millimetres ?? data.thickness ?? 1)
          : 1;
    let amount = surface * data.rate * factor * (margin?.checked === false ? 1 : 1 + MARGIN);
    let unit = data.rateUnit;

    if (!pack) {
      return { text: `≈ ${number.format(amount)} ${unit}`, packs: null };
    }

    if (pack.unit === 'L' && data.rateUnit === 'kg' && data.density) {
      amount /= data.density;
      unit = 'L';
    }

    const packs = Math.max(1, Math.ceil(amount / pack.size - 1e-9));

    return {
      text: `≈ ${number.format(amount)} ${unit} → ${packs} × ${number.format(pack.size)} ${pack.unit}`,
      packs,
    };
  };

  let lastPacks = 1;

  const update = (event) => {
    const surface = read(area, 20, event);
    const layers = read(coats, calculator?.coats ?? null, event);
    const millimetres = read(thickness, calculator?.thickness ?? null, event);

    if (calculator && result) {
      const { text, packs } = estimate(
        calculator,
        surface,
        layers,
        millimetres,
        selectedPack(calculator),
      );
      result.textContent = text;
      lastPacks = packs;
      if (useButton) {
        useButton.hidden = packs === null || !quantityInput;
      }
    }

    for (const step of steps) {
      if (step.data && step.output) {
        // El paso de esta ficha cuenta con el formato elegido; los demás, con su envase.
        const current = step.element.classList.contains('zm-system__step--current');
        step.output.textContent = estimate(
          step.data,
          surface,
          null,
          null,
          current ? selectedPack(step.data) : step.data.pack,
        ).text;
      }
    }

    // Para «Solicitar presupuesto»: lo calculado viaja en el mensaje del formulario de contacto.
    window.zementCalculation = {
      area: surface,
      coats: calculator?.mode === 'coats' ? layers : null,
      thickness: calculator?.mode === 'thickness' ? millimetres : null,
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
      if (lastPacks === null) {
        return;
      }
      quantityInput.value = String(lastPacks);
      quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
      quantityInput.focus();
    });
  }

  root.addEventListener('input', update);
  root.addEventListener('change', update);
  // Cambiar de formato (combinación) cambia el envase con el que se cuenta.
  document.addEventListener('change', (event) => {
    if (
      event.target instanceof Element &&
      event.target.closest('.product__variants, .product-variants')
    ) {
      update();
    }
  });
  window.prestashop?.on?.('updatedProduct', update);
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
