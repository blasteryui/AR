(() => {
  'use strict';

  const config = window.LINK_HUB_CONFIG || {};
  const $ = id => document.getElementById(id);
  const iconPaths = {
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="6" r="1.1"/>',
    facebook: '<path d="M14.1 22v-8.2h2.8l.43-3.3h-3.23V8.4c0-.95.27-1.6 1.65-1.6h1.73V3.85A22 22 0 0 0 14.95 3c-2.55 0-4.3 1.55-4.3 4.4v3.1H7.8v3.3h2.85V22"/>',
    x: '<path d="M18.9 2.5h3.05l-6.65 7.6 7.8 11.4h-6.1l-4.78-7.04-6.17 7.04H3L10.13 13.3 2.6 2.5h6.27l4.32 6.34 5.71-6.34Zm-1.07 17h1.7L7.95 4.4H6.13Z"/>',
    tiktok: '<path d="M17.1 3c.4 2.75 1.92 4.37 4.4 4.58v3.6c-1.72.08-3.13-.42-4.4-1.42v5.61a6.2 6.2 0 1 1-6.16-6.2c.47 0 .97.05 1.42.17v3.62a2.58 2.58 0 1 0 1.1 2.1V2.5Z"/>',
    globe: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c4 5 4 13 0 18M12 3c-4 5-4 13 0 18" fill="none" stroke="currentColor" stroke-width="1.7"/>'
  };

  const safeURL = raw => {
    try { const u = new URL(raw); return /^https?:$/.test(u.protocol) ? u.href : null; }
    catch { return null; }
  };
  const safeAsset = raw => {
    try {
      const u = new URL(raw, window.location.href);
      return /^https?:$/.test(u.protocol) &&
        (u.origin === window.location.origin || u.protocol === 'https:') ? u.href : null;
    } catch { return null; }
  };

  $('profile-name').textContent = config.name || 'Links';
  $('profile-handle').textContent = '@' + (config.username || 'links');
  document.title = (config.name || 'Links') + ' | Links';

  if (config.description) {
    $('profile-description').textContent = config.description;
    $('profile-description').hidden = false;
  }

  const portrait = safeAsset(config.portrait);
  if (portrait) {
    $('hero-image').src = portrait;
    $('page-backdrop').style.backgroundImage = 'url(' + JSON.stringify(portrait) + ')';
  }

  for (const item of config.social || []) {
    const url = safeURL(item.url);
    if (!url) continue;
    const link = document.createElement('a');
    link.className = 'social-link';
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.title = item.label;
    link.setAttribute('aria-label', item.label + ' (external link)');
    link.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor">' +
      (iconPaths[item.icon] || iconPaths.globe) + '</svg>';
    $('social-links').appendChild(link);
  }

  let noticeTimer;
  function notify(message) {
    const el = $('notice');
    el.textContent = message;
    el.classList.add('visible');
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => el.classList.remove('visible'), 2400);
  }

  async function share() {
    if (navigator.share) {
      try { await navigator.share({title: document.title, url: window.location.href}); return; }
      catch {}
    }
    try { await navigator.clipboard.writeText(window.location.href); notify('Page link copied'); }
    catch { notify('Copy the page address from your browser.'); }
  }

  $('share-button').addEventListener('click', share);
  $('footer-share').addEventListener('click', share);
})();