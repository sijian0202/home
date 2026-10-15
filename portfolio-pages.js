const deck = document.getElementById('portfolio-pages');
const pages = [...deck.querySelectorAll('.artwork, .experience')];
const labels = ['封面', '交互演示', '使用流程', '产品海报', '高保真模型', '使用场景', '视觉展示'];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if (!reducedMotion.matches) document.documentElement.classList.add('motion-enabled');
let current = 0;
let nextWheelAt = 0;
let motionCleanup = () => {};
let sharedTransition = false;
let flowStage;
let flowMotionId = 0;
const flowPage = pages[2];
const flowImage = flowPage.querySelector('img');
const posterPage = pages[3];
const posterImage = posterPage.querySelector('img');
let posterStage;
let posterMotionId = 0;
const pageMotions = new WeakMap();

const nav = document.createElement('nav');
nav.className = 'page-nav';
nav.setAttribute('aria-label', '作品集翻页');
nav.innerHTML = `<div class="page-dots">${labels.map((label, index) => `<button type="button" data-page="${index}" aria-label="第 ${index + 1} 页：${label}" title="${label}"></button>`).join('')}</div><span class="page-count sr-only" aria-live="polite"></span>`;
document.body.append(nav);
const dots = [...nav.querySelectorAll('[data-page]')];
const count = nav.querySelector('.page-count');

