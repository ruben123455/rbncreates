/* Scores page: a full-screen slideshow. Each project is one slide (poster, title, summary); Watch, Story and Listen open in a sheet on top.
   To add a project, add an entry to PROJECTS. Each track needs a title and, once you have the file, a src (mp3) and optional duration text. */
(function () {
  var PROJECTS = [
    {
      id: '10000',
      bg: 'scene-10000.jpg',
      poster: 'poster-10000.jpg',
      alt: 'Poster for 10,000 Days of Chasing My Dreams, starring Howard Shu',
      title: '10,000 Days of Chasing My Dreams',
      kind: 'Film score · Short film',
      meta: 'Playbook Creative · December 12',
      text: 'Original music for the film about two-time Olympic badminton player Howard Shu, directed by Lester Hung and produced by Chikku Raj.',
      video: 'https://youtu.be/Vr7kKUPgEE0',
      note: 'Working with the Playbook Creative team on this Olympic campaign was a true honor. It began with a brief, which we slowly shaped into music, step by step, letting the heart of Howard Shu\u2019s story echo through every note and theme. Each element of the story found its own voice in the score, and together they carry the feeling of the film from the first scene to the last. The result truly inspired me, and it\u2019s a piece I\u2019m proud of. Thank you, Chikku and Lester, for the chance to work on such a remarkable story.',
      tracks: [
        { title: 'Fork in the Road', src: 'fork-in-the-road.mp3', duration: '2:01' },
        { title: "It's an Obsession", src: 'its-an-obsession.mp3', duration: '1:06' },
        { title: 'A Kid from OC', src: 'a-kid-from-oc.mp3', duration: '1:04' },
        { title: '10,000 Days', src: '10000-days.mp3', duration: '0:29' }
      ]
    },
    {
      id: 'love',
      bg: 'scene-love.jpg',
      poster: 'poster-love.jpg',
      alt: 'Poster that reads Made with Love',
      title: 'Made with Love',
      kind: 'Score',
      meta: '',
      text: 'Original music for a short film directed by Nigel.',
      video: 'https://vimeo.com/1222400394/255af382ea',
      note: 'When Nigel, the director of this short film, first reached out to me, I knew within minutes that I wanted to be part of it. The story he shared was personal, tender and honest, the kind that stays with you long after you\u2019ve heard it, and I wanted my music to be the thing that carries it.\n\nWorking closely with Nigel, I set out to let the emotion lead and the score follow. Every note had to serve the story: quiet where the film needs room to breathe, warm where it needs to reach out to you.\n\nI\u2019m especially proud to share that the film will be participating in the Sundance Film Festival 2027. It\u2019s a real honor to see something made with so much heart travel that far. Thank you, Nigel, for trusting me with your story.',
      tracks: []
    },
    {
      id: 'rotterdam',
      bg: 'scene-rotterdam.jpg',
      poster: 'poster-new.jpg',
      alt: 'Still from Scattered & Confused: a woman with her eyes closed in front of a mirrored building',
      title: 'Scattered & Confused',
      kind: 'Score',
      meta: '',
      text: 'A campaign commissioned by Rotterdam to Save the Museumpark.',
      video: 'https://youtu.be/utGyDJZ2l1c',
      note: 'Scattered & Confused is a campaign commissioned by Rotterdam to Save the Museumpark. With the park set to become a green space, there will soon be no place left for the city\u2019s skaters, and their concerns have so far gone unheard.\n\nThe film gives the skating scene a voice. It draws attention to what Rotterdam stands to lose when a place that people have made their own quietly disappears, and invites the city to listen before it does.\n\nI wrote the music to carry that feeling: the energy of the people who use the park every day, and the weight of a place that may not be there much longer.',
      tracks: []
    },
    {
      id: 'freek',
      poster: 'poster-freek-blur.jpg',
      alt: 'Blurred poster for an upcoming project',
      title: 'Coming soon',
      kind: '',
      meta: '',
      text: 'Something new is on its way. More soon.',
      teaser: true,
      tracks: []
    }
  ];

  var root = document.getElementById('catalogue');
  if (!root) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };
  var main = $('cdetail'), acts = $('sseg'), sheet = $('ssheet');
  var active = -1, pane = '', opener = null, audio = new Audio(), current = -1;
  audio.preload = 'none';
  var N = PROJECTS.length;
  function pad(n) { return ('0' + n).slice(-2); }
  function fmt(t) { t = Math.max(0, Math.floor(t || 0)); return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2); }

  function panesFor(p) {
    var a = [];
    if (p.video) a.push('watch');
    if (p.note) a.push('story');
    if (p.tracks && p.tracks.length) a.push('listen');
    return a;
  }
  function frameFor(p) {
    var yt = (p.video || '').match(/(?:youtu\.be\/|v=)([\w-]{11})/);
    var vm = (p.video || '').match(/vimeo\.com\/(\d+)(?:\/(\w+))?/);
    if (yt) return { src: 'https://www.youtube-nocookie.com/embed/' + yt[1] + '?rel=0&autoplay=1', href: 'https://youtu.be/' + yt[1], label: 'Watch on YouTube' };
    if (vm) return { src: 'https://player.vimeo.com/video/' + vm[1] + (vm[2] ? '?h=' + vm[2] + '&autoplay=1' : '?autoplay=1'), href: p.video, label: 'Watch on Vimeo' };
    return null;
  }

  var bgs = [$('scorebg'), $('scorebg2')], bgi = 0, seq = 0, anims = [];
  function setBg(p) {
    var prev = bgs[bgi];
    if (p.bg) {
      bgi = 1 - bgi; var nx = bgs[bgi];
      nx.style.backgroundImage = 'url(' + p.bg + ')'; nx.classList.add('on');
      if (prev !== nx) prev.classList.remove('on');
    } else { bgs.forEach(function (x) { x.classList.remove('on'); }); }
  }
  function fill(p) {
    audio.pause(); current = -1; setPlaying(false);
    var im = $('spimg'); im.src = p.poster; im.alt = p.alt || p.title;
    $('spost').classList.toggle('teaser', !!p.teaser);
    $('ckind').textContent = p.kind || ''; $('ckind').hidden = !p.kind;
    $('ctitle').textContent = p.title;
    $('cmeta').textContent = p.meta || ''; $('cmeta').hidden = !p.meta;
    $('ctext').textContent = p.text || '';
    var f = frameFor(p);
    if (f) { $('cwatch').href = f.href; $('cwatch').textContent = f.label; }
    $('sshead').textContent = p.title;
    var nt = $('cnote'); nt.innerHTML = '';
    (p.note || '').split(/\n\n+/).forEach(function (para) { if (!para) return; var sp = document.createElement('p'); sp.textContent = para; nt.appendChild(sp); });
    var ol = $('ctracks'); ol.innerHTML = '';
    (p.tracks || []).forEach(function (t, k) {
      var li = document.createElement('li');
      var b = document.createElement('button'); b.type = 'button'; b.className = 'trk';
      b.innerHTML = '<span class="tn"></span><span class="tt"></span><span class="td"></span>';
      b.children[0].textContent = pad(k + 1); b.children[1].textContent = t.title; b.children[2].textContent = t.duration || '';
      if (!t.src) b.disabled = true;
      b.addEventListener('click', function () { playTrack(k); });
      li.appendChild(b); ol.appendChild(li);
    });
    var first = (p.tracks || []).some(function (t) { return t.src; });
    $('cplay').disabled = !first; $('cseek').disabled = !first; $('cseek').value = 0; $('cseek').style.setProperty('--p', '0%'); $('ctime').textContent = '0:00';
    var avail = panesFor(p);
    Array.prototype.forEach.call(acts.children, function (b) { b.hidden = avail.indexOf(b.getAttribute('data-p')) < 0; });
    acts.hidden = !avail.length;
  }
  function select(i, instant, d, fast) {
    i = Math.max(0, Math.min(N - 1, i));
    if (i === active) return;
    var dir = d || (i > active ? 1 : -1), first = active < 0;
    active = i;
    var p = PROJECTS[i], mine = ++seq;
    $('sfobL').classList.toggle('off', i === 0);
    setBg(p);
    var parts = [root.querySelector('.sl-copy'), $('spost')];
    anims.forEach(function (a) { a.cancel(); }); anims = [];
    if (reduce || instant || first || !parts[0].animate) { fill(p); return; }
    var EASE_IN = 'cubic-bezier(.5,0,.9,.4)', EASE_OUT = 'cubic-bezier(.16,.8,.2,1)';
    var outs = parts.map(function (el) {
      var a = el.animate([{ opacity: 1, transform: 'none', filter: 'blur(0px)' }, { opacity: 0, transform: 'translateX(' + (-dir * 90) + 'px)', filter: 'blur(18px)' }], { duration: fast ? 170 : 340, easing: EASE_IN, fill: 'forwards' });
      anims.push(a); return a.finished.catch(function () {});
    });
    Promise.all(outs).then(function () {
      if (mine !== seq) return;
      fill(p);
      anims.forEach(function (a) { a.cancel(); }); anims = [];
      parts.forEach(function (el, k) {
        var a = el.animate([{ opacity: 0, transform: 'translateX(' + (dir * 140) + 'px)', filter: 'blur(20px)' }, { opacity: 1, transform: 'none', filter: 'blur(0px)' }], { duration: fast ? 430 : 850, delay: k * (fast ? 50 : 110), easing: EASE_OUT, fill: 'backwards' });
        anims.push(a);
      });
    });
  }

  /* the sheet: video, story or singles over the slide */
  function openSheet(name, from) {
    pane = name; opener = from || null;
    Array.prototype.forEach.call(sheet.querySelectorAll('.sl-pane'), function (el) { el.classList.toggle('on', el.getAttribute('data-p') === name); });
    var f = frameFor(PROJECTS[active]);
    $('cframe').src = name === 'watch' && f ? f.src : 'about:blank';
    sheet.hidden = false; document.body.classList.add('sl-lock');
    requestAnimationFrame(function () { sheet.classList.add('on'); $('sclose').focus({ preventScroll: true }); });
  }
  function closeSheet() {
    if (sheet.hidden) return;
    sheet.classList.remove('on'); document.body.classList.remove('sl-lock');
    audio.pause(); $('cframe').src = 'about:blank';
    setTimeout(function () { sheet.hidden = true; }, reduce ? 0 : 280);
    if (opener) opener.focus({ preventScroll: true });
  }
  Array.prototype.forEach.call(acts.children, function (b) { b.addEventListener('click', function () { openSheet(b.getAttribute('data-p'), b); }); });
  $('sclose').addEventListener('click', closeSheet);
  sheet.addEventListener('click', function (e) { if (e.target === sheet || e.target.classList.contains('sl-sheet-in')) closeSheet(); });

  function setPlaying(on) {
    $('cplay').classList.toggle('on', on); $('cplay').setAttribute('aria-label', on ? 'Pause' : 'Play');
    Array.prototype.forEach.call(document.querySelectorAll('#ctracks .trk'), function (b, k) { b.classList.toggle('playing', on && k === current); });
  }
  function playTrack(k) {
    var t = PROJECTS[active].tracks[k];
    if (!t || !t.src) return;
    if (current === k && !audio.paused) { audio.pause(); return; }
    if (current !== k) { audio.src = t.src; current = k; }
    audio.play();
  }
  $('cplay').addEventListener('click', function () {
    if (current < 0) { var k = PROJECTS[active].tracks.findIndex(function (t) { return t.src; }); if (k >= 0) playTrack(k); }
    else if (audio.paused) audio.play(); else audio.pause();
  });
  audio.addEventListener('play', function () { setPlaying(true); });
  audio.addEventListener('pause', function () { setPlaying(false); });
  audio.addEventListener('ended', function () {
    var tr = PROJECTS[active].tracks, n = current + 1;
    while (n < tr.length && !tr[n].src) n++;
    if (n < tr.length) playTrack(n); else { current = -1; setPlaying(false); }
  });
  audio.addEventListener('timeupdate', function () {
    if (audio.duration) { $('cseek').value = Math.round(audio.currentTime / audio.duration * 1000); $('cseek').style.setProperty('--p', (audio.currentTime / audio.duration * 100).toFixed(2) + '%'); }
    $('ctime').textContent = fmt(audio.currentTime);
  });
  $('cseek').addEventListener('input', function () { if (audio.duration) { audio.currentTime = audio.duration * this.value / 1000; this.style.setProperty('--p', (this.value / 10) + '%'); } });
  document.addEventListener('scores:tab', function () { audio.pause(); closeSheet(); });

  var busy = false;
  /* past the last project: run back through them all to the start */
  function rewind() {
    if (busy || active <= 0) return;
    busy = true;
    (function step() {
      if (active <= 0) { busy = false; return; }
      select(active - 1, false, -1, true);
      setTimeout(step, 520);
    })();
  }
  function go(d) {
    if (busy) return;
    var n = active + d;
    if (n < 0) return;
    if (n >= N) { rewind(); return; }
    select(n, false, d);
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeSheet(); return; }
    if ($('view-film').hidden || !sheet.hidden) return;
    var t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'IFRAME')) return;
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  });
  /* swipe the slide */
  var sx = null, sy = 0;
  main.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; });
  main.addEventListener('pointerup', function (e) {
    if (sx === null) return; var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  });
  main.addEventListener('pointercancel', function () { sx = null; });

  /* trackpad: two-finger sideways swipe */
  var wlock = 0, wacc = 0, wt = 0;
  main.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    var now = performance.now();
    if (now - wt > 200) wacc = 0; wt = now;
    if (now < wlock) return;
    wacc += e.deltaX;
    if (Math.abs(wacc) > 60) { go(wacc > 0 ? 1 : -1); wacc = 0; wlock = now + 900; }
  }, { passive: false });

  /* pull pills on the edges: drag toward the middle to bring the next (right pill) or previous (left pill) project in */
  function makePill(fob, dirSign) {
    var pill = fob.querySelector('.sl-pull');
    var fx = 0, dragging = false, armed = false, moved = 0, MAXP = 130, TRIG = 84;
    function setPull(px) { pill.style.transform = 'translateX(' + (-dirSign * px) + 'px)' + (armed ? ' scaleX(1.9)' : ''); }
    pill.addEventListener('pointerdown', function (e) {
      dragging = true; armed = false; moved = 0; fx = e.clientX;
      fob.classList.remove('rel'); fob.classList.add('drag');
      pill.setPointerCapture(e.pointerId); e.preventDefault();
    });
    pill.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = Math.max(0, dirSign * (fx - e.clientX)); moved = Math.max(moved, dx);
      var px = dx < MAXP ? dx : MAXP + (dx - MAXP) * 0.15;
      armed = dx >= TRIG; fob.classList.toggle('armed', armed);
      setPull(px);
    });
    function drop(trigger) {
      if (!dragging) return;
      dragging = false; fob.classList.remove('drag', 'armed'); fob.classList.add('rel');
      var wasArmed = armed; armed = false; setPull(0);
      if (trigger && (wasArmed || moved < 6)) go(dirSign);
    }
    pill.addEventListener('pointerup', function () { drop(true); });
    pill.addEventListener('pointercancel', function () { drop(false); });
    pill.addEventListener('click', function (e) { if (e.detail === 0) go(dirSign); });
  }
  makePill($('sfobR'), 1);
  makePill($('sfobL'), -1);

  select(0, true);
})();

