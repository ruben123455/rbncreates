
(function () {
  var root = document.documentElement;
  var ink = getComputedStyle(root).getPropertyValue('--ink-rgb').trim() || '232,230,222';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function rgba(a) { return 'rgba(' + ink + ',' + a + ')'; }

  /* menu */
  var menu = document.getElementById('menu');
  var openBtn = document.getElementById('open');
  function setMenu(on) {
    menu.hidden = !on;
    openBtn.setAttribute('aria-expanded', on ? 'true' : 'false');
    document.body.style.overflow = on ? 'hidden' : '';
    if (on) document.getElementById('close').focus(); else openBtn.focus({ preventScroll: true });
  }
  openBtn.addEventListener('click', function () { setMenu(true); });
  document.getElementById('close').addEventListener('click', function () { setMenu(false); });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) { menu.hidden = true; openBtn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  /* sound: a quiet slow drone, started only on click */
  var soundBtn = document.getElementById('sound');
  var soundLabel = document.getElementById('soundlabel');
  var ac = null, master = null, soundOn = false;
  function buildAudio() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ac = new AC();
    master = ac.createGain();
    master.gain.value = 0;
    var filt = ac.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 700;
    var lfo = ac.createOscillator();
    var lfoGain = ac.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 320;
    lfo.connect(lfoGain); lfoGain.connect(filt.frequency); lfo.start();
    [110, 164.81, 220, 329.63, 493.88].forEach(function (f, i) {
      var o = ac.createOscillator();
      var g = ac.createGain();
      o.type = i % 2 ? 'triangle' : 'sine';
      o.frequency.value = f;
      o.detune.value = (i - 2) * 4;
      g.gain.value = 0.16 / (i + 1.5);
      o.connect(g); g.connect(filt); o.start();
    });
    filt.connect(master); master.connect(ac.destination);
    return true;
  }
  if (soundBtn) soundBtn.addEventListener('click', function () {
    try {
      if (!ac && !buildAudio()) return;
      soundOn = !soundOn;
      if (soundOn && ac.state === 'suspended') ac.resume();
      var now = ac.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(soundOn ? 0.5 : 0, now + 1.6);
      soundLabel.textContent = soundOn ? 'Sound on' : 'Sound off';
      soundBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
    } catch (err) { /* audio unavailable in this viewer */ }
  });

  /* generative drawings */
  function hash(i, j) { var v = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return v - Math.floor(v); }

  var scenes = {
    /* layered waveforms */
    wave: function (ctx, w, h, t) {
      var L = 20, step = Math.max(3, w / 220);
      ctx.lineWidth = 1;
      for (var k = 0; k < L; k++) {
        ctx.strokeStyle = rgba(0.12 + 0.42 * (1 - Math.abs(k - L / 2) / (L / 2)));
        ctx.beginPath();
        for (var x = 0; x <= w; x += step) {
          var env = Math.pow(Math.sin(Math.PI * x / w), 2);
          var y = h * 0.5 + (k - L / 2) * h * 0.017
            + env * h * 0.12 * (Math.sin(x * 0.011 + t * 0.5 + k * 0.35) + 0.5 * Math.sin(x * 0.027 - t * 0.35 + k * 0.8));
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    },

    /* pale salt-flat horizon: sky, ridge, plain, a slim tower and a lone figure */
    dawn: function (ctx, w, h) {
      var hz = h * 0.79, x, u;
      var sky = ctx.createLinearGradient(0, 0, 0, hz);
      sky.addColorStop(0, '#d8e6e1'); sky.addColorStop(0.65, '#e8eee6'); sky.addColorStop(1, '#f7efd8');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, hz + 1);
      var gr = ctx.createLinearGradient(0, hz, 0, h);
      gr.addColorStop(0, '#e3e9ee'); gr.addColorStop(1, '#f2f2ef');
      ctx.fillStyle = gr; ctx.fillRect(0, hz, w, h - hz);
      var mh = h * 0.07;
      var mg = ctx.createLinearGradient(0, hz - mh * 1.4, 0, hz);
      mg.addColorStop(0, '#8296bb'); mg.addColorStop(1, '#abbad3');
      ctx.fillStyle = mg; ctx.beginPath(); ctx.moveTo(0, hz);
      for (x = 0; x <= w; x += 4) {
        u = x / w;
        ctx.lineTo(x, hz - mh * (0.45 + 0.25 * Math.sin(u * 7 + 1) + 0.15 * Math.sin(u * 19 + 0.4) + 0.08 * Math.sin(u * 53)));
      }
      ctx.lineTo(w, hz); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(176,148,132,0.4)';
      ctx.beginPath(); ctx.ellipse(w * 0.6, hz + h * 0.035, w * 0.2, h * 0.022, 0, 0, Math.PI * 2); ctx.fill();
      var tx = w * 0.575, tw = Math.max(10, w * 0.022), top = h * 0.14, base = hz + h * 0.02;
      var sun = ctx.createRadialGradient(tx, top, 0, tx, top, h * 0.22);
      sun.addColorStop(0, 'rgba(255,246,225,0.75)'); sun.addColorStop(1, 'rgba(255,246,225,0)');
      ctx.fillStyle = sun; ctx.fillRect(0, 0, w, hz);
      var tg = ctx.createLinearGradient(tx - tw / 2, 0, tx + tw / 2, 0);
      tg.addColorStop(0, '#c9a99c'); tg.addColorStop(1, '#e9d8c3');
      ctx.fillStyle = tg; ctx.fillRect(tx - tw / 2, top, tw, base - top);
      ctx.fillStyle = '#d9d6cf'; ctx.fillRect(tx - tw * 1.2, base - h * 0.012, tw * 2.4, h * 0.02);
      var fx = w * 0.35, fy = hz + h * 0.05, fh = h * 0.035;
      ctx.fillStyle = '#55657e';
      ctx.fillRect(fx - 2.5, fy - fh * 0.8, 5, fh * 0.8);
      ctx.beginPath(); ctx.arc(fx, fy - fh * 0.9, 2.6, 0, Math.PI * 2); ctx.fill();
    },

    /* ripples spreading from a struck note */
    rings: function (ctx, w, h, t) {
      var cx = w * 0.5, cy = h * 0.5, R = Math.hypot(w, h) * 0.5, n = 11;
      ctx.lineWidth = 1;
      for (var k = 0; k < n; k++) {
        var f = ((t * 0.07 + k / n) % 1);
        ctx.strokeStyle = rgba(0.5 * (1 - f) * Math.min(1, f * 6));
        ctx.beginPath();
        for (var a = 0; a <= 140; a++) {
          var th = a / 140 * Math.PI * 2;
          var rr = R * f * (1 + 0.03 * Math.sin(th * 4 + t * 0.4 + k));
          var px = cx + Math.cos(th) * rr, py = cy + Math.sin(th) * rr * 0.62;
          if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    },

    /* spectrum bars */
    bars: function (ctx, w, h, t) {
      var n = Math.max(24, Math.floor(w / 18)), bw = w / n;
      ctx.lineWidth = 1;
      for (var i = 0; i < n; i++) {
        var u = i / n;
        var env = 0.25 + 0.75 * Math.sin(Math.PI * u);
        var v = 0.5 + 0.5 * Math.sin(i * 0.55 + t * 0.9) * Math.sin(i * 0.17 - t * 0.4);
        var bh = h * 0.42 * env * (0.2 + 0.8 * v * (0.6 + 0.4 * hash(i, 3)));
        var x = i * bw + bw / 2;
        ctx.strokeStyle = rgba(0.12 + 0.4 * env);
        ctx.beginPath();
        ctx.moveTo(x, h * 0.5 - bh); ctx.lineTo(x, h * 0.5 + bh);
        ctx.stroke();
      }
    },

    /* seven nodes, one per collaboration, joined by slowly shifting lines */
    network: function (ctx, w, h, t) {
      var n = 7, R = Math.min(w * 0.42, h * 0.4), cx = w * 0.5, cy = h * 0.5, pts = [];
      for (var i = 0; i < n; i++) {
        var a = i / n * Math.PI * 2 + t * 0.06;
        pts.push([cx + Math.cos(a) * R * 1.35 * (1 + 0.08 * Math.sin(t * 0.3 + i)), cy + Math.sin(a) * R * 0.85]);
      }
      ctx.lineWidth = 1;
      for (var p = 0; p < n; p++) for (var q = p + 1; q < n; q++) {
        ctx.strokeStyle = rgba(0.1 + 0.12 * Math.abs(Math.sin(t * 0.25 + p * 1.7 + q)));
        ctx.beginPath(); ctx.moveTo(pts[p][0], pts[p][1]); ctx.lineTo(pts[q][0], pts[q][1]); ctx.stroke();
      }
      ctx.fillStyle = rgba(0.7);
      pts.forEach(function (pt) { ctx.beginPath(); ctx.arc(pt[0], pt[1], 3, 0, Math.PI * 2); ctx.fill(); });
    }
  };

  var items = [];
  document.querySelectorAll('canvas[data-scene]').forEach(function (cv) {
    items.push({ cv: cv, ctx: cv.getContext('2d'), draw: scenes[cv.dataset.scene], vis: false, w: 0, h: 0, d: 1, stat: cv.dataset.scene === 'dawn' });
  });
  function size(it) {
    var r = it.cv.parentElement.getBoundingClientRect();
    it.d = Math.min(window.devicePixelRatio || 1, 2);
    it.w = Math.max(1, Math.round(r.width)); it.h = Math.max(1, Math.round(r.height));
    it.cv.width = it.w * it.d; it.cv.height = it.h * it.d;
  }
  function render(it, t) {
    it.ctx.setTransform(it.d, 0, 0, it.d, 0, 0);
    it.ctx.clearRect(0, 0, it.w, it.h);
    it.draw(it.ctx, it.w, it.h, t);
  }
  items.forEach(function (it) { size(it); render(it, 4); });
  var ro = new ResizeObserver(function () { items.forEach(function (it) { size(it); render(it, 4); }); });
  items.forEach(function (it) { ro.observe(it.cv.parentElement); });

  if (!reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { items.forEach(function (it) { if (it.cv.parentElement === e.target) it.vis = e.isIntersecting; }); });
    });
    items.forEach(function (it) { io.observe(it.cv.parentElement); });
    var t0 = performance.now();
    (function loop(now) {
      var t = (now - t0) / 1000 + 4;
      items.forEach(function (it) { if (it.vis && !it.stat) render(it, t); });
      requestAnimationFrame(loop);
    })(t0);
  }
})();

/* keep-scrolling cue: scrolls to the next section, hides at the end of the page */
(function () {
  var cue = document.querySelector('.keep2');
  if (!cue) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ids = ['name', 'collabs'];
  function update() {
    cue.classList.toggle('gone', window.scrollY > 4);
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
  cue.addEventListener('click', function (e) {
    e.preventDefault();
    for (var i = 0; i < ids.length; i++) {
      var n = document.getElementById(ids[i]);
      if (n && n.getBoundingClientRect().top > 80) {
        n.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollBy({ top: window.innerHeight * 0.8, behavior: reduce ? 'auto' : 'smooth' });
  });
})();
