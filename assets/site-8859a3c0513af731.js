window.activateIllustrations=root=>{root.querySelectorAll('template[data-art-animation]').forEach(t=>{const p=t.parentElement;if(p.classList.contains('art-ready'))return;p.append(t.content.cloneNode(true));p.classList.add('art-ready');});};
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const menu = $('.menu-toggle');
  const nav = $('#main-nav');
  const flowMenu = $('.nav-flow');
  const closeMenu = () => {
    menu.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    if (flowMenu) flowMenu.open = false;
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && flowMenu?.open) {
      flowMenu.open = false; flowMenu.querySelector('summary').focus();
    } else if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu(); menu.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });

  const search = $('#role-search');
  if (search) {
    let filter = '全部';
    const choices = $$('[data-filter]').map(button => button.dataset.filter);
    const apply = () => {
      const query = search.value.trim().toLocaleLowerCase();
      let count = 0;
      $$('#people-grid .story-card').forEach(card => {
        card.hidden = !((filter === '全部' || card.dataset.type === filter) && card.dataset.search.toLocaleLowerCase().includes(query));
        if (!card.hidden) count++;
      });
      $$('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
      $('#role-count').textContent = `找到 ${count} ${$('#people-grid').dataset.countLabel || '個職務與團體'}`;
      $('#no-results').hidden = count > 0;
    };
    const writeURL = () => {
      const url = new URL(location.href);
      for (const [key, value] of Object.entries({q:search.value, type:filter === '全部' ? '' : filter})) {
        if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
      }
      history.replaceState(null, '', url);
    };
    const readURL = () => {
      const params = new URLSearchParams(location.search);
      search.value = params.get('q') || '';
      filter = choices.includes(params.get('type')) ? params.get('type') : '全部';
      apply();
    };
    search.addEventListener('input', event => { if (!event.isComposing) { apply(); writeURL(); } });
    search.addEventListener('compositionend', () => { apply(); writeURL(); });
    $$('[data-filter]').forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; apply(); writeURL(); }));
    $('#reset-search').addEventListener('click', () => { search.value = ''; filter = '全部'; apply(); writeURL(); search.focus(); });
    window.addEventListener('popstate', readURL);
    window.addEventListener('pageshow', readURL);
    readURL();
  }

  if ($('#count-days')) {
    const date = window.WANGYE_CONFIG?.confirmedStart;
    const target = date ? Date.parse(date) : NaN;
    if (Number.isFinite(target)) {
      const tick = () => {
        const remaining = Math.max(0, target - Date.now());
        $('#count-days').textContent = String(Math.floor(remaining / 86400000));
        $('#count-hours').textContent = String(Math.floor(remaining / 3600000) % 24).padStart(2, '0');
        $('#count-minutes').textContent = String(Math.floor(remaining / 60000) % 60).padStart(2, '0');
        $('#count-status').textContent = remaining ? '距離迎王還有' : '本屆迎王日期已到';
      };
      tick(); setInterval(tick, 60000);
    }
  }
})();

(()=>{const button=document.querySelector('.hero-motion'),hero=document.querySelector('.illustrated-hero');if(!button||!hero)return;const reduced=matchMedia('(prefers-reduced-motion:reduce)');let paused=matchMedia('(pointer:coarse)').matches;function update(){if(!paused&&!reduced.matches&&!document.hidden)window.activateIllustrations(hero);hero.classList.toggle('is-paused',paused||reduced.matches||document.hidden);button.textContent=reduced.matches?'已減少動態':paused?'播放插畫':'暫停插畫';button.setAttribute('aria-pressed',String(paused||reduced.matches));button.disabled=reduced.matches}button.addEventListener('click',()=>{paused=!paused;update()});reduced.addEventListener('change',update);document.addEventListener('visibilitychange',update);update()})();
