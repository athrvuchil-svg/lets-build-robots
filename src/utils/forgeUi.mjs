/**
 * Apply a named Forge preset to checkbox-like DOM nodes and force one report
 * refresh. Keeping this outside the Astro template makes the click contract
 * testable without a browser and avoids stale listener behavior.
 */
export function applyPresetSelection({ name, presetMap, inputs, buttons = [], update }) {
  const ids = new Set(presetMap[name] ?? []);
  inputs.forEach((input) => { input.checked = ids.has(input.value); });
  buttons.forEach((button) => { button.classList?.toggle('is-active', button.dataset?.preset === name); });
  update();
}

export function bindPresetButtons({ root, presetMap, inputs, update, replaceUrl = () => {}, onApply = () => {} }) {
  const buttons = [...(root?.querySelectorAll('[data-preset]') ?? [])];
  const apply = (name) => {
    applyPresetSelection({ name, presetMap, inputs, buttons, update });
    replaceUrl(name);
    onApply(name);
  };
  buttons.forEach((button) => button.addEventListener('click', () => apply(button.dataset?.preset ?? 'clear')));
  return { buttons, apply };
}
