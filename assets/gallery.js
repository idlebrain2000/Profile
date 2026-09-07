/* ==========================================================================
   Launch gallery carousel — srinimullapudi.com
   No dependencies. Reads window.LAUNCH_MEDIA (see assets/media.js).

   Load order in your HTML:
     <link rel="stylesheet" href="/assets/gallery.css">
     ...section markup...
     <script src="/assets/media.js"></script>
     <script src="/assets/gallery.js" defer></script>
   ========================================================================== */

(function () {
  'use strict';

  function init() {
    var track = document.getElementById('galleryTrack');
    var dots  = document.getElementById('galleryDots');
    var media = window.LAUNCH_MEDIA;

    if (!track) return;

    if (!Array.isArray(media) || media.length === 0) {
      // Nothing to show — hide the whole section rather than render an empty box.
      var section = track.closest('.gallery-section');
      if (section) section.hidden = true;
      return;
    }

    var slides = [];
    var dotEls = [];

    media.forEach(function (item, i) {
      var slide = buildSlide(item, track);
      if (!slide) return;
      track.appendChild(slide);
      slides.push(slide);

      if (dots) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'gallery-dot';
        dot.setAttribute('aria-label', 'Go to item ' + (i + 1) + ' of ' + media.length);
        dot.addEventListener('click', function () { scrollToSlide(track, slide); });
        dots.appendChild(dot);
        dotEls.push(dot);
      }
    });

    if (slides.length === 0) return;

    wireNav(track, slides);
    wireDots(track, slides, dotEls);
    wireKeyboard(track, slides);
  }

  /* --- slide construction ------------------------------------------------ */

  function buildSlide(item, track) {
    if (!item || !item.type) return null;

    var fig = document.createElement('figure');
    fig.className = 'gslide';

    var mediaEl;

    if (item.type === 'video') {
      if (!item.src) return null;
      mediaEl = document.createElement('video');
      mediaEl.src = item.src;
      if (item.poster) mediaEl.poster = item.poster;
      mediaEl.controls = true;
      mediaEl.preload = 'none';          // don't download until asked
      mediaEl.playsInline = true;
      mediaEl.setAttribute('playsinline', '');   // iOS Safari
      // Only one video plays at a time.
      mediaEl.addEventListener('play', function () {
        Array.prototype.forEach.call(
          track.querySelectorAll('video'),
          function (other) { if (other !== mediaEl) other.pause(); }
        );
      });

    } else if (item.type === 'youtube') {
      if (!item.id) return null;
      mediaEl = document.createElement('iframe');
      mediaEl.src = 'https://www.youtube-nocookie.com/embed/' + item.id;
      mediaEl.loading = 'lazy';
      mediaEl.allowFullscreen = true;
      mediaEl.title = item.caption || 'Video';
      mediaEl.setAttribute(
        'allow',
        'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
      );

    } else {
      if (!item.src) return null;
      mediaEl = document.createElement('img');
      mediaEl.src = item.src;
      mediaEl.loading = 'lazy';
      mediaEl.decoding = 'async';
      mediaEl.alt = item.caption || 'Book launch photograph';
    }

    fig.appendChild(mediaEl);

    if (item.caption) {
      var cap = document.createElement('figcaption');
      cap.className = 'gslide-cap';
      cap.textContent = item.caption;
      fig.appendChild(cap);
    }

    return fig;
  }

  /* --- behaviour --------------------------------------------------------- */

  function scrollToSlide(track, slide) {
    track.scrollTo({
      left: slide.offsetLeft - track.offsetLeft,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth'
    });
  }

  function step(track, slides, dir) {
    if (!slides.length) return;
    var gap = parseInt(getComputedStyle(track).columnGap || '14', 10) || 14;
    track.scrollBy({
      left: dir * (slides[0].offsetWidth + gap),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth'
    });
  }

  function wireNav(track, slides) {
    var prev = document.getElementById('galleryPrev');
    var next = document.getElementById('galleryNext');
    if (prev) prev.addEventListener('click', function () { step(track, slides, -1); });
    if (next) next.addEventListener('click', function () { step(track, slides,  1); });
  }

  function wireDots(track, slides, dotEls) {
    if (!dotEls.length) return;

    function mark(index) {
      dotEls.forEach(function (d, j) {
        d.setAttribute('aria-current', j === index ? 'true' : 'false');
      });
    }
    mark(0);

    if (!('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) mark(slides.indexOf(entry.target));
      });
    }, { root: track, threshold: 0.6 });

    slides.forEach(function (s) { io.observe(s); });
  }

  function wireKeyboard(track, slides) {
    track.tabIndex = 0;
    track.setAttribute('role', 'region');
    track.setAttribute('aria-label', 'Launch photos and videos');
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { step(track, slides,  1); e.preventDefault(); }
      if (e.key === 'ArrowLeft')  { step(track, slides, -1); e.preventDefault(); }
    });
  }

  function prefersReducedMotion() {
    return window.matchMedia &&
           window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* --- boot -------------------------------------------------------------- */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
