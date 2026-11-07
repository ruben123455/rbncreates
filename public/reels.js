/* reels gallery: same physics and page-turn motion as the scores catalogue */
(function () {
  var rail = document.getElementById('rl'); if (!rail) return;
  var items = Array.prototype.slice.call(rail.children), N = items.length;
  var prev = document.getElementById('rprev'), next = document.getElementById('rnext');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pos = 0, target = 0, raf = 0, last = 0, dragging = false, moved = false, shown = -1;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function wrap(d) { return ((d % N) + N + N / 2) % N - N / 2; }
  function mod(i) { return ((i % N) + N) % N; }

  function stopOthers(cur) {
    items.forEach(function (c, i) {
      var v = c.querySelector('video');
      if (v && i !== cur && !v.paused) { v.pause(); }
      if (i !== cur) c.classList.remove('playing');
    });
  }
  function render() {
    var w = items[0].offsetWidth;
    items.forEach(function (it, i) {
      var d = wrap(i - pos), ad = Math.abs(d), sg = d < 0 ? -1 : 1, t = Math.min(ad, 1);
      var ease = t * t * (3 - 2 * t);
      var x = sg * (ease * w * 0.98 + Math.max(ad - 1, 0) * w * 0.5);
      var rot = -sg * (ease * 50 + Math.min(Math.max(ad - 1, 0), 1) * 8);
      var s = 1 - 0.1 * Math.min(ad, 2);
      it.style.transformOrigin = (50 - sg * 50 * ease).toFixed(1) + '% 50%';
      it.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0) rotateY(' + rot.toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')';
      it.style.opacity = (1 - 0.3 * Math.min(ad, 2.4)).toFixed(3);
      it.style.zIndex = String(100 - Math.round(ad * 10));
      it.style.setProperty('--dim', (0.5 * ease).toFixed(3));
      it.style.filter = ad < 0.02 ? 'none' : 'blur(' + (Math.min(ad, 1.2) * 5).toFixed(2) + 'px)';
      it.classList.toggle('active', ad < 0.5);
    });
    var cur = mod(Math.round(pos));
    if (cur !== shown) { shown = cur; stopOthers(cur); }
  }
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    if (!dragging) pos += (target - pos) * (1 - Math.exp(-dt * (reduce ? 60 : 8)));
    render();
    if (dragging || Math.abs(target - pos) > 0.0008) raf = requestAnimationFrame(frame);
    else { pos = target; render(); raf = 0; }
  }
  function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function setTarget(i) { target = Math.round(i); kick(); }

  var sx = 0, spos = 0, vx = 0, lx = 0, lt = 0;
  function spacing() { return items[0].offsetWidth * 0.98; }
  rail.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true; moved = false; sx = lx = e.clientX; spos = pos; vx = 0; lt = performance.now();
    rail.classList.add('drag'); try { rail.setPointerCapture(e.pointerId); } catch (_) {} kick();
  });
  rail.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - sx;
    if (Math.abs(dx) > 5) moved = true;
    var now = performance.now(), dtm = Math.max(1, now - lt);
    vx = 0.8 * vx + 0.2 * ((e.clientX - lx) / dtm); lx = e.clientX; lt = now;
    var p = spos - dx / spacing();
    pos = p;
    target = pos;
  });
  function release() {
    if (!dragging) return;
    dragging = false; rail.classList.remove('drag');
    var proj = pos - vx * 220 / spacing();
    setTarget(Math.round(clamp(proj, pos - 1, pos + 1)));
    setTimeout(function () { moved = false; }, 0);
  }
  rail.addEventListener('pointerup', release);
  rail.addEventListener('pointercancel', release);

  var wheelLock = 0;
  rail.addEventListener('wheel', function (e) {
    var dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
    if (!dx) return;
    e.preventDefault();
    var now = performance.now();
    if (now - wheelLock < 320 || Math.abs(dx) < 6) return;
    wheelLock = now; setTarget(target + (dx > 0 ? 1 : -1));
  }, { passive: false });

  rail.tabIndex = 0;
  rail.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); setTarget(target + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); setTarget(target - 1); }
  });
  if (prev) prev.addEventListener('click', function () { setTarget(target - 1); });
  if (next) next.addEventListener('click', function () { setTarget(target + 1); });

  items.forEach(function (c, i) {
    c.addEventListener('click', function () {
      if (moved) return;
      var dd = Math.round(wrap(i - Math.round(target)));
      if (dd !== 0) { setTarget(Math.round(target) + dd); return; }
      var v = c.querySelector('video'); if (!v) return;
      if (v.paused) { v.preload = 'auto'; v.play().then(function () { c.classList.add('playing'); }).catch(function () {}); }
      else { v.pause(); c.classList.remove('playing'); }
    });
  });
  window.addEventListener('resize', render);
  pos = target = Math.floor((N - 1) / 2); render();
})();
