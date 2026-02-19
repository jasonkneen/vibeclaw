(function () {
  if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
  if (window.__clawdioMounted) return;
  window.__clawdioMounted = true;

  var BUBBLE = 72;   // bubble button diameter (px)
  var INSET  = 28;   // TinyClaw default: bubble is at bottom:28 right:28 inside the host

  function attachDrag(widget) {
    // TinyClaw sets host.id = 'tc-host'
    var host = document.getElementById('tc-host');
    if (!host) { console.warn('[clawdio] tc-host not found'); return; }

    // pos tracks the BUBBLE's visual position from screen edges
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem('tc-pos')); } catch(e) {}
    var pos = saved || { bottom: INSET, right: INSET };

    // Drag overlay — sits exactly over the bubble
    // z-index matches host (2147483647) but overlay is later in DOM so it wins
    var overlay = document.createElement('div');
    overlay.setAttribute('style', [
      'position:fixed',
      'width:'  + BUBBLE + 'px',
      'height:' + BUBBLE + 'px',
      'border-radius:50%',
      'cursor:grab',
      'z-index:2147483647',
      'touch-action:none',
      'pointer-events:all',
    ].join(';'));
    // Append AFTER host so same-z-index tiebreak goes to overlay
    document.body.appendChild(overlay);

    function applyPos() {
      // The host is a 0×0 anchor; bubble inside shadow DOM is at bottom:INSET right:INSET
      // So host must be offset by (pos - INSET) to place bubble at pos
      var hb = Math.max(0, pos.bottom - INSET);
      var hr = Math.max(0, pos.right  - INSET);
      host.style.bottom = hb + 'px';
      host.style.right  = hr + 'px';
      overlay.style.bottom = pos.bottom + 'px';
      overlay.style.right  = pos.right  + 'px';
    }
    applyPos();

    var active = false, didDrag = false;
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

      var W = window.innerWidth, H = window.innerHeight;
      pos.right  = Math.max(0, Math.min(W - BUBBLE, startRight  - dx));
      pos.bottom = Math.max(0, Math.min(H - BUBBLE, startBottom - dy));
      applyPos();
    });

    overlay.addEventListener('pointerup', function () {
      overlay.style.cursor = 'grab';
      active = false;
      if (didDrag) {
        try { localStorage.setItem('tc-pos', JSON.stringify(pos)); } catch(e) {}
      } else {
        // Tap — fire click on the real bubble button so TinyClaw toggles normally
        if (widget.bubbleBtn) {
          widget.bubbleBtn.click();
        } else {
          try { widget._toggle(); } catch(e) { try { widget.open(); } catch(e2) {} }
        }
      }
    });
  }

  function init() {
    var W = window.TinyClaw && window.TinyClaw.TinyClawWidget;
    if (!W) return;

    var widget = new W({ accent: '#ff5c5c', title: 'Clawdio', position: 'bottom-right' });
    widget.mount();

    // Give the host one frame to appear in the DOM then attach drag
    requestAnimationFrame(function () {
      setTimeout(function () { attachDrag(widget); }, 50);
    });

    // Re-open if was open on previous page
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