function animate(element, frames, options) {
  element.getAnimations().forEach(animation => animation.cancel());
  return element.animate(frames, { duration: 620, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both', ...options });
}

function markEntering(page) {
  page.classList.remove('is-entered');
  page.classList.add('is-entering');
}

function markEntered(page) {
  page.classList.add('is-entered');
  page.classList.remove('is-entering');
}

function resetArtwork(index) {
  const page = pages[index];
  if (index === 1) return;
  pageMotions.delete(page);
  if (index === 2) flowMotionId++;
  if (index === 3) posterMotionId++;
  page.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
  page.classList.remove('is-entered', 'is-entering', 'flow-finishing', 'poster-finishing');
  if (index === 2) page.classList.add('flow-rest');
  if (index === 3) page.classList.add('poster-rest');
}

function sampleBackground(image) {
  const sample = document.createElement('canvas');
  sample.width = sample.height = 1;
  const context = sample.getContext('2d');
  context.drawImage(image, 0, 0, 1, 1, 0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return `rgb(${r} ${g} ${b})`;
}

function prepareFlow() {
  flowStage = document.createElement('div');
  flowStage.className = 'flow-stage';
  flowStage.setAttribute('aria-hidden', 'true');
  flowStage.innerHTML = '<div class="flow-backdrop"></div><div class="flow-left"></div>';
  const boundaries = [350, 704, 1018, 1332, 1646, 1920];
  for (let index = 0; index < 5; index++) {
    const phone = document.createElement('div');
    const x = boundaries[index];
    const width = boundaries[index + 1] - x;
    phone.className = 'flow-phone';
    phone.dataset.phone = index;
    Object.assign(phone.style, { left: `${x / 1920 * 100}%`, width: `${width / 1920 * 100}%`, zIndex: 5 - Math.abs(index - 2) });
    phone.style.setProperty('--bg-width', `${1920 / width * 100}%`);
    phone.style.setProperty('--bg-x', `${x / (1920 - width) * 100}%`);
    flowStage.append(phone);
  }
  flowStage.style.backgroundColor = sampleBackground(flowImage);
  flowPage.append(flowStage);
  flowPage.classList.add('flow-ready', 'flow-rest');
}
flowImage.loading = 'eager';
flowImage.decode().then(prepareFlow).catch(() => { /* Retain the original artwork if layer preparation fails. */ });

async function preparePoster() {
  const assets = ['./portfolio/poster-phone-group.png', './portfolio/poster-phone-mask.png'];
  await Promise.all(assets.map(src => { const image = new Image(); image.src = src; return image.decode(); }));
  posterStage = document.createElement('div');
  posterStage.className = 'poster-stage';
  posterStage.setAttribute('aria-hidden', 'true');
  posterStage.style.backgroundColor = sampleBackground(posterImage);
  posterStage.innerHTML = '<div class="poster-copy"></div><div class="poster-details"></div><div class="poster-shadow"></div><div class="poster-phones"><div class="poster-phone poster-phone-left"></div><div class="poster-phone poster-phone-right"></div><div class="poster-phone poster-phone-center"></div></div>';
  posterPage.append(posterStage);
  posterPage.classList.add('poster-ready', 'poster-rest');
}
posterImage.loading = 'eager';
posterImage.decode().then(preparePoster).catch(() => {});

function revealArtwork(index) {
  if (reducedMotion.matches || index === 1) return;
  const page = pages[index];
  if (page.classList.contains('is-entering')) return;
  if (index === 2 && flowStage) {
    revealFlow();
    return;
  }
  if (index === 3 && posterStage) { revealPoster(); return; }
  const image = pages[index].querySelector(':scope > img');
  if (image) {
    const motion = animate(image, [{ opacity: 0, transform: 'translateY(22px) scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 650 });
    pageMotions.set(page, motion);
    markEntering(page);
    motion.finished.then(() => {
      if (pageMotions.get(page) !== motion) return;
      markEntered(page);
      motion.cancel();
    }).catch(() => {});
  }
}

async function finishLayers(page, stage, kind, isCurrent) {
  if (!isCurrent()) return;
  page.classList.add(`${kind}-finishing`);
  const fade = animate(stage, [{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: 'linear' });
  try { await fade.finished; } catch { return; }
  if (!isCurrent()) return;
  page.classList.add(`${kind}-rest`);
  markEntered(page);
  page.classList.remove(`${kind}-finishing`);
  fade.cancel();
}

function revealPoster() {
  const motionId = ++posterMotionId;
  posterStage.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
  posterPage.classList.remove('poster-rest', 'poster-finishing');
  const width = posterStage.getBoundingClientRect().width;
  const animations = [
    animate(posterStage.querySelector('.poster-copy'), [{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'none' }], { duration: 850 }),
    animate(posterStage.querySelector('.poster-details'), [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { delay: 200, duration: 650 }),
    animate(posterStage.querySelector('.poster-shadow'), [{ opacity: 0 }, { opacity: 1 }], { delay: 670, duration: 400 }),
    animate(posterStage.querySelector('.poster-phone-center'), [{ opacity: 0, transform: 'translateY(20px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 520 }),
    animate(posterStage.querySelector('.poster-phone-left'), [
      { opacity: 0, transform: `translateX(${width * .16}px) rotate(17deg) scale(.94)` },
      { opacity: 1, transform: 'translateX(0) rotate(0deg) scale(1)' }
    ], { delay: 170, duration: 900 }),
    animate(posterStage.querySelector('.poster-phone-right'), [
      { opacity: 0, transform: `translateX(${-width * .16}px) rotate(-13deg) scale(.94)` },
      { opacity: 1, transform: 'translateX(0) rotate(0deg) scale(1)' }
    ], { delay: 170, duration: 900 })
  ];
  markEntering(posterPage);
  Promise.all(animations.map(animation => animation.finished)).then(() => finishLayers(posterPage, posterStage, 'poster', () => posterMotionId === motionId)).catch(() => {});
}

function revealFlow(delay = 0, hideLeft = false) {
  const motionId = ++flowMotionId;
  flowStage.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
  flowPage.classList.remove('flow-rest', 'flow-finishing');
  const scale = flowStage.getBoundingClientRect().width / 1920;
  const animations = [];
  animations.push(animate(flowStage.querySelector('.flow-backdrop'), [
    { opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }
  ], { delay: delay + 330, duration: hideLeft ? 590 : 480, fill: 'backwards' }));
  const left = flowStage.querySelector('.flow-left');
  animations.push(animate(left, [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], {
    delay: delay + (hideLeft ? 800 : 100), duration: hideLeft ? 120 : 600, fill: 'backwards'
  }));
  const center = 1175;
  [...flowStage.querySelectorAll('.flow-phone')].forEach((phone, index) => {
    const distance = Math.abs(index - 2);
    const ownCenter = (parseFloat(phone.style.left) + parseFloat(phone.style.width) / 2) / 100 * 1920;
    animations.push(animate(phone, [
      { opacity: 0, transform: `translate(${(center - ownCenter) * scale}px, 24px) scale(.93)` },
      { opacity: 1, transform: 'translate(0, 0) scale(1)' }
    ], { delay: delay + (distance === 0 ? 0 : 100 + distance * 95), duration: distance === 0 ? 480 : 650, fill: 'backwards' }));
  });
  markEntering(flowPage);
  Promise.all(animations.map(animation => animation.finished)).then(() => finishLayers(flowPage, flowStage, 'flow', () => flowMotionId === motionId)).catch(() => {});
  return animations;
}

function transitionFromDemo() {
  const frame = pages[1].querySelector('iframe');
  const source = frame.contentDocument?.querySelector('.brand-art');
  const sourceRect = source?.getBoundingClientRect();
  if (!flowStage || !sourceRect?.width || frame.contentWindow.getComputedStyle(source.closest('.brand-ticket')).display === 'none') return false;
  const frameRect = frame.getBoundingClientRect();
  const destination = flowStage.getBoundingClientRect();
  const finalTop = destination.top - (flowPage.offsetTop - deck.scrollTop);
  const finalWidth = destination.width * 350 / 1920;
  const flight = document.createElement('div');
  flight.className = 'ticket-flight';
  flight.setAttribute('aria-hidden', 'true');
  Object.assign(flight.style, { left: `${destination.left}px`, top: `${finalTop}px`, width: `${finalWidth}px`, height: `${destination.height}px` });
  flight.innerHTML = '<div class="ticket-flight-source"><img src="./brand-receipt.png" alt=""></div><div class="ticket-flight-target"></div>';
  document.body.append(flight);
  const sourceX = frameRect.left + sourceRect.left;
  const sourceY = frameRect.top + sourceRect.top;
  const animations = [
    animate(pages[1], [{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' }),
    animate(flight, [
      { transform: `translate(${sourceX - destination.left}px, ${sourceY - finalTop}px) scale(${sourceRect.width / finalWidth}, ${sourceRect.height / destination.height})` },
      { transform: 'translate(0, 0) scale(1)' }
    ], { duration: 1100, fill: 'both' }),
    animate(flight.querySelector('.ticket-flight-source'), [{ opacity: 1 }, { opacity: 0 }], { delay: 250, duration: 400, fill: 'forwards' }),
    animate(flight.querySelector('.ticket-flight-target'), [{ opacity: 0 }, { opacity: 1 }], { delay: 250, duration: 400, fill: 'both' }),
    ...revealFlow(180, true)
  ];
  sharedTransition = true;
  const jump = setTimeout(() => { deck.scrollTo({ top: flowPage.offsetTop, behavior: 'instant' }); update(2); }, 180);
  const done = setTimeout(() => { cleanup(); }, 1460);
  function cleanup() {
    clearTimeout(jump); clearTimeout(done);
    animations.forEach(animation => animation.cancel());
    flowPage.classList.add('flow-rest');
    flowPage.classList.remove('flow-finishing');
    markEntered(flowPage);
    flight.remove();
    sharedTransition = false;
    motionCleanup = () => {};
  }
  motionCleanup = cleanup;
  return true;
}

function update(index) {
  current = index;
  dots.forEach((dot, position) => {
    if (position === index) dot.setAttribute('aria-current', 'page');
    else dot.removeAttribute('aria-current');
  });
  count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(pages.length).padStart(2, '0')}`;
}

function goTo(index, smooth = true) {
  const target = Math.max(0, Math.min(pages.length - 1, index));
  const from = current;
  motionCleanup();
  if (target === 2 && from === 1 && !reducedMotion.matches && transitionFromDemo()) return;
  if (target !== from) revealArtwork(target);
  deck.scrollTo({ top: pages[target].offsetTop, behavior: smooth && !reducedMotion.matches ? 'smooth' : 'instant' });
}

dots.forEach((dot, index) => dot.addEventListener('click', () => goTo(index, false)));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const index = pages.indexOf(entry.target);
    if (!entry.isIntersecting && index !== current && !sharedTransition) resetArtwork(index);
  });
  const visible = entries.filter(entry => entry.isIntersecting && entry.intersectionRatio >= .55);
  if (visible.length && !sharedTransition) {
    const index = pages.indexOf(visible[0].target);
    if (index !== current && !pages[index].classList.contains('is-entering')) revealArtwork(index);
    update(index);
  }
}, { root: deck, threshold: [0, .55] });
pages.forEach(page => observer.observe(page));

// Interactive areas never hand their scroll gestures to portfolio pagination.
function isDemoInteraction(event, doc) {
  return doc !== document && event.composedPath().some(element =>
    element?.nodeType === 1 && element.matches('.device-frame, #app, .demo-entry, .project-notes, .project-dialog, .project-mobile-bar')
  );
}

function hasScrollableContent(event, doc, deltaY = event.deltaY) {
  return event.composedPath().some(element => {
    if (!element || element.nodeType !== 1 || element === doc.body || element === doc.documentElement) return false;
    const style = doc.defaultView.getComputedStyle(element);
    if (!/auto|scroll/.test(style.overflowY)) return false;
    return deltaY > 0 ? element.scrollTop + element.clientHeight < element.scrollHeight - 2 : element.scrollTop > 2;
  });
}

function onWheel(event, doc = document) {
  if (event.ctrlKey || Math.abs(event.deltaY) < Math.abs(event.deltaX) || Math.abs(event.deltaY) < 2) return;
  if (isDemoInteraction(event, doc)) {
    event.stopPropagation();
    if (!hasScrollableContent(event, doc)) event.preventDefault();
    return;
  }
  if (doc !== document && (doc.querySelector('.sheet-backdrop, .menu.open, dialog[open]') || hasScrollableContent(event, doc))) return;
  event.preventDefault();
  const now = performance.now();
  if (now < nextWheelAt || sharedTransition) return;
  nextWheelAt = now + 850;
  goTo(current + Math.sign(event.deltaY));
}
document.addEventListener('wheel', event => onWheel(event), { passive: false });
const demo = deck.querySelector('iframe');
const boundDocuments = new WeakSet();
function bindDemoWheel() {
  const doc = demo.contentDocument;
  if (!doc || boundDocuments.has(doc)) return;
  boundDocuments.add(doc);
  doc.addEventListener('wheel', event => onWheel(event, doc), { passive: false });
  doc.querySelectorAll('.project-notes, .project-dialog').forEach(element => {
    element.style.overscrollBehaviorY = 'contain';
  });
  let touchGesture;
  doc.addEventListener('touchstart', event => {
    const touch = event.touches.length === 1 ? event.touches[0] : null;
    touchGesture = touch && isDemoInteraction(event, doc) ? { x: touch.clientX, y: touch.clientY } : null;
  }, { passive: true });
  doc.addEventListener('touchmove', event => {
    if (!touchGesture || event.touches.length !== 1) return;
    const touch = event.touches[0];
    const deltaY = touchGesture.y - touch.clientY;
    const deltaX = touchGesture.x - touch.clientX;
    touchGesture = { x: touch.clientX, y: touch.clientY };
    if (Math.abs(deltaY) <= Math.abs(deltaX)) return;
    event.stopPropagation();
    if (event.cancelable && !hasScrollableContent(event, doc, deltaY)) event.preventDefault();
  }, { passive: false });
  const endTouch = () => { touchGesture = null; };
  doc.addEventListener('touchend', endTouch, { passive: true });
  doc.addEventListener('touchcancel', endTouch, { passive: true });
}
demo.addEventListener('load', bindDemoWheel);
if (demo.contentDocument?.readyState === 'complete') bindDemoWheel();

document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
  const offsets = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 };
  if (event.key in offsets) { event.preventDefault(); goTo(current + offsets[event.key]); }
  else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault(); goTo(event.key === 'Home' ? 0 : pages.length - 1);
  }
});

const resizeObserver = new ResizeObserver(() => {
  motionCleanup();
  deck.scrollTo({ top: pages[current].offsetTop, behavior: 'instant' });
});
resizeObserver.observe(deck);
update(0);
