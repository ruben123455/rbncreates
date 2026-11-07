/* Media kit: brand gallery shows a first batch, "Show more" reveals the rest */
(function () {
  var btn = document.getElementById('bmore'), wrap = document.getElementById('bwrap');
  if (!btn || !wrap) return;
  var label = btn.querySelector('span');
  btn.addEventListener('click', function () {
    var open = wrap.classList.toggle('open');
    wrap.classList.toggle('collapsed', !open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    label.textContent = open ? 'Show less' : 'Show more';
    if (!open) wrap.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });
})();

/* media kit hero video: start 12s in (the clip is 24s long) and loop from there */
(function () {
  var v = document.querySelector('.mkbg');
  if (!v) return;
  var START = 12;
  function seek() { try { if (v.duration > START + 2 && v.currentTime < START - 0.5) v.currentTime = START; } catch (e) {} }
  v.addEventListener('loadedmetadata', seek);
  v.addEventListener('ended', function () { v.currentTime = START; v.play(); });
  v.addEventListener('timeupdate', function () { if (v.duration && v.currentTime > v.duration - 0.25) { v.currentTime = START; } });
})();

/* brand gallery: scroll reveal */
(function () {
  var wrap = document.getElementById('bwrap'), grid = document.getElementById('bgrid');
  if (!wrap || !grid) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  Array.prototype.forEach.call(grid.children, function (li, i) { li.style.setProperty('--d', Math.min(i, 11) * 70 + 'ms'); });
  wrap.classList.add('reveal');
  new IntersectionObserver(function (es, ob) {
    if (es[0].isIntersecting) { wrap.classList.add('in'); ob.disconnect(); }
  }, { threshold: 0.25 }).observe(wrap);
})();

/* the welcome section starts blurred below the hero and sharpens as it scrolls up */
(function () {
  var sec = document.querySelector('.mk-intro'); if (!sec) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var kids = Array.prototype.filter.call(sec.children, function (c) { return true; });
  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight, top = sec.getBoundingClientRect().top;
    var p = Math.max(0, Math.min(1, (top - vh * 0.3) / (vh * 0.55)));
    var f = p < 0.01 ? '' : 'blur(' + (p * 12).toFixed(2) + 'px)';
    var o = p < 0.01 ? '' : String((1 - p * 0.55).toFixed(3));
    kids.forEach(function (k) { k.style.filter = f; k.style.opacity = o; });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
