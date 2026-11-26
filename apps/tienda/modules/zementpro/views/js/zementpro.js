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

  const sync = () => {
    for (const group of [...groups, help]) group.hidden = !pro.checked;
  };
  pro.addEventListener('change', sync);
  sync();
})();
