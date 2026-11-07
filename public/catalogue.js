/* Scores catalogue: poster rail you pan left and right, with the chosen project's player and singles below.
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
  var rail = document.getElementById('rail');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };
  var items = [], active = -1, audio = new Audio(), current = -1;
  audio.preload = 'none';
  var N = PROJECTS.length;

  PROJECTS.forEach(function (p, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'poster' + (p.teaser ? ' teaser' : ''); b.setAttribute('role', 'option');
    var img = document.createElement('img');
    img.src = p.poster; img.alt = p.alt; img.draggable = false;
    var cap = document.createElement('span'); cap.className = 'pcap'; cap.textContent = p.title;
    b.appendChild(img); b.appendChild(cap); rail.appendChild(b); items.push(b);
    b.addEventListener('click', function () { if (!moved) setTarget(i); });
  });
  var soon = document.createElement('div');
  soon.className = 'poster soon'; soon.setAttribute('aria-hidden', 'true');
  soon.innerHTML = '<span>More<br>soon</span>';
  rail.appendChild(soon); items.push(soon);

  /* motion: pos is the (fractional) index in the middle of the rail and eases toward target */
  var pos = 0, target = 0, raf = 0, last = 0, dragging = false, moved = false;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function render() {
    var w = items[0].offsetWidth;
    items.forEach(function (it, i) {
      var d = i - pos, ad = Math.abs(d), sg = d < 0 ? -1 : 1, t = Math.min(ad, 1);
      var ease = t * t * (3 - 2 * t);
      var x = sg * (ease * w * 0.98 + Math.max(ad - 1, 0) * w * 0.5);
      var rot = -sg * (ease * 50 + Math.min(Math.max(ad - 1, 0), 1) * 8);
      var s = 1 - 0.1 * Math.min(ad, 2);
      it.style.transformOrigin = (50 - sg * 50 * ease).toFixed(1) + '% 50%';
      it.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0) rotateY(' + rot.toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')';
      it.style.opacity = (1 - 0.3 * Math.min(ad, 2.4) + (ad > 2.4 ? 0 : 0)).toFixed(3);
      it.style.zIndex = String(100 - Math.round(ad * 10));
      it.style.setProperty('--dim', (0.55 * ease).toFixed(3));
    });
  }
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    if (!dragging) pos += (target - pos) * (1 - Math.exp(-dt * (reduce ? 60 : 8)));
    render();
    if (dragging || Math.abs(target - pos) > 0.0008) raf = requestAnimationFrame(frame);
    else { pos = target; render(); raf = 0; }
  }
  function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function setTarget(i) {
    target = clamp(Math.round(i), 0, N - 1);
    select(target); kick();
  }

  /* drag or swipe */
  var sx = 0, spos = 0, vx = 0, lx = 0, lt = 0;
  function spacing() { return items[0].offsetWidth * 0.98; }
  rail.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true; moved = false; sx = lx = e.clientX; spos = pos; vx = 0; lt = performance.now();
    rail.classList.add('drag'); rail.setPointerCapture(e.pointerId); kick();
  });
  rail.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - sx;
    if (Math.abs(dx) > 5) moved = true;
    var now = performance.now(), dtm = Math.max(1, now - lt);
    vx = 0.8 * vx + 0.2 * ((e.clientX - lx) / dtm); lx = e.clientX; lt = now;
    var p = spos - dx / spacing();
    pos = p < 0 ? p * 0.35 : p > N - 1 ? (N - 1) + (p - (N - 1)) * 0.35 : p;
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

  /* trackpad sideways scroll */
  var wheelLock = 0;
  rail.addEventListener('wheel', function (e) {
    var dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
    if (!dx) return;
    e.preventDefault();
    var now = performance.now();
    if (now - wheelLock < 320 || Math.abs(dx) < 6) return;
    wheelLock = now; setTarget(target + (dx > 0 ? 1 : -1));
  }, { passive: false });

  rail.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); setTarget(target + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); setTarget(target - 1); }
  });
  $('cprev').addEventListener('click', function () { setTarget(target - 1); });
  $('cnext').addEventListener('click', function () { setTarget(target + 1); });

  function fmt(t) { t = Math.max(0, Math.floor(t || 0)); return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2); }
  function pad(n) { return ('0' + n).slice(-2); }

  function select(i) {
    if (i === active) return;
    active = i;
    var p = PROJECTS[i];
    items.forEach(function (it, k) { it.classList.toggle('on', k === i); it.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    $('ccount').textContent = pad(i + 1) + ' / ' + pad(PROJECTS.length);
    $('cprev').disabled = i === 0; $('cnext').disabled = i === PROJECTS.length - 1;
    var d = $('cdetail');
    d.classList.add('swap');
    var sb = $('scorebg'); if (sb) { if (p.bg) { sb.style.backgroundImage = 'url(' + p.bg + ')'; } sb.classList.toggle('on', !!p.bg); }
    setTimeout(function () {
      audio.pause(); current = -1; setPlaying(false);
      $('ckind').textContent = p.kind || '';
      $('ctitle').textContent = p.title;
      $('cmeta').textContent = p.meta || '';
      $('cmeta').hidden = !p.meta;
      $('ctext').textContent = p.text || '';
      var yt = (p.video || '').match(/(?:youtu\.be\/|v=)([\w-]{11})/);
      var vm = (p.video || '').match(/vimeo\.com\/(\d+)(?:\/(\w+))?/);
      var vid = yt || vm;
      $('cvideo').hidden = !vid;
      $('cnote').textContent = p.note || ''; $('cnote').hidden = !p.note;
      $('cframe').src = yt ? 'https://www.youtube-nocookie.com/embed/' + yt[1] + '?rel=0'
        : vm ? 'https://player.vimeo.com/video/' + vm[1] + (vm[2] ? '?h=' + vm[2] : '')
        : 'about:blank';
      if (yt) { $('cwatch').href = 'https://youtu.be/' + yt[1]; $('cwatch').textContent = 'Watch on YouTube'; }
      else if (vm) { $('cwatch').href = p.video; $('cwatch').textContent = 'Watch on Vimeo'; }
      var pl = document.querySelector('.cd-player'); if (pl) pl.hidden = !p.tracks.length;
      var ol = $('ctracks'); ol.innerHTML = '';
      if (!p.tracks.length) {
        var li = document.createElement('li'); li.className = 'empty'; li.textContent = 'Singles for this project are coming soon.'; ol.appendChild(li);
      }
      p.tracks.forEach(function (t, k) {
        var li = document.createElement('li');
        var b = document.createElement('button'); b.type = 'button'; b.className = 'trk';
        b.innerHTML = '<span class="tn"></span><span class="tt"></span><span class="td"></span>';
        b.children[0].textContent = pad(k + 1); b.children[1].textContent = t.title; b.children[2].textContent = t.duration || '';
        if (!t.src) b.disabled = true;
        b.addEventListener('click', function () { playTrack(k); });
        li.appendChild(b); ol.appendChild(li);
      });
      var first = p.tracks.some(function (t) { return t.src; });
      $('cplay').disabled = !first; $('cseek').disabled = !first; $('cseek').value = 0; $('cseek').style.setProperty('--p', '0%'); $('ctime').textContent = '0:00';
      d.classList.remove('swap');
    }, reduce ? 0 : 160);
  }

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

  window.addEventListener('resize', function () { render(); });
  render(); select(0);
})();

