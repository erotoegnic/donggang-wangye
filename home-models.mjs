// Original schematic illustrations: colours identify models, not actual roof colours or ritual ranks.
const templeSlugs = new Set(['ding', 'dingzhong', 'xiazhong', 'pu', 'anhai', 'xia', 'lunding']);
export function modelForPin(pin) {
  let name = 'building';
  if (pin.id === 'donglong') name = 'donglong';
  else if (pin.id === 'coast') name = 'coast';
  else if (pin.id === 'jialian') name = 'temple';
  else if (pin.category === 'temple' && templeSlugs.has(pin.slug)) name = 'temple-' + pin.slug;
  else if (pin.category === 'troupe-base') {
    const topic = [pin.id, pin.url, ...(pin.art || [])].join(' ');
    name = /music/.test(topic) ? 'music' : /drum/.test(topic) ? 'drums' : /crane/.test(topic) ? 'crane' : /songjiang|flag/.test(topic) ? 'flags' : 'generals';
  } else if ((pin.art || []).some(art => /boat/.test(art))) name = 'boat';
  return { name, src: '/assets/home-models/' + name + '.webp', width: 192, height: 176 };
}
