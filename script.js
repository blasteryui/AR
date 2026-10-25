(() => {
  'use strict';
  const config = window.LINK_HUB_CONFIG || {};
  const $ = id => document.getElementById(id);
  const isInstagram = /Instagram/i.test(navigator.userAgent);
  const isFacebook = /FBAN|FBAV|FB_IAB|FBIOS/i.test(navigator.userAgent);
  const isTikTok = /TikTok|BytedanceWebview|musical_ly/i.test(navigator.userAgent);
  const inAppBrowser = isInstagram || isFacebook || isTikTok;
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const iconPaths = {
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="6" r="1.1"/>',
    facebook: '<path d="M14.1 22v-8.2h2.8l.43-3.3h-3.23V8.4c0-.95.27-1.6 1.65-1.6h1.73V3.85A22 22 0 0 0 14.95 3c-2.55 0-4.3 1.55-4.3 4.4v3.1H7.8v3.3h2.85V22"/>',
    x: '<path d="M18.9 2.5h3.05l-6.65 7.6 7.8 11.4h-6.1l-4.78-7.04-6.17 7.04H3L10.13 13.3 2.6 2.5h6.27l4.32 6.34 5.71-6.34Zm-1.07 17h1.7L7.95 4.4H6.13Z"/>',
    tiktok: '<path d="M17.1 3c.4 2.75 1.92 4.37 4.4 4.58v3.6c-1.72.08-3.13-.42-4.4-1.42v5.61a6.2 6.2 0 1 1-6.16-6.2c.47 0 .97.05 1.42.17v3.62a2.58 2.58 0 1 0 1.1 2.1V2.5h3.64Z"/>',
    globe: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c4 5 4 13 0 18M12 3c-4 5-4 13 0 18" fill="none" stroke="currentColor" stroke-width="1.7"/>'
  };
  const safeURL = raw => {
    try { const url = new URL(raw); return /^https?:$/.test(url.protocol) ? url.href : null; }
    catch { return null; }
  };
  const safeAsset = raw => {
    try { const u = new URL(raw, window.location.href); return /^https?:$/.test(u.protocol) && (u.origin === window.location.origin || u.protocol === 'https:') ? u.href : null; }
    catch { return null; }
  };
  function icon(name) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor">${iconPaths[name] || iconPaths.globe}</svg>`;
  }
  const setText = (id, value) => { const el=$(id); if(el) el.textContent = value || ''; };
  setText('profile-name', config.name || 'Links');
  setText('profile-handle', `@${config.username || 'links'}`);
  document.title = `${config.name || 'Links'} | Links`;
  const description = $('profile-description');
  if (config.description) { description.textContent = config.description; description.hidden=false; }
  if (safeAsset(config.portrait)) {
    $('hero-image').src = safeAsset(config.portrait);
    $('page-backdrop').style.backgroundImage = `url(${JSON.stringify(safeAsset(config.portrait))})`;
  }
  let destination = null;
  let previousFocus = null;
  let entryPrompt = false;
  let noticeTimer;
  function notify(msg) {
    $('notice').textContent=msg;
    $('notice').classList.add('visible');
    clearTimeout(noticeTimer);
    noticeTimer=setTimeout(()=>$('notice').classList.remove('visible'),2400);
  }
  function closeModal() {
    $('browser-modal').hidden = true;
    document.body.style.overflow = '';
    if (previousFocus && previousFocus.isConnected) previousFocus.focus();
  }
  function showModal(url, fromEntry = false) {
    destination = safeURL(url);
    if (!destination) return;
    previousFocus = document.activeElement;
    entryPrompt = fromEntry;
    $('continue-here').href=fromEntry?'#':destination;
    $('browser-modal').hidden=false;
    document.body.style.overflow='hidden';
    $('external-open').focus();
  }
  // External-browser schemes are best effort; in-app browsers may block them.
  function externalOpen(url) {
    const target = safeURL(url);
    if (!target) return;
    if (isIOS && isInstagram) {
      window.location.href = 'instagram://extbrowser/?url=' + encodeURIComponent(target);
    } else if (isAndroid && inAppBrowser) {
      const dest = new URL(target);
      const path = dest.host + dest.pathname + dest.search;
      const intent = `intent://${path}#Intent;scheme=${dest.protocol.slice(0,-1)};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(target)};end`;
      window.location.href = intent;
    } else {
      window.open(target,'_blank','noopener,noreferrer');
    }
    if (inAppBrowser) notify('If nothing opens, tap Continue here or copy the link.');
  }
  function followLink(ev, url) {
    const normalized=safeURL(url);
    if (!normalized) {ev.preventDefault();return;}
    if (!inAppBrowser) return;
    ev.preventDefault();
    showModal(normalized);
  }
  function makeAnchor(url, cls, text, title) {
    const a=document.createElement('a');
    a.className=cls;a.href=url;a.target='_blank';a.rel='noopener noreferrer';
    a.setAttribute('aria-label',title||text||'Open link');
    a.addEventListener('click',e=>followLink(e,url));
    return a;
  }
  for (const item of (config.social||[])) {
    const url=safeURL(item.url);if(!url)continue;
    const link=makeAnchor(url,'social-link',null,`${item.label} (external link)`);
    link.innerHTML=icon(item.icon);
    link.title=item.label;
    $('social-links').appendChild(link);
  }
  for(const item of (config.links||[])) {
    const url=safeURL(item.url);if(!url)continue;
    const featured=item.type==='featured'&&safeAsset(item.image);
    const link=makeAnchor(url,featured?'feature-link':'standard-link',item.title,item.title);
    const title=document.createElement('span');title.className='link-title';title.textContent=item.title;
    if(featured) {
      const img=document.createElement('img');img.src=safeAsset(item.image);img.alt='';img.loading='lazy';
      link.appendChild(img);link.appendChild(title);
      const arrow=document.createElement('span');arrow.className='link-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';link.appendChild(arrow);
    } else {
      link.appendChild(title);
      const arrow=document.createElement('span');arrow.className='mini-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';link.appendChild(arrow);
    }
    $('link-list').appendChild(link);
  }
  if (!(config.links||[]).some(item=>safeURL(item.url))) $('link-list').textContent='Links coming soon.';
  $('external-open').addEventListener('click',()=>externalOpen(destination));
  $('continue-here').addEventListener('click',event=>{ if(entryPrompt) event.preventDefault(); closeModal(); });
  $('close-modal').addEventListener('click',closeModal);
  document.querySelector('[data-close-modal]').addEventListener('click',closeModal);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('browser-modal').hidden)closeModal()});
  $('copy-destination').addEventListener('click',async()=>{
    if(!destination)return;
    try {await navigator.clipboard.writeText(destination);notify('Link copied');}
    catch {notify('Press and hold the link to copy it.');}
  });
  async function share() {
    if(navigator.share)try{await navigator.share({title:document.title,url:window.location.href});return;}catch{}
    try{await navigator.clipboard.writeText(window.location.href);notify('Page link copied');}
    catch{notify('Copy the page address from your browser.');}
  }
  $('share-button').addEventListener('click',share);
  $('footer-share').addEventListener('click',share);
  if (inAppBrowser && config.promptOnEntry && /^https?:$/.test(window.location.protocol)) {
    setTimeout(() => { if ($('browser-modal').hidden) showModal(window.location.href, true); }, 450);
  }
})();