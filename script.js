(() => {
  const reachGoal = (goal, params = {}) => {
    try {
      if (typeof window.ym === 'function') window.ym(110849525, 'reachGoal', goal, params);
    } catch (_) {
      // Analytics must never interrupt navigation or image viewing.
    }
  };
  document.querySelectorAll('[data-goal]').forEach(link => {
    link.addEventListener('click', () => reachGoal(link.dataset.goal, { source_id: link.id }));
  });
  document.querySelectorAll('.faq details').forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) reachGoal('faq_open', { source_id: item.querySelector('summary').id });
    });
  });
  document.querySelector('.work-more')?.addEventListener('toggle', event => {
    if (event.currentTarget.open) reachGoal('gallery_more_open', { ship: 'yamal' });
  });

  // Keep the mobile shortcut below the first photograph and away from other order links.
  const sticky = document.querySelector('#cta-mobile-sticky-avito');
  const heroPhoto = document.querySelector('.hero-photo');
  const orderLinks = [...document.querySelectorAll('.avito-link')].filter(link => link !== sticky);
  if (sticky && heroPhoto) {
    let scheduled = false;
    const updateSticky = () => {
      scheduled = false;
      const otherLinkVisible = orderLinks.some(link => {
        const rect = link.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight;
      });
      sticky.hidden = heroPhoto.getBoundingClientRect().bottom > 0 || otherLinkVisible;
    };
    const scheduleSticky = () => {
      if (!scheduled) { scheduled = true; requestAnimationFrame(updateSticky); }
    };
    window.addEventListener('scroll', scheduleSticky, { passive: true });
    window.addEventListener('resize', scheduleSticky);
    if ('ResizeObserver' in window) new ResizeObserver(scheduleSticky).observe(document.body);
    updateSticky();
  }

  const dialog = document.querySelector('#lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('#lightbox-image');
  const stage = dialog.querySelector('.lightbox-stage');
  const status = dialog.querySelector('#lightbox-status');
  const error = dialog.querySelector('#lightbox-error');
  const fallback = dialog.querySelector('#lightbox-image-fallback');
  const fullsize = dialog.querySelector('#lightbox-open-full');
  const title = dialog.querySelector('#lightbox-title');
  const caption = dialog.querySelector('#lightbox-caption');
  const count = dialog.querySelector('#lightbox-count');
  const prev = dialog.querySelector('#lightbox-prev');
  const next = dialog.querySelector('#lightbox-next');
  const close = dialog.querySelector('#lightbox-close');
  const groups = new Map();
  const names = { yamal: 'БДК «Ямал» · борт 156', kunikov: 'БДК «Цезарь Куников»' };
  let group = [];
  let index = 0;
  let opener = null;
  let request = 0;

  document.querySelectorAll('.photo[data-ship]').forEach(link => {
    const ship = link.dataset.ship;
    if (!groups.has(ship)) groups.set(ship, []);
    groups.get(ship).push(link);
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      try { dialog.showModal(); } catch (_) { return; }
      event.preventDefault();
      opener = link;
      group = groups.get(ship);
      index = group.indexOf(link);
      document.body.classList.add('lightbox-open');
      render();
      close.focus({ preventScroll: true });
      reachGoal('gallery_open', { ship, photo_id: link.dataset.photoId, source_id: link.id });
    });
  });

  function render() {
    const link = group[index];
    const token = ++request;
    title.textContent = names[link.dataset.ship];
    caption.textContent = link.dataset.caption;
    count.textContent = `${index + 1} из ${group.length}`;
    prev.disabled = index === 0;
    next.disabled = index === group.length - 1;
    fallback.href = link.href;
    fullsize.href = link.href;
    error.hidden = true;
    image.hidden = true;
    image.alt = link.querySelector('img').alt;
    stage.setAttribute('aria-busy', 'true');
    status.textContent = 'Загружаем фотографию…';
    const pending = new Image();
    pending.onload = () => {
      if (token !== request || !dialog.open) return;
      image.src = link.href;
      image.hidden = false;
      stage.setAttribute('aria-busy', 'false');
      status.textContent = '';
    };
    pending.onerror = () => {
      if (token !== request || !dialog.open) return;
      stage.setAttribute('aria-busy', 'false');
      status.textContent = '';
      error.hidden = false;
    };
    pending.src = link.href;
    dialog.querySelector('.lightbox-scroll').scrollTop = 0;
  }

  function navigate(step) {
    if (!dialog.open || index + step < 0 || index + step >= group.length) return;
    index += step;
    render();
    const link = group[index];
    reachGoal('gallery_navigate', {
      ship: link.dataset.ship, photo_id: link.dataset.photoId,
      direction: step < 0 ? 'prev' : 'next'
    });
    if (document.activeElement === prev && prev.disabled) next.focus();
    if (document.activeElement === next && next.disabled) prev.focus();
  }

  fullsize.addEventListener('click', () => {
    const link = group[index];
    reachGoal('gallery_fullsize', { ship: link.dataset.ship, photo_id: link.dataset.photoId, source_id: fullsize.id });
  });

  prev.addEventListener('click', () => navigate(-1));
  next.addEventListener('click', () => navigate(1));
  close.addEventListener('click', () => dialog.close());
  let backdropPointer = false;
  dialog.addEventListener('pointerdown', event => { backdropPointer = event.target === dialog; });
  dialog.addEventListener('click', event => {
    if (backdropPointer && event.target === dialog) dialog.close();
    backdropPointer = false;
  });
  dialog.addEventListener('close', () => {
    request++;
    document.body.classList.remove('lightbox-open');
    image.hidden = true;
    image.removeAttribute('src');
    opener?.focus({ preventScroll: true });
  });
  dialog.addEventListener('keydown', event => {
    if (!dialog.open) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      navigate(event.key === 'ArrowLeft' ? -1 : 1);
    }
    if (event.key === 'Tab') {
      const controls = [...dialog.querySelectorAll('button:not(:disabled), a[href]')]
        .filter(element => element.getClientRects().length);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  });
})();