/* scores page: Film / Scores switch + the standalone tracks player.
   Add real tracks by filling in src (and duration) in SCORE_TRACKS below. */
(function () {
  var SCORE_TRACKS = [
    { title: 'Placeholder track 01', duration: '', src: '' },
    { title: 'Placeholder track 02', duration: '', src: '' },
    { title: 'Placeholder track 03', duration: '', src: '' },
    { title: 'Placeholder track 04', duration: '', src: '' },
    { title: 'Placeholder track 05', duration: '', src: '' },
    { title: 'Placeholder track 06', duration: '', src: '' },
    { title: 'Placeholder track 07', duration: '', src: '' },
    { title: 'Placeholder track 08', duration: '', src: '' }
  ];
  var $ = function (id) { return document.getElementById(id); };
  var a = new Audio(); a.preload = 'none';
  var cur = -1, ol = $('stracks'); if (!ol) return;
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function fmt(s) { s = Math.floor(s || 0); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  SCORE_TRACKS.forEach(function (t, k) {
    var li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button'; b.className = 'trk';
    b.innerHTML = '<span class="tn"></span><span class="tt"></span><span class="td"></span>';
    b.children[0].textContent = pad(k + 1); b.children[1].textContent = t.title; b.children[2].textContent = t.duration || '';
    b.addEventListener('click', function () { play(k); });
    li.appendChild(b); ol.appendChild(li);
  });
  var any = SCORE_TRACKS.some(function (t) { return t.src; });
  function setOn(on) {
    $('splay').classList.toggle('on', on); $('splay').setAttribute('aria-label', on ? 'Pause' : 'Play');
    Array.prototype.forEach.call(ol.querySelectorAll('.trk'), function (b, k) { b.classList.toggle('playing', on && k === cur); });
  }
  function play(k) {
    var t = SCORE_TRACKS[k]; if (!t || !t.src) return;
    if (cur === k && !a.paused) { a.pause(); return; }
    if (cur !== k) { a.src = t.src; cur = k; $('sseek').disabled = false; }
    a.play();
  }
  $('splay').addEventListener('click', function () {
    if (cur < 0) { var k = SCORE_TRACKS.findIndex(function (t) { return t.src; }); if (k >= 0) play(k); }
    else if (a.paused) a.play(); else a.pause();
  });
  a.addEventListener('play', function () { setOn(true); document.dispatchEvent(new Event('scores:play')); });
  a.addEventListener('pause', function () { setOn(false); });
  a.addEventListener('ended', function () { var n = cur + 1; if (SCORE_TRACKS[n] && SCORE_TRACKS[n].src) play(n); else setOn(false); });
  a.addEventListener('timeupdate', function () {
    if (a.duration) { $('sseek').value = Math.round(a.currentTime / a.duration * 1000); $('sseek').style.setProperty('--p', (a.currentTime / a.duration * 100).toFixed(2) + '%'); }
    $('stime').textContent = fmt(a.currentTime);
  });
  $('sseek').addEventListener('input', function () { if (a.duration) { a.currentTime = a.duration * this.value / 1000; this.style.setProperty('--p', (this.value / 10) + '%'); } });

  /* tab switch */
  var tabs = document.querySelectorAll('.st-tab');
  Array.prototype.forEach.call(tabs, function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-v');
      Array.prototype.forEach.call(tabs, function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
      Array.prototype.forEach.call(document.querySelectorAll('.st-intros p'), function (p) { p.classList.toggle('on', p.getAttribute('data-v') === v); });
      $('view-film').hidden = v !== 'film';
      $('view-scores').hidden = v !== 'scores';
      document.body.classList.toggle('is-scores', v === 'scores');
      a.pause(); document.dispatchEvent(new Event('scores:tab'));
      window.scrollTo(0, 0);
      requestAnimationFrame(function () { window.dispatchEvent(new Event('resize')); });
    });
  });
})();
