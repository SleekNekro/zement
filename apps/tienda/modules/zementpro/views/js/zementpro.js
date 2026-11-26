/**
 * Alta profesional (registro e «Información»): los datos de empresa y el tipo solo se ven con
 * «Soy profesional» marcado, con el plazo de revisión debajo. Sin JavaScript se ven siempre.
 */
(() => {
  const pro = document.querySelector('input[name="zm_pro"]');
  if (!pro) return;

  const form = pro.closest('form');
  const groupOf = (name) => form.querySelector(`[name="${name}"]`)?.closest('.mb-3, .form-group');
  const groups = ['zm_pro_type', 'company', 'siret'].map(groupOf).filter(Boolean);

  const help = document.createElement('p');
  help.className = 'zm-pro-help';
  help.textContent = window.zementPro?.help ?? '';
  groups.at(-1)?.after(help);

  // Con la casilla marcada, tipo, razón social y número fiscal pasan a ser obligatorios (lo valida
  // también el servidor): se marcan como tales y se quita el «Opcional» del núcleo.
  const radios = [...form.querySelectorAll('input[name="zm_pro_type"]')];
  // El núcleo etiqueta el grupo con un «for» que no apunta a ningún campo: se nombra como grupo.
  radios[0]?.parentElement?.parentElement?.setAttribute('role', 'radiogroup');
  form.querySelector('#field-zm_pro_type-label')?.removeAttribute('for');
  const fields = ['company', 'siret'].map((name) => form.querySelector(`input[name="${name}"]`));

  const sync = () => {
    for (const group of [...groups, help]) group.hidden = !pro.checked;
    for (const input of [...fields, radios[0]].filter(Boolean)) {
      input.required = pro.checked;
      const group = input.closest('.mb-3, .form-group');
      group?.querySelector('.form-label')?.classList.toggle('required', pro.checked);
      const optional = group?.querySelector('.form-text');
      if (optional && input.type !== 'radio') optional.hidden = pro.checked;
    }
  };
  pro.addEventListener('change', sync);
  sync();
})();
