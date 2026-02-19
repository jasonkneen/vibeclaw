(function () {
  if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
  if (window.__clawdioMounted) return;
  window.__clawdioMounted = true;

  var BUBBLE  = 72;   // px — bubble diameter
  var PADDING = 28;   // px — default inset from edge (matches TinyClaw default)

  /* ── Restore / default position ── */
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem('tc-pos')); } catch(e) {}
  var pos = saved || { bottom: PADDING, right: PADDING };

  /* ── Make the host draggable once it's in the DOM ── */
  function attachDrag(widget) {
    /* TinyClaw appends a fixed host element — find it */
    var host = null;
    var all = document.querySelectorAll('body > div');
    for (var i = 0; i < all.length; i++) {
      var s = window.getComputedStyle(all[i]);
      if (s.position === 'fixed' && s.width === '0px') { host = all[i]; break; }
    }
    if (!host) return;

    /* Apply saved / default position to the host */
    host.style.bottom = pos.bottom + 'px';
    host.style.right  = pos.right  + 'px';

    /* Invisible drag overlay — sits exactly over the bubble */
    var overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:fixed',
      'width:'  + BUBBLE + 'px',
      'height:' + BUBBLE + 'px',
      'bottom:' + pos.bottom + 'px',
      'right:'  + pos.right  + 'px',
      'border-radius:50%',
      'cursor:grab',
      'z-index:2147483646',  /* just below TinyClaw's own z-index */
      'touch-action:none',
    ].join(';');
    document.body.appendChild(overlay);

    /* ── Drag state ── */
    var active   = false;
    var didDrag  = false;
    var startCX, startCY, startBottom, startRight;

    overlay.addEventListener('pointerdown', function (e) {
      overlay.setPointerCapture(e.pointerId);
      active      = true;
      didDrag     = false;
      startCX     = e.clientX;
      startCY     = e.clientY;
      startBottom = pos.bottom;
      startRight  = pos.right;
      overlay.style.cursor = 'grabbing';
      e.preventDefault();
    });

    overlay.addEventListener('pointermove', function (e) {
      if (!active) return;
      var dx = e.clientX - startCX;
      var dy = e.clientY - startCY;
      if (!didDrag && Math.hypot(dx, dy) < 6) return;
      didDrag = true;

      var W = window.innerWidth,  H = window.innerHeight;
      pos.right  = Math.max(0, Math.min(W - BUBBLE, startRight  - dx));
      pos.bottom = Math.max(0, Math.min(H - BUBBLE, startBottom - dy));

      host.style.right    = pos.right  + 'px';
      host.style.bottom   = pos.bottom + 'px';
      overlay.style.right  = pos.right  + 'px';
      overlay.style.bottom = pos.bottom + 'px';
    });

    overlay.addEventListener('pointerup', function (e) {
      overlay.style.cursor = 'grab';
      active = false;
      if (didDrag) {
        /* Persist position */
        try { localStorage.setItem('tc-pos', JSON.stringify(pos)); } catch(e) {}
      } else {
        /* Short tap → toggle the chat window */
        try { widget.toggle(); } catch(err) {}
      }
    });
  }

  /* ── Init ── */
  function init() {
    var W = window.TinyClaw && window.TinyClaw.TinyClawWidget;
    if (!W) return;

    var widget = new W({ accent: '#ff5c5c', title: 'Clawdio', position: 'bottom-right' });
    widget.mount();

    /* Wait a tick for the host to appear then attach drag */
    setTimeout(function () { attachDrag(widget); }, 100);

    /* Re-open if was open on previous page */
    if (localStorage.getItem('tc-open') === '1') {
      var attempts = 0;
      var poll = setInterval(function () {
        attempts++;
        try { widget.open(); clearInterval(poll); } catch (e) {}
        if (attempts > 40) clearInterval(poll);
      }, 250);
    }
  }

  if (window.TinyClaw) {
    init();
  } else {
    var s = document.createElement('script');
    s.src = '/tinyclaw-widget.js';
    s.onload = init;
    document.head.appendChild(s);
  }
})();
