// ===== TruAim Marketing — interactions =====
(function () {
  // year
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // nav scrolled state
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // mobile menu
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () { links.classList.toggle('open'); });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  // scroll reveal
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // count-up stats
  function animateCount(el) {
    var to = parseFloat(el.getAttribute('data-to')) || 0;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(to * eased);
      el.textContent = prefix + val.toLocaleString('en-US') + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + to.toLocaleString('en-US') + suffix;
    }
    requestAnimationFrame(step);
  }
  var counts = document.querySelectorAll('.count');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counts.forEach(function (el) { cio.observe(el); });
  }
})();

// ===== Scroll-to-target arrows: shot from the foreground, recede into the target, stick & stack =====
(function(){
  var layer=document.getElementById('scrollfx');
  if(!layer) return;
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var TX=50, TY=40;            // target point (% of viewport) — matches .fx-target
  var N=26, arrows=[];
  for(var i=0;i<N;i++){
    // launch from the foreground: low and spread across the bottom, as if shot by the viewer
    var sx = 50 + (Math.random()*2-1)*42;     // % around center-bottom
    var sy = 104 + Math.random()*26;          // % below the fold (near the camera)
    // every arrow nails the bullseye — only a hair of spread so layered arrows stay visible
    var lx = (Math.random()*2-1)*11;          // px offset from target center
    var ly = (Math.random()*2-1)*9;
    var bigScale = 2.6 + Math.random()*1.8;   // large/near at launch
    var smallScale = 0.42 + Math.random()*0.34; // small/far when stuck
    // land progressively as you scroll, so the pile grows deeper down the page
    var base = (i/N)*0.86;
    var startP = base;
    var hitP = Math.min(base + 0.11 + Math.random()*0.05, 1);
    var el=document.createElement('div'); el.className='fx-arrow';
    layer.appendChild(el);
    arrows.push({el:el, sx:sx, sy:sy, lx:lx, ly:ly, big:bigScale, small:smallScale, startP:startP, hitP:hitP});
  }
  var vw=window.innerWidth, vh=window.innerHeight;
  function size(){ vw=window.innerWidth; vh=window.innerHeight; }
  var ticking=false;
  function update(){
    ticking=false;
    var max=document.documentElement.scrollHeight - vh;
    var p = max>0 ? Math.min(Math.max(window.scrollY/max,0),1) : 0;
    var txp = TX/100*vw, typ = TY/100*vh;
    for(var i=0;i<arrows.length;i++){
      var o=arrows[i];
      var lxp = txp + o.lx, lyp = typ + o.ly;        // landing point (px, far)
      var sxp = o.sx/100*vw, syp = o.sy/100*vh;       // launch point (px, near)
      var ang = Math.atan2(lyp - syp, lxp - sxp)*180/Math.PI;
      var t=(p-o.startP)/(o.hitP-o.startP);
      t = Math.min(Math.max(t,0),1);
      var e = 1-Math.pow(1-t,3);                      // ease-out: quick launch, settle into target
      var cx = sxp + (lxp - sxp)*e;
      var cy = syp + (lyp - syp)*e;
      var sc = o.big + (o.small - o.big)*e;            // recede: shrink as it flies away
      // brighter/closer at launch, settles to a subtle stuck arrow
      var op = (p < o.startP) ? 0 : (0.34 + 0.30*(1-e)) * Math.min(t*6,1);
      o.el.style.transform='translate('+cx+'px,'+cy+'px) rotate('+ang+'deg) scale('+sc+')';
      o.el.style.opacity=op;
    }
  }
  function onScroll(){ if(!ticking){ ticking=true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', function(){ size(); onScroll(); });
  size(); update();
})();