/* scores header: blurs and fades as the page scrolls down */
(function () {
  var head = document.getElementById('chead'); if (!head) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ticking = false;
  function update() {
    ticking = false;
    var p = Math.max(0, Math.min(1, window.scrollY / (window.innerHeight * 0.4)));
    head.style.filter = p < 0.01 ? '' : 'blur(' + (p * 14).toFixed(2) + 'px)';
    head.style.opacity = p < 0.01 ? '' : String((1 - p * 0.9).toFixed(3));
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

/* scores: hide the scroll cue the moment the page starts to move */
(function () {
  var cue = document.getElementById('scue'); if (!cue) return;
  function check() { cue.classList.toggle('gone', window.scrollY > 2); }
  window.addEventListener('scroll', check, { passive: true });
  check();
})();

/* scores: the details start blurred below the carousel and come into focus as you scroll down */
(function () {
  var det = document.getElementById('cdetail'); if (!det) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight;
    Array.prototype.forEach.call(det.children, function (el) {
      var r = el.getBoundingClientRect(); if (!r.height) return;
      var p = Math.max(0, Math.min(1, (r.top - vh * 0.45) / (vh * 0.5)));
      el.style.filter = p < 0.01 ? '' : 'blur(' + (p * 10).toFixed(2) + 'px)';
      el.style.opacity = p < 0.01 ? '' : String((1 - p * 0.55).toFixed(3));
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
